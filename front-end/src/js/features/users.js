import { apiFetch } from '../lib/api.js';

// Variáveis para armazenar dados no módulo
let allUserData = []; // Vai guardar todos os usuários que vierem da API
let allClassDataForForm = []; // Vai guardar as turmas para exibir no form
let isInitialized = false; // Evita que a função de inicialização rode mais de uma vez

// Mapeia cargos para exibição no front
const roleMap = {
  admin: "Admin",
  professor: "Professor"
};

// Funções para fazer requisições à API
const getAllUsers = () => apiFetch('/users'); // Busca todos os usuários
const updateUser = (id, data) => apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }); // Atualiza usuário
const deleteUser = (id) => apiFetch(`/users/${id}`, { method: 'DELETE' }); // Deleta usuário
const createUser = async (userData) => {
  // Essa função usa fetch direto para registrar um novo usuário
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData)
  });

  if (!response.ok) {
    // Se der erro, pega a mensagem e lança um erro
    const errorData = await response.json();
    throw new Error(errorData.message || "Erro ao criar o usuário.");
  }

  return await response.json(); // Retorna o resultado se tudo der certo
};
const getClassesForForm = () => apiFetch('/classes'); // Pega as turmas para o professor

// Monta a interface inicial (HTML) com tabela e modal
function renderInitialLayout(container) {
  container.innerHTML = `
    <h2 class="main-title">Gerenciamento de Usuários</h2>
    <div class="section-controls">
      <input type="search" class="search__input search__input--users" placeholder="Buscar por nome ou email..." />
      <button class="btn btn--default btn--open-modal" data-permission="admin">Cadastrar Usuário</button>
    </div>

    <div class="table-container">
      <table class="main-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Cargo</th>
            <th data-permission="admin">Ações</th>
          </tr>
        </thead>
        <tbody id="users-table-body">
          </tbody>
      </table>
    </div>

    <!-- Modal para cadastro e edição -->
    <div class="modal modal--add-user modal--hidden">
      <div class="modal__content">
        <span class="modal__close">&times;</span>
        <h3 class="modal__title">Cadastrar Novo Usuário</h3>
        <form class="form form--modal form--add-user">
          <input type="hidden" name="id" />
          
          <label>Nome Completo:</label>
          <input class="form__input" type="text" name="name" required />
          
          <label>Username:</label>
          <input class="form__input" type="text" name="username" required />

          <label>Email:</label>
          <input class="form__input" type="email" name="email" required />

          <label>Telefone:</label>
          <input class="form__input" type="tel" name="phone" />
          
          <label class="form__label--password">Senha:</label>
          <input class="form__input form__input--password" type="password" name="password" required />
          
          <label>Cargo:</label>
          <select class="form__input" id="user-role-select" name="role" required>
              <option value="" disabled selected>Selecionar cargo</option>
              <option value="admin">Admin</option>
              <option value="professor">Professor</option>
          </select>

          <div id="professor-classes-container" style="display: none;">
            <label>Turmas do Professor:</label>
            <div id="professor-classes-checkboxes" class="checkbox-container"></div>
          </div>

          <div class="form__buttons">
            <button type="button" class="btn btn--cancel modal__close-btn">Cancelar</button>
            <button type="submit" class="btn btn--submit">Cadastrar</button>
          </div>
          <p class="form__error-message"></p>
        </form>
      </div>
    </div>
  `;
}

// Cria os checkboxes para turmas do professor
function renderClassCheckboxes(classes, selectedClassIds = []) {
  const container = document.getElementById('professor-classes-checkboxes');
  if (!container) return;
  container.innerHTML = classes.length ? '' : 'Nenhuma turma disponível.';
  classes.forEach(cls => {
    const isChecked = selectedClassIds.includes(cls.id);
    container.innerHTML += `
      <div class="checkbox-group">
        <input type="checkbox" name="classIds" value="${cls.id}" id="class-${cls.id}" ${isChecked ? 'checked' : ''} />
        <label for="class-${cls.id}">${cls.name}</label>
      </div>
    `;
  });
}

// Mostra todos os usuários na tabela
function renderUsersTable(users) {
  const tableBody = document.getElementById("users-table-body");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  if (!users || users.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="4">Nenhum usuário encontrado.</td></tr>';
    return;
  }

  users.forEach(user => {
    const row = tableBody.insertRow();
    row.dataset.id = user.id;

    row.innerHTML = `
      <td data-label="Nome">${user.name}</td>
      <td data-label="Email">${user.email}</td>
      <td data-label="Cargo">${roleMap[user.role] || user.role}</td>
      <td data-label="Ações" data-permission="admin">
        <button class="btn btn--edit">Editar</button>
        <button class="btn btn--delete">Apagar</button>
      </td>
    `;
  });
}

// Busca usuários no servidor e atualiza tabela
async function refreshTable() {
  const tableBody = document.getElementById("users-table-body");
  if (!tableBody) return;

  tableBody.innerHTML = '<tr><td colspan="4">Carregando...</td></tr>';

  try {
    const data = await getAllUsers();
    allUserData = data.users || [];
    renderUsersTable(allUserData);
  } catch (error) {
    console.error("Erro ao carregar usuários:", error);
    tableBody.innerHTML = `<tr><td colspan="4">${error.message}</td></tr>`;
  }
}

// Quando envia o form para criar ou editar usuário
async function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const errorElement = form.querySelector('.form__error-message');
  errorElement.textContent = '';

  const formData = new FormData(form);
  const id = form.querySelector('[name="id"]').value.trim();
  const mode = form.dataset.mode;

  // Monta objeto com os dados do usuário
  const userData = {
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    role: formData.get("role"),
  };

  // Se for professor, pega as turmas selecionadas
  if (userData.role === 'professor') {
    const checkedClasses = form.querySelectorAll('input[name="classIds"]:checked');
    userData.classIds = Array.from(checkedClasses).map(cb => parseInt(cb.value, 10));
  }

  try {
    if (mode === "edit" && id) {
      await updateUser(id, userData); // Atualiza usuário
    } else {
      userData.password = formData.get("password");
      if (!userData.password) throw new Error("Senha é obrigatória.");
      await createUser(userData); // Cria novo usuário
    }

    form.closest('.modal').classList.add('modal--hidden'); // Fecha modal
    form.reset();
    delete form.dataset.mode;
    await refreshTable(); // Atualiza tabela
  } catch (error) {
    errorElement.textContent = error.message || "Erro ao salvar usuário.";
  }
}

// Quando clica nos botões da tabela (editar/deletar)
function handleTableClick(event) {
  const target = event.target;
  const row = target.closest("tr");
  if (!row || !row.dataset.id) return;

  const id = row.dataset.id;
  const modal = document.querySelector(".modal--add-user");
  const form = modal.querySelector("form");

  const passwordLabel = modal.querySelector(".form__label--password");
  const passwordInput = modal.querySelector(".form__input--password");

  if (target.classList.contains("btn--edit")) {
    // Pega dados do usuário para preencher no form
    const userToEdit = allUserData.find(u => u.id == id);
    if (!userToEdit) return;

    form.reset();
    form.dataset.mode = "edit";

    modal.querySelector(".modal__title").textContent = "Editar Usuário";
    form.querySelector(".btn--submit").textContent = "Salvar Alterações";

    form.querySelector('[name="id"]').value = userToEdit.id;
    form.querySelector('[name="name"]').value = userToEdit.name;
    form.querySelector('[name="username"]').value = userToEdit.username;
    form.querySelector('[name="email"]').value = userToEdit.email;
    form.querySelector('[name="phone"]').value = userToEdit.phone || '';
    form.querySelector('[name="role"]').value = userToEdit.role;

    passwordLabel.style.display = 'none';
    passwordInput.style.display = 'none';
    passwordInput.required = false;

    // Se for professor, mostra checkboxes com as turmas dele
    if (userToEdit.role === 'professor') {
      const selectedClassIds = userToEdit.classes?.map(cls => cls.id) || [];
      renderClassCheckboxes(allClassDataForForm, selectedClassIds);
      document.getElementById("professor-classes-container").style.display = 'block';
    } else {
      document.getElementById("professor-classes-container").style.display = 'none';
    }

    modal.classList.remove('modal--hidden');
  }

  if (target.classList.contains("btn--delete")) {
    if (confirm("Tem certeza que deseja apagar este usuário?")) {
      deleteUser(id).then(refreshTable).catch(err => alert(err.message));
    }
  }
}

// Faz busca na tabela por nome ou email
function handleSearch(event) {
  const query = event.target.value.toLowerCase();
  const filtered = allUserData.filter(user =>
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  );
  renderUsersTable(filtered);
}

// Inicializa a funcionalidade de gerenciamento de usuários
export async function initializeUsersFeature() {
  const container = document.getElementById("users-container");
  if (!container) return;

  if (!isInitialized) {
    renderInitialLayout(container);

    const openModalButton = container.querySelector(".btn--open-modal");
    const searchInput = container.querySelector(".search__input--users");
    const tableBody = container.querySelector("#users-table-body");
    const modal = container.querySelector(".modal--add-user");
    const modalForm = modal.querySelector("form");
    const modalCloseButtons = container.querySelectorAll(".modal__close, .modal__close-btn");
    const roleSelect = container.querySelector("#user-role-select");
    const classCheckboxContainer = document.getElementById("professor-classes-container");

    // Abre modal para cadastrar novo usuário
    openModalButton.addEventListener("click", () => {
      modalForm.reset();
      modalForm.dataset.mode = "add";
      modal.querySelector(".modal__title").textContent = "Cadastrar Novo Usuário";
      modalForm.querySelector(".btn--submit").textContent = "Cadastrar";
      modalForm.querySelector('[name="id"]').value = '';
      modal.querySelector(".form__label--password").style.display = 'block';
      modal.querySelector(".form__input--password").style.display = 'block';
      modal.querySelector(".form__input--password").required = true;
      classCheckboxContainer.style.display = 'none';
      modal.classList.remove('modal--hidden');
    });

    // Fecha modal
    modalCloseButtons.forEach(btn => btn.addEventListener("click", () => {
      modal.classList.add('modal--hidden');
      modalForm.reset();
      delete modalForm.dataset.mode;
    }));

    // Mostra checkboxes se escolher professor
    roleSelect.addEventListener('change', async (event) => {
      if (event.target.value === 'professor') {
        if (allClassDataForForm.length === 0) {
          try {
            const response = await getClassesForForm();
            allClassDataForForm = response.classes || [];
          } catch (error) {
            console.error("Erro ao carregar turmas:", error);
          }
        }
        renderClassCheckboxes(allClassDataForForm);
        classCheckboxContainer.style.display = 'block';
      } else {
        classCheckboxContainer.style.display = 'none';
      }
    });

    modalForm.addEventListener("submit", handleFormSubmit);
    tableBody.addEventListener("click", handleTableClick);
    searchInput.addEventListener("input", handleSearch);

    isInitialized = true;
  }

  await refreshTable();
}
