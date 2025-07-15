// Importa as funções que inicializam cada seção do sistema
import { initializeClassesFeature } from '../features/classes.js';
import { initializeUsersFeature } from '../features/users.js';
import { initializeStudentsFeature } from '../features/students.js';
import { initializeSettingsFeature } from '../features/settings.js';

// Seleciona os itens do menu lateral e as seções de conteúdo
const sideItems = document.querySelectorAll(".sidebar__item");
const contentSections = document.querySelectorAll(".content-section");

// Função que troca a seção visível quando o usuário clica no menu
function switchContent(targetHref) {
  const targetId = targetHref.replace("#", ""); // Remove o "#" para pegar o id da seção

  // Esconde todas as seções e tira a classe ativa dos itens do menu
  contentSections.forEach((section) => (section.style.display = "none"));
  sideItems.forEach((item) => item.classList.remove("sidebar__item--active"));

  // Pega a seção que deve aparecer e o item do menu que foi clicado
  const targetSection = document.getElementById(targetId + '-container');
  const activeItem = document.querySelector(`.sidebar__item a[href="${targetHref}"]`);

  if (targetSection) {
    // Mostra a seção escolhida
    targetSection.style.display = "block";

    // Aqui decide qual função chamar dependendo da aba clicada
    switch (targetHref) {
      case '#classes':
        initializeClassesFeature(); // Inicializa a seção de turmas
        break;
      case '#students':
        initializeStudentsFeature(); // Inicializa a seção de estudantes
        break;
      case '#users':
        initializeUsersFeature(); // Inicializa a seção de usuários
        break;
      case '#settings':
        initializeSettingsFeature(); // Inicializa a seção de configurações
        break;
    }
  }

  // Marca o item do menu como ativo
  if (activeItem) {
    activeItem.closest(".sidebar__item").classList.add("sidebar__item--active");
  }
}

// Função principal para configurar a navegação
export function setupNavigation(userRole) {
  // Quando clicar no menu lateral
  sideItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const link = e.currentTarget.querySelector("a");
      if (link) {
        const targetHref = link.getAttribute("href");
        // Se a aba não é a atual, atualiza a URL e troca o conteúdo
        if (window.location.hash !== targetHref) {
          history.pushState(null, "", targetHref);
          switchContent(targetHref);
        }
      }
    });
  });

  // Quando o usuário usa os botões voltar/avançar do navegador
  window.addEventListener('popstate', () => {
    const targetHref = window.location.hash || '#classes'; // Se não tiver hash, vai para #classes
    switchContent(targetHref);
  });

  // Define a aba inicial quando a página carrega
  const initialHref = window.location.hash || "#classes";

  // Se for professor e tentar abrir a aba de usuários, redireciona para turmas
  if (userRole === "professor" && initialHref === "#users") {
    history.replaceState(null, "", "#classes");
    switchContent("#classes");
  } else {
    switchContent(initialHref);
  }
}
