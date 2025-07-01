const express = require('express')
const path = require('path')
const app = express()
const porta = 3000

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// Início código to do list

let tarefas = [
	{ nome: '01', finalizada: false, criadaEm: new Date() },
	{ nome: '02', finalizada: false, criadaEm: new Date() },
	{ nome: '03', finalizada: false, criadaEm: new Date() },
	{ nome: '04', finalizada: false, criadaEm: new Date() },
	{ nome: '05', finalizada: false, criadaEm: new Date() }
]

app.get('/tarefas', (req, res) => {
	res.json(tarefas)
})

app.post('/adicionar', (req, res) => {
	const nomeTarefa = req.body.nomeNovaTarefa?.trim()
	if (!nomeTarefa) {
		return res.status(400).json({ erro: 'Nome da tarefa é obrigatório.' })
	}

	const jaExiste = tarefas.some(t =>
		t.nome.trim().toLowerCase() === nomeTarefa.toLowerCase()
	)

	if (jaExiste) {
		return res.status(409).json({ erro: 'Tarefa já existe.' })
	}

	tarefas.push({ nome: nomeTarefa, finalizada: false, criadaEm: new Date() })
	res.status(201).json(tarefas)
})


app.post('/editar', (req, res) => {
	const { nomeAntigo, nomeNovo } = req.body
	let base = nomeNovo.trim()
	let novoNome = base
	let contador = 1

	// Garante que o novo nome seja único
	while (tarefas.some(t =>
		t.nome.toLowerCase() === novoNome.toLowerCase() &&
		t.nome !== nomeAntigo
	)) {
		contador++
		novoNome = `${base} (${contador})`
	}

	const tarefa = tarefas.find(t => t.nome === nomeAntigo)

	if (tarefa) {
		tarefa.nome = novoNome
	}

	res.json(tarefas)
})



app.post('/mudarStatus', (req, res) => {
	let nomeTarefa = req.body.nomeTarefa
	let tarefa = tarefas.find(t => t.nome === nomeTarefa)

	if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada.' })

	tarefa.finalizada = !tarefa.finalizada

	if (tarefa.finalizada) {
		tarefa.finalizadaEm = new Date()

		
		if (!tarefa.nome.endsWith(' ✅')) {
			tarefa.nome += ' ✅'
		}
	} else {
		delete tarefa.finalizadaEm

		
		let nomeBase = tarefa.nome.replace(' ✅', '').trim()
		let novoNome = nomeBase
		let contador = 1

		
		while (tarefas.some(t =>
			!t.finalizada &&
			t.nome.toLowerCase() === novoNome.toLowerCase() &&
			t !== tarefa
		)) {
			contador++
			novoNome = `${nomeBase} (${contador})`
		}

		tarefa.nome = novoNome
	}

	res.json(tarefas)
})


app.post('/reordenar', (req, res) => {
	const novaOrdem = req.body.ordem

	tarefas = novaOrdem.map(nome => tarefas.find(tarefa => tarefa.nome === nome)).filter(Boolean)

	res.sendStatus(200)
})


app.delete('/excluirFinalizadas', (req, res) => {
	tarefas = tarefas.filter(tarefa => !tarefa.finalizada)
	res.sendStatus(200)
})

// Fim código to do list

app.listen(porta, () => {
	console.log('Servidor rodando com sucesso!')
})