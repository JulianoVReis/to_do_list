const addTarefa = document.querySelector(".adicionar-tarefa");
const modal1 = document.querySelector(".modal-1");
const modal2 = document.querySelector(".modal-2");
const modal3 = document.querySelector(".modal-3");
const modalCriar = document.querySelector(".modal-criar");
const modalPendentesBox = document.querySelector(".modal-pendentes-box");
const modalFinalizadasBox = document.querySelector(".modal-finalizadas-box");
const modalEditar = document.querySelector(".modal-editar");
const inputEditar = document.querySelector("#inputEditar");
const btnSalvar = document.querySelector("#btnSalvar");
const btnCancelar = document.querySelector("#btnCancelar");
const deletar = document.querySelector(".delete");
const modalExcluir = document.querySelector(".modal-excluir");
const btnConfirmarExclusao = document.querySelector("#btnSalvarExclusao");
const btnCancelarExclusao = document.querySelector("#btnCancelarExclusao");
let nomeAntigoGlobal = "";

function getTarefas() {
	return JSON.parse(localStorage.getItem("tarefas")) || [];
}

function setTarefas(tarefas) {
	localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

function carregarTarefas() {
	const lista = getTarefas();
	const modalPendentes = document.querySelector(".modal-pendentes");
	const modalFinalizadas = document.querySelector(".modal-finalizadas");

	modalPendentes.innerHTML = "";
	modalFinalizadas.innerHTML = "";

	let pendentesCount = 0;
	let finalizadasCount = 0;
	const maxLinhas = 15;

	lista.forEach((tarefa) => {
		let paragrafo = document.createElement("p");
		let abbr = document.createElement("abbr");
		abbr.textContent = tarefa.nome;
		paragrafo.setAttribute("draggable", true);
		paragrafo.classList.add("draggable");
		paragrafo.appendChild(abbr);

		abbr.title = tarefa.finalizada ? `Finalizada em: ${new Date(tarefa.finalizadaEm).toLocaleString("pt-BR")}` : `Criada em: ${new Date(tarefa.criadaEm).toLocaleString("pt-BR")}`;

		let spanContainer = document.createElement("span");
		paragrafo.appendChild(spanContainer);

		if (!tarefa.finalizada) {
			let spanEdit = document.createElement("span");
			spanEdit.textContent = "Editar";
			spanEdit.classList.add("editar-texto");
			spanEdit.title = "Clique para editar a tarefa";
			spanEdit.style.fontSize = ".8rem";
			spanEdit.style.marginRight = ".7rem";
			spanEdit.addEventListener("click", () => editarTarefa(tarefa.nome));
			spanContainer.appendChild(spanEdit);

			let spanX = document.createElement("span");
			spanX.textContent = "Finalizar";
			spanX.style.fontSize = ".8rem";
			spanX.classList.add("finalizar");
			spanX.title = "Clique para finalizar a tarefa";
			spanX.onclick = () => mudarStatusLocal(tarefa.nome);
			spanContainer.appendChild(spanX);
		} else {
			let spanX = document.createElement("span");
			spanX.textContent = "Restaurar";
			spanX.style.fontSize = ".8rem";
			spanX.classList.add("finalizar", "restaurar");
			spanX.title = "Clique para restaurar a tarefa";
			spanX.onclick = () => mudarStatusLocal(tarefa.nome);
			spanContainer.appendChild(spanX);
		}

		if (!tarefa.finalizada && pendentesCount < maxLinhas) {
			modalPendentes.appendChild(paragrafo);
			pendentesCount++;
		}

		if (tarefa.finalizada && finalizadasCount < maxLinhas) {
			modalFinalizadas.appendChild(paragrafo);
			finalizadasCount++;
		}
	});

	if (pendentesCount === 0) modalPendentes.innerHTML = '<div class="vazio">----------</div>';
	if (finalizadasCount === 0) modalFinalizadas.innerHTML = '<div class="vazio">----------</div>';

	ativarDragAndDrop();
}

addTarefa.addEventListener("click", () => {
	let nomeNovaTarefa = document.querySelector("#caixaTarefa").value.trim();
	if (nomeNovaTarefa === "") return;

	let tarefas = getTarefas();
	if (tarefas.find((t) => t.nome.toLowerCase() === nomeNovaTarefa.toLowerCase())) {
		mostrarToast("Essa tarefa já existe.");
		return;
	}

	tarefas.push({
		nome: nomeNovaTarefa,
		finalizada: false,
		criadaEm: new Date(),
		ordem: tarefas.length
	});

	setTarefas(tarefas);
	mostrarToast("Tarefa criada com sucesso!");
	document.querySelector("#caixaTarefa").value = "";
	carregarTarefas();
});


function editarTarefa(nomeAntigo) {
	nomeAntigoGlobal = nomeAntigo;
	inputEditar.value = nomeAntigo;
	modalEditar.classList.remove("hidden");
}

btnSalvar.addEventListener("click", () => {
	const nomeNovo = inputEditar.value.trim();
	if (nomeNovo === "" || nomeNovo === nomeAntigoGlobal) {
		modalEditar.classList.add("hidden");
		return;
	}

	let tarefas = getTarefas();
	const tarefa = tarefas.find((t) => t.nome === nomeAntigoGlobal);

	let base = nomeNovo;
	let contador = 1;
	let nomeTentado = base;

	while (tarefas.some((t) => t.nome.toLowerCase() === nomeTentado.toLowerCase() && t !== tarefa)) {
		nomeTentado = `${base} (${contador++})`;
	}

	tarefa.nome = nomeTentado;
	setTarefas(tarefas);
	modalEditar.classList.add("hidden");
	carregarTarefas();
});

btnCancelar.addEventListener("click", () => {
	modalEditar.classList.add("hidden");
});

deletar.addEventListener("click", () => {
	modalExcluir.classList.remove("hidden");
});

btnCancelarExclusao.addEventListener("click", () => {
	modalExcluir.classList.add("hidden");
});

btnConfirmarExclusao.addEventListener("click", () => {
	let tarefas = getTarefas().filter((t) => !t.finalizada);
	setTarefas(tarefas);
	modalExcluir.classList.add("hidden");
	carregarTarefas();
});

function mudarStatusLocal(nome) {
	let tarefas = getTarefas();
	const tarefa = tarefas.find((t) => t.nome === nome);
	tarefa.finalizada = !tarefa.finalizada;
	tarefa.finalizadaEm = tarefa.finalizada ? new Date() : null;

	let base = tarefa.nome.replace(" ✅", "").trim();
	let nomeTentado = base;
	let contador = 1;
	while (tarefas.some((t) => t !== tarefa && t.nome.toLowerCase() === (tarefa.finalizada ? nomeTentado + " ✅" : nomeTentado).toLowerCase())) {
		nomeTentado = `${base} (${contador++})`;
	}

	tarefa.nome = tarefa.finalizada ? nomeTentado + " ✅" : nomeTentado;
	setTarefas(tarefas);
	carregarTarefas();
}

function ativarDragAndDrop() {
	const container = document.querySelector(".modal-pendentes");
	let draggedElement = null;

	container.querySelectorAll("p").forEach((item) => {
		item.addEventListener("dragstart", (e) => {
			draggedElement = item;
			e.dataTransfer.effectAllowed = "move";
			item.classList.add("dragging");
		});

		item.addEventListener("dragend", () => {
			if (draggedElement) draggedElement.classList.remove("dragging");
			draggedElement = null;
			const novaOrdem = Array.from(container.querySelectorAll("p")).map((p) => p.querySelector("abbr")?.textContent.trim());
			let tarefas = getTarefas();
			novaOrdem.forEach((nome, index) => {
				const t = tarefas.find((t) => t.nome === nome);
				if (t && !t.finalizada) t.ordem = index;
			});
			setTarefas(tarefas);
		});

		item.addEventListener("dragover", (e) => {
			e.preventDefault();
			e.dataTransfer.dropEffect = "move";
			const bounding = item.getBoundingClientRect();
			const offset = e.clientY - bounding.top;
			const middle = bounding.height / 2;
			const container = item.parentNode;
			if (offset > middle) container.insertBefore(draggedElement, item.nextSibling);
			else container.insertBefore(draggedElement, item);
		});
	});
}

function mostrarToast(msg, duracao = 3000) {
	const toast = document.getElementById("toast");
	toast.textContent = msg;
	toast.classList.add("show");
	toast.classList.remove("hidden");
	setTimeout(() => {
		toast.classList.remove("show");
		toast.classList.add("hidden");
	}, duracao);
}

window.addEventListener("load", carregarTarefas);
modal1.addEventListener("click", () => toggleModal(modalCriar));
modal2.addEventListener("click", () => toggleModal(modalPendentesBox));
modal3.addEventListener("click", () => toggleModal(modalFinalizadasBox));

document.addEventListener("click", (event) => {
	const modais = [modalCriar, modalPendentesBox, modalFinalizadasBox];

	const clicouDentroDoModal =
		event.target.closest(".modal") ||
		event.target.classList.contains("editar-texto") ||
		event.target.classList.contains("finalizar") ||
		event.target.classList.contains("restaurar") ||
		modalEditar.contains(event.target);

	for (const modal of modais) {
		if (
			modal.classList.contains("mostrar") &&
			!clicouDentroDoModal &&
			!event.target.closest(".modal-1, .modal-2, .modal-3")
		) {
			modal.classList.remove("mostrar");
			setTimeout(() => (modal.style.display = "none"), 300);
		}
	}

	if (
		!modalEditar.classList.contains("hidden") &&
		!modalEditar.contains(event.target) &&
		!event.target.classList.contains("editar-texto")
	) {
		modalEditar.classList.add("hidden");
	}
});


function toggleModal(modalAtivo) {
	const modais = [modalCriar, modalPendentesBox, modalFinalizadasBox];
	modais.forEach((modal) => {
		if (modal !== modalAtivo) {
			modal.classList.remove("mostrar");
			setTimeout(() => (modal.style.display = "none"), 300);
		}
	});

	const visivel = modalAtivo.classList.contains("mostrar");
	if (!visivel) {
		modalAtivo.style.display = "flex";
		setTimeout(() => modalAtivo.classList.add("mostrar"), 10);
	} else {
		modalAtivo.classList.remove("mostrar");
		setTimeout(() => (modalAtivo.style.display = "none"), 300);
	}
}
