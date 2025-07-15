// Importa módulos que cuidam da interface (UI)
import { setupForms } from './modules/form-handler.js';
import { setupModals } from './modules/modals.js';
import { setupNavigation } from './modules/navigation.js';
import { applyRolePermissions } from './modules/permissions.js';
import { setupSidebarToggle } from './modules/sidebar-toggle.js';
import { setupThemeToggle } from './modules/theme-toggle.js';

// Importa funções relacionadas à autenticação
import { getAuthData, logoutUser } from './features/auth.js';

// Importa os inicializadores das "features" (funcionalidades do app)
import { initializeClassesFeature } from './features/classes.js';
// Importa o módulo de estudantes para iniciar sua funcionalidade
import { initializeStudentsFeature } from './features/students.js';


/**
 * Função principal que roda quando a página carrega e inicializa tudo.
 */
function main() {
  // Pega os dados do usuário que estão salvos no localStorage (se estiver logado)
  const authData = getAuthData();

  // Se não tem dados ou o usuário não está autenticado, manda para a tela de login
  if (!authData || !authData.user) {
    window.location.href = "/pages/index.html";
    return; // Para a execução aqui, não roda mais nada
  }

  // Pega o usuário para usar nas próximas etapas
  const user = authData.user;

  // Coloca o nome do usuário na mensagem de boas-vindas da página
  const welcomeMessage = document.getElementById('welcome-message');
  if (welcomeMessage) {
    welcomeMessage.textContent = user.name;
  }

  // Configura o botão de logout para desconectar o usuário ao clicar
  const logoutButton = document.getElementById('logout-btn');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      if (confirm('Tem certeza que deseja sair?')) {
        logoutUser();
      }
    });
  }

  // Inicializa os módulos que mexem com visual, tema, navegação e permissões
  applyRolePermissions(user.role); // Ajusta o que o usuário pode ver com base na role
  setupThemeToggle();              // Ativa botão para mudar tema claro/escuro
  setupSidebarToggle();            // Ativa botão para abrir/fechar a sidebar
  setupNavigation(user.role);      // Configura a navegação entre páginas internas
  setupModals();                   // Configura modais (pop-ups)
  setupForms();                    // Configura os formulários para funcionarem

  // Inicializa os módulos com conteúdo dinâmico, passando o usuário para filtragem e controle
  initializeClassesFeature(user);    // Ativa a feature de turmas
  initializeStudentsFeature(user);   // Ativa a feature de estudantes
}

// Faz o main rodar só depois que a página estiver totalmente carregada
document.addEventListener("DOMContentLoaded", main);
