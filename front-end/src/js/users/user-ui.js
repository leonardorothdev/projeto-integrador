// src/scripts/users/user-ui.js

const roleMap = {
  admin: "Admin",
  professor: "Professor",
  student: "Aluno",
};

/**
 * Renderiza toda a estrutura HTML do componente de usuários.
 * @param {HTMLElement} container - O elemento onde o HTML será injetado.
 */
export const renderLayout = (container) => {
  const html = `
    <h2 class="main-title">Usuários</h2>
    <div class="section-controls">
      <div class="search">
        <input type="search" class="search__input search__input--users" placeholder="Procure usuários...">
      </div>
      <button class="btn btn--default btn--open-modal">Cadastrar novo usuário</button>
    </div>

    <div class="modal modal--add-user modal--hidden">
      <div class="modal__content">
        <span class="modal__close">&times;</span>
        <h3 class="modal__title">Cadastrar Novo Usuário</h3>
        <form class="form form--add-user">
          <input type="hidden" name="id" />
          <input type="hidden" name="username" value="temp_username" /> <!-- Adicionado para o backend -->

          <label for="user-name">Nome:</label>
          <input type="text" name="name" class="form__input" required />

          <label for="user-email">Email:</label>
          <input type="email" name="email" class="form__input" required />

          <label for="user-role">Cargo:</label>
          <select name="role" class="form__input" required>
            <option value="" disabled selected>Selecionar cargo</option>
            <option value="admin">Admin</option>
            <option value="professor">Professor</option>
            <option value="student">Aluno</option>
          </select>

          <label for="user-password" class="form__label--password">Senha:</label>
          <input type="password" name="password" class="form__input form__input--password" required />
          
          <div class="form__buttons">
            <button type="button" class="btn btn--cancel modal__close-btn">Cancelar</button>
            <button type="submit" class="btn btn--submit">Cadastrar</button>
          </div>
          <p class="form__error-message"></p>
        </form>
      </div>
    </div>

    <div class="table-container">
      <table class="main-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Cargo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody id="users-table-body"></tbody>
      </table>
    </div>
  `;
  container.innerHTML = html;
};

export const renderUsersTable = (users) => {
  const tableBody = document.getElementById("users-table-body");
  if (!tableBody) return;
  tableBody.innerHTML = "";

  if (!users || users.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="4">Nenhum usuário encontrado.</td></tr>';
    return;
  }

  users.forEach(user => {
    const row = document.createElement("tr");
    row.dataset.id = user.id;
    row.innerHTML = `
      <td data-label="Nome">${user.name}</td>
      <td data-label="Email">${user.email}</td>
      <td data-label="Cargo">${roleMap[user.role] || user.role}</td>
      <td data-label="Ações">
        <button class="btn btn--edit">Editar</button>
        <button class="btn btn--delete">Apagar</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
};

export const toggleModal = (show) => {
  const modal = document.querySelector(".modal--add-user");
  if (modal) modal.classList.toggle("modal--hidden", !show);
};

export const setupAddModal = () => {
  const modal = document.querySelector(".modal--add-user");
  if (!modal) return;
  const form = modal.querySelector("form");
  form.reset();
  form.dataset.mode = "add";
  modal.querySelector(".modal__title").textContent = "Cadastrar Novo Usuário";
  modal.querySelector(".btn--submit").textContent = "Cadastrar";
  // Garante que o campo de senha seja visível e obrigatório
  modal.querySelector(".form__label--password").style.display = 'block';
  modal.querySelector(".form__input--password").style.display = 'block';
  modal.querySelector(".form__input--password").required = true;
  clearFormError();
};

export const setupEditModal = (user) => {
  const modal = document.querySelector(".modal--add-user");
  if (!modal) return;
  const form = modal.querySelector("form");
  form.reset();
  form.dataset.mode = "edit";
  modal.querySelector(".modal__title").textContent = "Editar Usuário";
  modal.querySelector(".btn--submit").textContent = "Salvar Alterações";
  
  form.querySelector('[name="id"]').value = user.id;
  form.querySelector('[name="name"]').value = user.name;
  form.querySelector('[name="email"]').value = user.email;
  form.querySelector('[name="role"]').value = user.role;

  // Esconde e torna o campo de senha não obrigatório na edição
  modal.querySelector(".form__label--password").style.display = 'none';
  modal.querySelector(".form__input--password").style.display = 'none';
  modal.querySelector(".form__input--password").required = false;
  clearFormError();
};

export const showFormError = (message) => {
  const errorElement = document.querySelector(".form.form--add-user .form__error-message");
  if(errorElement) errorElement.textContent = message;
};

export const clearFormError = () => {
  const errorElement = document.querySelector(".form.form--add-user .form__error-message");
  if(errorElement) errorElement.textContent = "";
};