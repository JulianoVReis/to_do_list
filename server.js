const express = require('express')
const path = require('path')
const app = express()
const porta = 3000

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(porta, () => {
	console.log('Servidor rodando com sucesso!')
})