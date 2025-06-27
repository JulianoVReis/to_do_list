const body = document.querySelector('body')
const addTarefa = document.querySelector('.adicionar-tarefa')
const modal1 = document.querySelector('.modal-1')
const modal2 = document.querySelector('.modal-2')
const modal3 = document.querySelector('.modal-3')
const modalCriar = document.querySelector('.modal-criar')
const modalPendentesBox = document.querySelector('.modal-pendentes-box')
const modalFinalizadasBox = document.querySelector('.modal-finalizadas-box')

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

// Início modal abrir e fechar
modal1.addEventListener('click', () => {
	const estilo = getComputedStyle(modalCriar)
	modalCriar.style.display = (estilo.display === 'none') ? 'flex' : 'none'
})

modal2.addEventListener('click', () => {
	const estilo = getComputedStyle(modalPendentesBox)
	modalPendentesBox.style.display = (estilo.display === 'none') ? 'flex' : 'none'
})

modal3.addEventListener('click', () => {
	const estilo = getComputedStyle(modalFinalizadasBox)
	modalFinalizadasBox.style.display = (estilo.display === 'none') ? 'flex' : 'none'
})
// Fim modal abrir e fechar