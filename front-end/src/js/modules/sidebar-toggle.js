export function setupSidebarToggle() {
  // Pega a sidebar e o botão que abre/fecha
  const sidebar = document.querySelector(".sidebar");
  const openBtn = document.querySelector(".sidebar__toggle");
  const openBtnIcon = document.querySelector(".sidebar__toggle-icon");

  // Se o botão e a sidebar existirem
  if (openBtn && sidebar) {
    // Quando clicar no botão
    openBtn.addEventListener("click", () => {
      // Alterna a classe que abre/fecha a sidebar
      sidebar.classList.toggle("sidebar--open");

      // Gira o ícone do botão dependendo se a sidebar está aberta ou não
      if (openBtnIcon) {
        openBtnIcon.style.transform = sidebar.classList.contains("sidebar--open")
          ? "rotate(180deg)" // Gira 180° quando aberta
          : "rotate(0deg)";  // Volta ao normal quando fechada
      }
    });
  }
}
