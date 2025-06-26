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
	{ nome: '01', finalizada: false },
	{ nome: '02', finalizada: false },
	{ nome: '03', finalizada: false },
	{ nome: '04', finalizada: false },
	{ nome: '05', finalizada: false }
]

app.get('/tarefas', (req, res) => {
	res.json(tarefas)
})

app.post('/adicionar', (req, res) => {
	let nomeTarefa = req.body.nomeNovaTarefa
	tarefas.push({nome: nomeTarefa, finalizada: false})
	res.json(tarefas)
})

// Fim código to do list

app.listen(porta, () => {
	console.log('Servidor rodando com sucesso!')
})