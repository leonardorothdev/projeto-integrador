import { apiFetch } from "../lib/api.js";

// Variável para armazenar todas as turmas carregadas
let allClassData = [];
let isInitialized = false;

// Funções para chamar a API (CRUD das turmas)
const getAllClasses = () => apiFetch("/classes");
const createClass = (data) =>
  apiFetch("/classes", { method: "POST", body: JSON.stringify(data) });
const updateClass = (id, data) =>
  apiFetch(`/classes/${id}`, { method: "PUT", body: JSON.stringify(data) });
const deleteClass = (id) => apiFetch(`/classes/${id}`, { method: "DELETE" });

// Monta a estrutura inicial da tela de turmas
function renderInitialLayout(container, userRole) {
  const isAdmin = userRole === "admin"; // Só admin pode cadastrar turmas

  container.innerHTML = `
    <h2 class="main-title">Gerenciamento de Turmas</h2>
    <div class="section-controls">
      <input type="search" id="classes-search-input" class="search__input search__input--classes" placeholder="Procurar por turmas..." />
      ${
        isAdmin
          ? '<button id="classes-add-btn" class="btn btn--default btn--open-modal">Cadastrar nova turma</button>'
          : ""
      }
    </div>
    <div class="modal modal--add-class modal--hidden">
      <div class="modal__content">
        <span class="modal__close">&times;</span>
        <h3 class="modal__title">Cadastrar nova turma</h3>
        <form class="form form--add-class">
          <input type="hidden" name="id" />
          <label>Nome:</label>
          <input type="text" class="form__input" name="name" required />
          <label>Turno:</label>
          <select class="form__input" name="shift" required>
            <option value="" disabled selected>Selecionar turno</option>
            <option value="Morning">Matutino</option>
            <option value="Afternoon">Vespertino</option>
          </select>
          <label>Horário:</label>
          <input type="text" class="form__input" name="time" placeholder="Ex: 08:00 - 10:00" required />
          <label>Número de Vagas:</label>
          <input type="number" class="form__input" name="number_of_vacancies" min="0" required />
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
            <th>Turma</th>
            <th>Turno</th>
            <th>Horário</th>
            <th>Vagas</th>
            ${isAdmin ? "<th>Ações</th>" : ""}
          </tr>
        </thead>
        <tbody id="classes-table-body"></tbody>
      </table>
    </div>
  `;
}

// Mostra as turmas na tabela
function renderClassesTable(classes, userRole) {
  const tableBody = document.getElementById("classes-table-body");
  const shiftMap = { Morning: "Matutino", Afternoon: "Vespertino" }; // Tradução para exibir na tabela
  const isAdmin = userRole === "admin";
  const colspan = isAdmin ? 5 : 4;
  tableBody.innerHTML = "";

  if (!classes || classes.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="${colspan}">Nenhuma turma encontrada.</td></tr>`;
    return;
  }

  classes.forEach((c) => {
    const row = tableBody.insertRow();
    row.dataset.id = c.id;

    // Botões de ação (só aparecem para admin)
    const actionsCell = isAdmin
      ? `
      <td data-label="Ações">
        <button class="btn btn--edit">Editar</button>
        <button class="btn btn--delete">Apagar</button>
      </td>`
      : "";

    row.innerHTML = `
      <td data-label="Turma">${c.name}</td>
      <td data-label="Turno">${shiftMap[c.shift] || c.shift}</td>
      <td data-label="Horário">${c.time}</td>
      <td data-label="Vagas">${c.number_of_vacancies}</td>
      ${actionsCell}
    `;
  });
}

// Atualiza a lista de turmas consultando a API
async function refreshTable(user) {
  const tableBody = document.getElementById("classes-table-body");
  if (!tableBody) return;

  const colspan = user.role === "admin" ? 5 : 4;
  tableBody.innerHTML = `<tr><td colspan="${colspan}">Carregando...</td></tr>`;

  try {
    const response = await getAllClasses();
    allClassData = response.classes || [];
    let classesToRender = allClassData;

    // Se for professor, mostra só as turmas dele
    if (user.role === "professor") {
      classesToRender = allClassData.filter((c) => c.professor_id === user.id);
    }

    renderClassesTable(classesToRender, user.role);
  } catch (error) {
    console.error("Erro ao carregar turmas:", error);
    tableBody.innerHTML = `<tr><td colspan="${colspan}">Erro ao carregar dados.</td></tr>`;
  }
}

// Lida com envio do formulário para criar ou editar turmas
async function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const errorMessageElement = form.querySelector(".form__error-message");
  errorMessageElement.textContent = "";

  const formData = new FormData(form);
  const id = formData.get("id")?.trim();
  const mode = form.dataset.mode;
  const classData = {
    name: formData.get("name"),
    shift: formData.get("shift"),
    time: formData.get("time"),
    number_of_vacancies: Number(formData.get("number_of_vacancies")),
  };

  try {
    if (mode === "edit" && id) {
      await updateClass(id, classData); // Edita a turma
    } else {
      await createClass(classData); // Cria uma nova turma
    }

    form.closest(".modal").classList.add("modal--hidden"); // Fecha modal
    form.reset();
    delete form.dataset.mode;
  } catch (error) {
    errorMessageElement.textContent = error.message || "Erro ao salvar turma.";
  }
}

// Detecta cliques nos botões da tabela (editar e deletar)
function handleTableClick(event, userRole) {
  if (userRole !== "admin") return; // Só admin pode editar ou apagar

  const target = event.target;
  const row = target.closest("tr");
  if (!row || !row.dataset.id) return;

  const id = row.dataset.id;
  const modal = document.querySelector(".modal--add-class");
  const form = modal.querySelector("form");
  const modalTitle = modal.querySelector(".modal__title");

  if (target.classList.contains("btn--edit")) {
    const classToEdit = allClassData.find((c) => c.id == id);
    if (classToEdit) {
      form.reset();
      form.dataset.mode = "edit";
      form.querySelector('[name="id"]').value = classToEdit.id;
      form.querySelector('[name="name"]').value = classToEdit.name;
      form.querySelector('select[name="shift"]').value = classToEdit.shift;
      form.querySelector('input[name="time"]').value = classToEdit.time;
      form.querySelector('input[name="number_of_vacancies"]').value =
        classToEdit.number_of_vacancies;
      modalTitle.textContent = "Editar turma";
      form.querySelector(".btn--submit").textContent = "Salvar Alterações";
      modal.classList.remove("modal--hidden"); // Abre modal
    }
  }

  if (target.classList.contains("btn--delete")) {
    if (confirm("Tem certeza que deseja apagar esta turma?")) {
      deleteClass(id).catch((error) => alert(error.message));
    }
  }
}

// Filtra as turmas pelo texto digitado na busca
function handleSearch(event, user) {
  const query = event.target.value.toLowerCase();

  let filteredData = allClassData;
  if (user.role === "professor") {
    filteredData = allClassData.filter((c) => c.professor_id === user.id);
  }

  const finalFiltered = filteredData.filter((c) =>
    c.name.toLowerCase().includes(query)
  );
  renderClassesTable(finalFiltered, user.role);
}

// Inicializa toda a funcionalidade da tela de turmas
export async function initializeClassesFeature(user) {
  const container = document.getElementById("classes-container");
  if (!container || !user) return;

  const refreshWithUserContext = () => refreshTable(user);

  if (!isInitialized) {
    renderInitialLayout(container, user.role);

    const modal = container.querySelector(".modal--add-class");
    const modalForm = modal.querySelector("form");
    const tableBody = container.querySelector("#classes-table-body");
    const searchInput = container.querySelector(".search__input--classes");

    if (user.role === "admin") {
      const openModalButton = container.querySelector(".btn--open-modal");
      const modalCloseButtons = container.querySelectorAll(
        ".modal__close, .modal__close-btn"
      );

      openModalButton.addEventListener("click", () => {
        modalForm.reset();
        modalForm.dataset.mode = "add";
        modalForm.querySelector('[name="id"]').value = "";
        modal.querySelector(".modal__title").textContent =
          "Cadastrar nova turma";
        modal.querySelector(".btn--submit").textContent = "Cadastrar";
        modal.classList.remove("modal--hidden");
      });

      modalCloseButtons.forEach((btn) =>
        btn.addEventListener("click", () => {
          modal.classList.add("modal--hidden");
          modalForm.reset();
          delete modalForm.dataset.mode;
        })
      );

      modalForm.addEventListener("submit", async (event) => {
        await handleFormSubmit(event);
        await refreshWithUserContext(); // Atualiza tabela
      });

      tableBody.addEventListener("click", async (event) => {
        handleTableClick(event, user.role);
        await refreshWithUserContext();
      });
    }

    searchInput.addEventListener("input", (event) => handleSearch(event, user));
    isInitialized = true;
  }

  await refreshWithUserContext();
}
