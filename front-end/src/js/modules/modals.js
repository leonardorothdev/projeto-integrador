export function setupModals() {
  // Seleciona todos os botões que abrem modais (tem o atributo data-modal-target)
  const openModalButtons = document.querySelectorAll("[data-modal-target]");

  // Seleciona todos os botões que fecham modais (classe .modal__close)
  const closeModalButtons = document.querySelectorAll(".modal__close");

  // Função para mostrar ou esconder um modal
  const toggleModal = (modal, show) => {
    if (modal) modal.classList.toggle("modal--hidden", !show); // Se show = true, remove a classe; senão, adiciona
  };

  // Quando clicar em um botão de abrir modal
  openModalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Pega o modal que esse botão abre (usando o data-modal-target)
      const modal = document.querySelector(button.dataset.modalTarget);
      toggleModal(modal, true); // Mostra o modal
    });
  });

  // Quando clicar em um botão de fechar modal
  closeModalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const modal = button.closest(".modal"); // Pega o modal onde está o botão
      toggleModal(modal, false); // Fecha o modal
    });
  });

  // Fecha o modal clicando fora do conteúdo (clicando na área escura)
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) toggleModal(modal, false); // Só fecha se clicar fora da área do conteúdo
    });
  });
}
