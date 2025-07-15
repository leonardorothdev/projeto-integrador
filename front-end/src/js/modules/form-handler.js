export function setupForms() {
  // Seleciona todos os elementos com a classe .form
  document.querySelectorAll(".form").forEach((form) => {
    // Adiciona um evento de submit para cada formulário
    form.addEventListener("submit", (e) => {
      e.preventDefault(); // Evita que a página recarregue ao enviar o form

      // Pega os dados do formulário e transforma em objeto
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // Verifica se o formulário está dentro de um modal
      const parentModal = form.closest(".modal");
      if (parentModal) {
        // Fecha o modal adicionando a classe que esconde ele
        parentModal.classList.add("modal--hidden");
      }

      // Limpa os campos do formulário depois do envio
      form.reset();
    });
  });
}
