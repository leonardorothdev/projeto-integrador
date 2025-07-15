// src/scripts/users/users.js
import * as api from "./user-api.js";
import * as ui from "./user-ui.js";
// Importamos a sua função de auth.js para verificar o estado do login
import { getAllData } from "../auth/auth.js";

let allUserData = [];

/**
 * Função para buscar e renderizar a lista de usuários. Só deve ser chamada se o usuário estiver autenticado.
 */
async function refreshUsers() {
  try {
    allUserData = await api.getAllUsers();
    ui.renderUsersTable(allUserData);
  } catch (error) {
    console.error("Falha ao atualizar a lista de usuários:", error);
    const tableBody = document.getElementById("users-table-body");
    if (tableBody) {
        tableBody.innerHTML = `<tr><td colspan="4">${error.message}</td></tr>`;
    }
  }
}

async function handleFormSubmit(event) {
  event.preventDefault();
  ui.clearFormError();
  
  const form = event.target;
  const formData = new FormData(form);
  
  const mode = form.dataset.mode;
  const id = formData.get("id");
  
  const userData = {
    name: formData.get("name"),
    username: formData.get("email").split('@')[0],
    email: formData.get("email"),
    role: formData.get("role"),
  };

  try {
    if (mode === "edit") {
      await api.updateUser(id, userData);
    } else {
      userData.password = formData.get("password");
      await api.createUser(userData);
    }
    ui.toggleModal(false);
    refreshUsers();
  } catch (error) {
    ui.showFormError(error.message);
  }
}

function handleTableClick(event) {
  const target = event.target;
  const row = target.closest("tr");
  if (!row || !row.dataset.id) return;

  const id = row.dataset.id;

  if (target.classList.contains("btn--edit")) {
    const userToEdit = allUserData.find((u) => u.id == id);
    if (userToEdit) {
      ui.setupEditModal(userToEdit);
      ui.toggleModal(true);
    }
  }

  if (target.classList.contains("btn--delete")) {
    if (confirm("Tem certeza que deseja apagar este usuário?")) {
      api.deleteUser(id)
        .then(refreshUsers)
        .catch((error) => alert(error.message));
    }
  }
}

function handleSearch(event) {
  const query = event.target.value.toLowerCase();
  const filteredUsers = allUserData.filter(user =>
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  );
  ui.renderUsersTable(filteredUsers);
}

/**
 * Ponto de entrada: esta função monta a seção de usuários e adiciona a lógica.
 */
function initializeUsersSection() {
  const container = document.getElementById("users-container");
  if (!container) return;

  // 1. Renderiza o HTML base da seção
  ui.renderLayout(container);

  // 2. A VERIFICAÇÃO CRUCIAL: Usa a sua função `getAllData` para checar o login.
  const authData = getAllData();
  
  // Seleciona os elementos da UI
  const openModalButton = container.querySelector(".btn--open-modal");
  const searchInput = container.querySelector(".search__input--users");
  const tableBody = container.querySelector("#users-table-body");

  // 3. SE NÃO ESTIVER LOGADO (ou não for admin - adaptável)
  if (!authData || !authData.token) {
    if (tableBody) {
      tableBody.innerHTML = `<tr><td colspan="4">Acesso negado. Por favor, faça login como administrador para gerenciar usuários.</td></tr>`;
    }
    // Desabilita os controles para dar feedback visual ao usuário
    if (openModalButton) openModalButton.disabled = true;
    if (searchInput) searchInput.disabled = true;
    return; // Interrompe a execução para não fazer chamadas à API
  }

  // 4. SE ESTIVER LOGADO: Continua a configuração normal
  const modalCloseButtons = container.querySelectorAll(".modal__close, .modal__close-btn");
  const modalForm = container.querySelector(".form--add-user");
  
  // Adiciona os event listeners aos elementos agora que sabemos que o usuário tem permissão
  openModalButton.addEventListener("click", () => {
    ui.setupAddModal();
    ui.toggleModal(true);
  });
  modalCloseButtons.forEach(btn => btn.addEventListener("click", () => ui.toggleModal(false)));
  modalForm.addEventListener("submit", handleFormSubmit);
  tableBody.addEventListener("click", handleTableClick);
  searchInput.addEventListener("input", handleSearch);

  // 5. Finalmente, busca os dados da API
  refreshUsers();
}

// Inicia a lógica quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", initializeUsersSection);