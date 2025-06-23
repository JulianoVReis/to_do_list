window.addEventListener('load', carregarTarefas)

async function carregarTarefas() {
	const resposta = await fetch('/tarefas')
	const lista = await resposta.json()

	let modalPendentes = document.querySelector('.modal-pendentes')
	let modalFinalizadas = document.querySelector('.modal-finalizadas')

	for (let tarefa of lista) {
		let paragrafo = document.createElement('p')
		paragrafo.textContent = tarefa.nome

		if (tarefa.finalizada === false) {
			modalPendentes.appendChild(paragrafo)
		} else {
			modalFinalizadas.appendChild(paragrafo)
		}
	}
}