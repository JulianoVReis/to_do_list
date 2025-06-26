const body = document.querySelector('body')
const addTarefa = document.querySelector('.adicionar-tarefa')

body.addEventListener('load', carregarTarefas)
async function carregarTarefas() {
	const resposta = await fetch('/tarefas')
	const lista = await resposta.json()

	let modalPendentes = document.querySelector('.modal-pendentes')
	let modalFinalizadas = document.querySelector('.modal-finalizadas')

	modalPendentes.innerHTML = ''
	modalFinalizadas.innerHTML = ''

	for (let tarefa of lista) {
		let paragrafo = document.createElement('p')
		paragrafo.textContent = tarefa.nome

		if (tarefa.finalizada == false) {
			modalPendentes.appendChild(paragrafo)
		} else {
			modalFinalizadas.appendChild(paragrafo)
		}
	}
}

addTarefa.addEventListener('click', async () => {
	let nomeNovaTarefa = document.querySelector('#caixaTarefa').value
	await fetch('/adicionar', {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({nomeNovaTarefa})
	})
	carregarTarefas()
})