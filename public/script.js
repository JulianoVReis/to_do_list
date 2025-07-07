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
const deletar = document.querySelector('.delete')
deletar.title = 'Excluir tarefas permanentemente'
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
		paragrafo.setAttribute('draggable', true)
		paragrafo.classList.add('draggable')
		paragrafo.appendChild(abbr)

		if (tarefa.finalizada && tarefa.finalizadaEm) {
			const data = new Date(tarefa.finalizadaEm)
			const formatada = data.toLocaleString('pt-BR')
			abbr.title = `Finalizada em: ${formatada}`
		} else if (tarefa.criadaEm) {
			const data = new Date(tarefa.criadaEm)
			const formatada = data.toLocaleString('pt-BR')
			abbr.title = `Criada em: ${formatada}`
		} else {
			abbr.title = 'Data não disponível'
		}

		let spanContainer = document.createElement('span')
		paragrafo.appendChild(spanContainer)

		if (!tarefa.finalizada) {
			let spanEdit = document.createElement('span')
			spanEdit.textContent = 'Editar'
			spanEdit.classList.add('editar-texto')
			spanEdit.title = 'Clique para editar a tarefa'
			spanEdit.style.fontSize = '.8rem'
			spanEdit.style.marginRight = '.7rem'
			spanEdit.addEventListener('click', () => editarTarefa(tarefa.nome))
			spanContainer.appendChild(spanEdit)

			let spanX = document.createElement('span')
			spanX.textContent = 'Remover'
			spanX.style.fontSize = '.8rem'
			spanX.classList.add('finalizar')
			spanX.title = 'Clique para finalizar a tarefa'
			spanX.onclick = () => mudarStatus(tarefa.nome)
			spanContainer.appendChild(spanX)

			let info = document.querySelector('.info')
			info.title = 'Segure e arraste para reordenar'
		} else {
			let spanX = document.createElement('span')
			spanX.textContent = 'Restaurar'
			spanX.style.fontSize = '.8rem'
			spanX.classList.add('finalizar', 'restaurar')
			spanX.title = 'Clique para restaurar a tarefa'
			spanX.onclick = () => mudarStatus(tarefa.nome)
			spanContainer.appendChild(spanX)
		}

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
		modalPendentes.innerHTML = '<div class="vazio">----------</div>'
	}
	if (finalizadasCount === 0) {
		modalFinalizadas.innerHTML = '<div class="vazio">----------</div>'
	}
	ativarDragAndDrop()
	ativarDragTouch()
}

function ativarDragAndDrop() {
  const container = document.querySelector('.modal-pendentes')
  let draggedElement = null

  container.querySelectorAll('p').forEach(item => {
    item.addEventListener('dragstart', (e) => {
      draggedElement = item
      e.dataTransfer.effectAllowed = 'move'
      item.classList.add('dragging')
    })

    item.addEventListener('dragend', async () => {
  if (draggedElement) {
    draggedElement.classList.remove('dragging')
  }
  draggedElement = null

  const novaOrdem = Array.from(container.querySelectorAll('p'))
    .map(p => p.querySelector('abbr')?.textContent.trim())

  console.log('Nova ordem:', novaOrdem)

  await fetch('/reordenar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ordem: novaOrdem })
  })
})


    item.addEventListener('dragover', (e) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'

      const bounding = item.getBoundingClientRect()
      const offset = e.clientY - bounding.top
      const middle = bounding.height / 2

      const container = item.parentNode
      if (offset > middle) {
        container.insertBefore(draggedElement, item.nextSibling)
      } else {
        container.insertBefore(draggedElement, item)
      }
    })
  })
}

function ativarDragTouch() {
  const container = document.querySelector('.modal-pendentes')
  let touchDrag = null

  container.querySelectorAll('p').forEach(item => {
    item.addEventListener('touchstart', (e) => {
      touchDrag = item
      item.classList.add('dragging')
    })

    item.addEventListener('touchend', async (e) => {
  if (touchDrag) {
    touchDrag.classList.remove('dragging')
    touchDrag = null

    const novaOrdem = Array.from(container.querySelectorAll('p'))
      .map(p => p.querySelector('abbr')?.textContent.trim())

    console.log('Nova ordem (touch):', novaOrdem)

    await fetch('/reordenar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ordem: novaOrdem })
    })
  }
})

    item.addEventListener('touchmove', (e) => {
      e.preventDefault()
      const touch = e.touches[0]
      const el = document.elementFromPoint(touch.clientX, touch.clientY)

      if (el && el.tagName === 'P' && el !== touchDrag) {
        const container = el.parentNode
        const bounding = el.getBoundingClientRect()
        const middle = bounding.top + bounding.height / 2

        if (touch.clientY > middle) {
          container.insertBefore(touchDrag, el.nextSibling)
        } else {
          container.insertBefore(touchDrag, el)
        }
      }
    }, { passive: false })
  })
}

deletar.addEventListener('click', async () => {
	const confirmacao = confirm('Tem certeza que deseja excluir permanentemente todas as tarefas finalizadas?')

	if (!confirmacao) return

	await fetch('/excluirFinalizadas', {
		method: 'DELETE'
	})
	carregarTarefas()
})

addTarefa.addEventListener('click', async () => {
	let nomeNovaTarefa = document.querySelector('#caixaTarefa').value.trim()
	if (nomeNovaTarefa === '') return;
	const resposta = await fetch('/adicionar', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ nomeNovaTarefa })
})

if (resposta.status === 409) {
	mostrarToast('Essa tarefa já existe.')
	return
}

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

	const resposta = await fetch('/editar', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ nomeAntigo: nomeAntigoGlobal, nomeNovo })
})

if (resposta.status === 409) {
	mostrarToast('Já existe uma tarefa com esse nome.')
	return
}

	inputEditar.value = ''
	modalEditar.classList.add('hidden')
	carregarTarefas()
})

async function mudarStatus(nomeTarefa) {
	await fetch('/mudarStatus', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ nomeTarefa })
	})
	carregarTarefas()
}


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


document.addEventListener('click', (event) => {
	const modais = [modalCriar, modalPendentesBox, modalFinalizadasBox]

	const clicouEmEditarTexto = event.target.classList.contains('editar-texto') ||
		modalEditar.contains(event.target)

	for (const modal of modais) {
		if (modal.classList.contains('mostrar') &&
			!modal.contains(event.target) &&
			!event.target.closest('.modal-1, .modal-2, .modal-3') &&
			!clicouEmEditarTexto) {
			modal.classList.remove('mostrar')
			setTimeout(() => modal.style.display = 'none', 300)
		}
	}

	if (!modalEditar.classList.contains('hidden') &&
		!modalEditar.contains(event.target) &&
		!event.target.classList.contains('editar-texto')) {
		modalEditar.classList.add('hidden')
	}
})

function mostrarToast(msg, duracao = 3000) {
	const toast = document.getElementById('toast')
	toast.textContent = msg
	toast.classList.add('show')
	toast.classList.remove('hidden')

	setTimeout(() => {
		toast.classList.remove('show')
		toast.classList.add('hidden')
	}, duracao)
}
