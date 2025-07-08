const express = require("express");
const path = require("path");
const { Pool } = require("pg");
const app = express();
const porta = 3000;
require("dotenv").config();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false },
});

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/tarefas", async (req, res) => {
	try {
		const resultado = await pool.query("SELECT * FROM tarefas ORDER BY ordem");
		const tarefasFormatadas = resultado.rows.map((tarefa) => ({
			...tarefa,
			criadaEm: tarefa.criadaem ? tarefa.criadaem.toISOString() : null,
			finalizadaEm: tarefa.finalizadaem ? tarefa.finalizadaem.toISOString() : null,
		}));
		res.json(tarefasFormatadas);
	} catch (err) {
		console.error("Erro ao buscar tarefas:", err);
		res.status(500).json({ erro: "Erro ao buscar tarefas" });
	}
});

app.post("/adicionar", async (req, res) => {
	const nome = req.body.nomeNovaTarefa?.trim();
	if (!nome) return res.status(400).json({ erro: "Nome obrigatório" });

	try {
		const verifica = await pool.query("SELECT 1 FROM tarefas WHERE LOWER(nome) = LOWER($1)", [nome]);
		if (verifica.rowCount > 0) return res.status(409).json({ erro: "Tarefa já existe" });

		await pool.query("INSERT INTO tarefas (nome, finalizada, criadaEm) VALUES ($1, false, NOW())", [nome]);
		res.sendStatus(201);
	} catch {
		res.sendStatus(500);
	}
});

app.post("/editar", async (req, res) => {
	const { nomeAntigo, nomeNovo } = req.body;
	if (!nomeAntigo || !nomeNovo) return res.sendStatus(400);

	try {
		const resultado = await pool.query("SELECT * FROM tarefas WHERE nome = $1 LIMIT 1", [nomeAntigo]);
		if (resultado.rowCount === 0) return res.status(404).json({ erro: "Tarefa não encontrada" });

		const tarefa = resultado.rows[0];
		const baseNome = nomeNovo.trim();
		let contador = 1;
		let nomeTentado = baseNome;

		while (true) {
			const existe = await pool.query("SELECT 1 FROM tarefas WHERE LOWER(nome) = LOWER($1) AND id != $2", [nomeTentado, tarefa.id]);
			if (existe.rowCount === 0) break;
			nomeTentado = `${baseNome} (${contador++})`;
		}

		await pool.query("UPDATE tarefas SET nome = $1 WHERE id = $2", [nomeTentado, tarefa.id]);
		res.sendStatus(200);
	} catch {
		res.sendStatus(500);
	}
});

app.post("/mudarStatus", async (req, res) => {
	const { nomeTarefa } = req.body;
	if (!nomeTarefa) return res.sendStatus(400);

	try {
		const resultado = await pool.query("SELECT * FROM tarefas WHERE nome = $1", [nomeTarefa]);
		if (resultado.rowCount === 0) return res.status(404).json({ erro: "Tarefa não encontrada" });

		const tarefa = resultado.rows[0];
		const finalizada = !tarefa.finalizada;

		let nome = tarefa.nome.replace(" ✅", "").trim();
		const baseNome = nome;
		let contador = 1;
		let nomeTentado = baseNome;

		while (true) {
			const existe = await pool.query("SELECT 1 FROM tarefas WHERE LOWER(nome) = LOWER($1) AND id != $2", [finalizada ? nomeTentado + " ✅" : nomeTentado, tarefa.id]);
			if (existe.rowCount === 0) break;
			nomeTentado = `${baseNome} (${contador++})`;
		}

		if (finalizada) {
			nome = nomeTentado + " ✅";
		} else {
			nome = nomeTentado;
		}

		const finalizadaEm = finalizada ? new Date().toISOString() : null;

		await pool.query("UPDATE tarefas SET finalizada = $1, nome = $2, finalizadaEm = $3 WHERE id = $4", [finalizada, nome, finalizadaEm, tarefa.id]);

		res.sendStatus(200);
	} catch {
		res.sendStatus(500);
	}
});

app.post("/reordenar", async (req, res) => {
	const { ordem } = req.body;
	if (!Array.isArray(ordem)) return res.sendStatus(400);

	try {
		for (let i = 0; i < ordem.length; i++) {
			await pool.query("UPDATE tarefas SET ordem = $1 WHERE nome = $2", [i, ordem[i]]);
		}
		res.sendStatus(200);
	} catch {
		res.sendStatus(500);
	}
});

app.delete("/excluirFinalizadas", async (req, res) => {
	try {
		await pool.query("DELETE FROM tarefas WHERE finalizada = true");
		res.sendStatus(200);
	} catch {
		res.sendStatus(500);
	}
});

app.listen(porta, () => {
	console.log(`Servidor rodando em http://localhost:${porta}`);
});
