const addTarefa = document.querySelector('.adicionar-tarefa')
const modal1 = document.querySelector('.modal-1')
const modal2 = document.querySelector('.modal-2')
const modal3 = document.querySelector('.modal-3')
const modalCriar = document.querySelector('.modal-criar')
const modalPendentesBox = document.querySelector('.modal-pendentes-box')
const modalFinalizadasBox = document.querySelector('.modal-finalizadas-box')
const modalEditar = document.querySelector('.modal-editar')
const inputEditar = document.querySelector('#inputEditar')
const btnSalvar = document.querySelector('#btnSalvar')
const btnCancelar = document.querySelector('#btnCancelar')
let nomeAntigoGlobal = ''

window.addEventListener('load', carregarTarefas)
async function carregarTarefas() {
	const resposta = await fetch('/tarefas')
	const lista = await resposta.json()

	const modalPendentes = document.querySelector('.modal-pendentes')
	const modalFinalizadas = document.querySelector('.modal-finalizadas')

	modalPendentes.innerHTML = ''
	modalFinalizadas.innerHTML = ''

	let pendentesCount = 0
	let finalizadasCount = 0
	const maxLinhas = 15

	for (let tarefa of lista) {
		let paragrafo = document.createElement('p')
		let abbr = document.createElement('abbr')
		abbr.textContent = tarefa.nome
		paragrafo.appendChild(abbr)

		let spanContainer = document.createElement('span')
		paragrafo.appendChild(spanContainer)

		let spanEdit = document.createElement('span')
		spanEdit.textContent = 'Editar'
		spanEdit.classList.add('editar-texto')
		spanEdit.title = 'Clique para editar a tarefa'
		spanEdit.style.fontSize = '.7rem'
		spanEdit.style.marginRight = '.7rem'
		spanEdit.addEventListener('click', () => editarTarefa(tarefa.nome))
		spanContainer.appendChild(spanEdit)

		let spanX = document.createElement('span')
		spanX.textContent = 'Remover'
		spanX.style.fontSize = '.7rem'
		spanX.classList.add('finalizar')
		spanX.title = 'Clique para finalizar a tarefa'
		spanContainer.appendChild(spanX)

		if (!tarefa.finalizada && pendentesCount < maxLinhas) {
			modalPendentes.appendChild(paragrafo)
			pendentesCount++
		}

		if (tarefa.finalizada && finalizadasCount < maxLinhas) {
			modalFinalizadas.appendChild(paragrafo)
			finalizadasCount++
		}
	}

	if (pendentesCount === 0) {
		modalPendentes.innerHTML = '<span class="amarelo vazio">- Vazia -</span>'
	}
	if (finalizadasCount === 0) {
		modalFinalizadas.innerHTML = '<span class="amarelo vazio">- Vazia -</span>'
	}
}

addTarefa.addEventListener('click', async () => {
	let nomeNovaTarefa = document.querySelector('#caixaTarefa').value.trim()
	await fetch('/adicionar', {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({nomeNovaTarefa})
	})
	document.querySelector('#caixaTarefa').value = ''
	carregarTarefas()
})

function editarTarefa(nomeAntigo) {
	nomeAntigoGlobal = nomeAntigo
	inputEditar.value = nomeAntigo
	modalEditar.classList.remove('hidden')
}

btnCancelar.addEventListener('click', () => {
	modalEditar.classList.add('hidden')
})

btnSalvar.addEventListener('click', async () => {
	const nomeNovo = inputEditar.value.trim()

	if (nomeNovo === '' || nomeNovo === nomeAntigoGlobal) {
		modalEditar.classList.add('hidden')
		return
	}

	await fetch('/editar', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ nomeAntigo: nomeAntigoGlobal, nomeNovo })
	})

	inputEditar.value = ''
	modalEditar.classList.add('hidden')
	carregarTarefas()
})

// Início modal abrir e fechar
function toggleModal(modalAtivo) {
	const modais = [modalCriar, modalPendentesBox, modalFinalizadasBox]

	modais.forEach(modal => {
		if (modal !== modalAtivo) {
			modal.classList.remove('mostrar')
			setTimeout(() => modal.style.display = 'none', 300)
		}
	})

	const visivel = modalAtivo.classList.contains('mostrar')

	if (!visivel) {
		modalAtivo.style.display = 'flex'
		setTimeout(() => modalAtivo.classList.add('mostrar'), 10)
	} else {
		modalAtivo.classList.remove('mostrar')
		setTimeout(() => modalAtivo.style.display = 'none', 300)
	}
}

modal1.addEventListener('click', () => toggleModal(modalCriar))
modal2.addEventListener('click', () => toggleModal(modalPendentesBox))
modal3.addEventListener('click', () => toggleModal(modalFinalizadasBox))
// Fim modal abrir e fechar