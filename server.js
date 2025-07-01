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
	let nomeTarefa = req.body.nomeNovaTarefa
	tarefas.push({nome: nomeTarefa, finalizada: false, criadaEm: new Date()})
	res.json(tarefas)
})

app.post('/editar', (req, res) => {
	let nomeAntigo = req.body.nomeAntigo
	let nomeNovo = req.body.nomeNovo

	for (let tarefa of tarefas) {
		if (tarefa.nome === nomeAntigo) {
			tarefa.nome = nomeNovo
		}
	}
	res.json(tarefas)
})

app.post('/mudarStatus', (req, res) => {
	let nomeTarefa = req.body.nomeTarefa

	for (let tarefa of tarefas) {
		if (tarefa.nome === nomeTarefa) {
			tarefa.finalizada = !tarefa.finalizada

			if (tarefa.finalizada) {
				tarefa.finalizadaEm = new Date()
			} else {
				delete tarefa.finalizadaEm
			}
		}
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