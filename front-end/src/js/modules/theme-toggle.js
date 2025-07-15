export function setupThemeToggle() {
  // Botão para mudar o tema e texto que indica qual está ativo
  const themeButton = document.querySelector(".settings__theme-btn");
  const themeLabel = document.querySelector(".settings__theme-label");

  // Função que aplica o tema escolhido
  const applyTheme = (theme) => {
    // Adiciona ou remove a classe "dark-mode" no body
    document.body.classList.toggle("dark-mode", theme === "dark");

    // Atualiza o texto do botão para indicar o modo atual
    if (themeLabel) {
      themeLabel.textContent = theme === "dark" ? "Modo claro" : "Modo escuro";
    }

    // Atualiza os ícones (biblioteca Lucide)
    if (window.lucide && typeof lucide.createIcons === "function") {
      lucide.createIcons();
    }
  };

  // Pega o tema salvo no localStorage (ou usa "light" por padrão)
  const savedTheme = localStorage.getItem("theme") || "light";
  applyTheme(savedTheme); // Aplica o tema salvo ao carregar a página

  // Quando clicar no botão, alterna entre claro e escuro
  if (themeButton) {
    themeButton.addEventListener("click", () => {
      const newTheme = document.body.classList.contains("dark-mode")
        ? "light"  // Se está no escuro, muda para claro
        : "dark";  // Se está no claro, muda para escuro
      localStorage.setItem("theme", newTheme); // Salva no localStorage
      applyTheme(newTheme); // Aplica o novo tema
    });
  }
}
