import { apiFetch } from '../lib/api.js';

// Variáveis para guardar dados dos estudantes e turmas
let allStudentData = []; // Todos os estudantes
let visibleStudentData = []; // Estudantes filtrados de acordo com o usuário
let allClassDataForForm = []; // Lista de turmas para montar os checkboxes
let isInitialized = false; // Para evitar inicialização duplicada

// Funções que chamam a API
const getAllStudents = () => apiFetch('/students'); // Pega todos os estudantes
const createStudent = (data) => apiFetch('/students', { method: 'POST', body: JSON.stringify(data) }); // Cria um novo estudante
const updateStudent = (id, data) => apiFetch(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }); // Atualiza estudante
const deleteStudent = (id) => apiFetch(`/students/${id}`, { method: 'DELETE' }); // Deleta estudante
const getClassesForForm = () => apiFetch('/classes'); // Pega todas as turmas para exibir no form

// Monta a parte inicial da tela com base no tipo de usuário (admin ou professor)
function renderInitialLayout(container, userRole) {
  const isAdmin = userRole === 'admin';
  container.innerHTML = `
    <h2 class="main-title">Estudantes</h2>
    <div class="section-controls">
      <div class="search">
        <input type="search" class="search__input search__input--students" placeholder="Procurar estudante por nome ou CPF...">
      </div>
      ${isAdmin ? '<button class="btn btn--default btn--open-modal">Cadastrar novo estudante</button>' : ''}
    </div>

    <div class="modal modal--add-student modal--hidden">
      <div class="modal__content modal__content--large">
        <span class="modal__close">&times;</span>
        <h3 class="modal__title">Cadastrar Novo Estudante</h3>
        <form class="form form--add-student">
          <input type="hidden" name="id" />
          <fieldset><legend>Dados Pessoais</legend></fieldset>
          <fieldset><legend>Documentos</legend></fieldset>
          <fieldset><legend>Informações Escolares</legend></fieldset>
          <fieldset><legend>Contato e Responsáveis</legend></fieldset>
          <fieldset><legend>Informações de Saúde</legend></fieldset>
          <fieldset>
            <legend>Matrícula e Autorizações</legend>
            <label>Oficinas para Matricular:</label>
            <div id="student-classes-checkboxes" class="checkbox-container"></div>
            </fieldset>
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
            <th>Idade</th>
            <th>Oficinas</th>
            <th>Contato</th>
            ${isAdmin ? '<th>Ações</th>' : ''}
          </tr>
        </thead>
        <tbody id="students-table-body"></tbody>
      </table>
    </div>
  `;
}

// Função para renderizar os checkboxes das turmas no formulário
function renderClassCheckboxes(classes, selectedClassIds = []) {
  // Aqui vai o código original sem mudanças
}

// Monta a tabela com a lista de estudantes
function renderStudentsTable(students, userRole) {
  const tableBody = document.getElementById("students-table-body");
  if (!tableBody) return;
  tableBody.innerHTML = "";
  const isAdmin = userRole === 'admin';
  const colspan = isAdmin ? 5 : 4;

  // Se não tiver estudantes, mostra uma mensagem
  if (!students || students.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="${colspan}">Nenhum estudante encontrado.</td></tr>`;
    return;
  }

  // Para cada estudante, cria uma linha na tabela
  students.forEach(student => {
    const row = tableBody.insertRow();
    row.dataset.id = student.id;
    const classNames = student.classes?.map(c => c.name).join(', ') || 'Nenhuma';

    // Se for admin, adiciona botões para editar e apagar
    const actionsCell = isAdmin ? `
      <td data-label="Ações">
        <button class="btn btn--edit">Editar</button>
        <button class="btn btn--delete">Apagar</button>
      </td>` : '';

    // Preenche as colunas
    row.innerHTML = `
      <td data-label="Nome">${student.name}</td>
      <td data-label="Idade">${student.age}</td>
      <td data-label="Oficinas">${classNames}</td>
      <td data-label="Contato">${student.responsible_contact}</td>
      ${actionsCell}
    `;
  });
}

// Atualiza a tabela de estudantes levando em conta a role do usuário
async function refreshTable(user) {
  const tableBody = document.getElementById("students-table-body");
  if (!tableBody) return;

  const colspan = user.role === 'admin' ? 5 : 4;
  tableBody.innerHTML = `<tr><td colspan="${colspan}">Carregando...</td></tr>`;

  try {
    // Busca todos os estudantes
    const studentsResponse = await getAllStudents();
    allStudentData = studentsResponse || [];
    let studentsToRender = [];

    // Se for admin, mostra todos os estudantes
    if (user.role === 'admin') {
      studentsToRender = allStudentData;
    } else if (user.role === 'professor') {
      // Se for professor, mostra apenas estudantes das turmas que ele leciona
      const classesResponse = await getClassesForForm();
      const allClasses = classesResponse.classes || [];

      const professorClassIds = new Set(
        allClasses
          .filter(c => c.professor_id === user.id)
          .map(c => c.id)
      );

      studentsToRender = allStudentData.filter(student => 
        student.classes?.some(sClass => professorClassIds.has(sClass.id))
      );
    }
    
    visibleStudentData = studentsToRender; // Salva lista filtrada para pesquisa
    renderStudentsTable(studentsToRender, user.role);

  } catch (error) {
    console.error("Falha ao atualizar a lista de estudantes:", error);
    if (tableBody) tableBody.innerHTML = `<tr><td colspan="${colspan}">${error.message}</td></tr>`;
  }
}

// Quando enviar o formulário de cadastro/edição
async function handleFormSubmit(event) {
    // Código original sem mudanças
}

// Quando clicar na tabela (editar ou excluir)
function handleTableClick(event, userRole) {
  if (userRole !== 'admin') return; // Apenas admins podem editar/apagar

  const target = event.target;
  const row = target.closest("tr");
  if (!row || !row.dataset.id) return;

  const id = row.dataset.id;
  
  if (target.classList.contains("btn--edit")) {
      // Código original para edição
  }

  if (target.classList.contains("btn--delete")) {
    if (confirm("Tem certeza que deseja apagar este estudante?")) {
      deleteStudent(id)
        .catch((error) => alert(error.message));
    }
  }
}

// Faz a busca filtrando os estudantes já carregados
function handleSearch(event) {
  const query = event.target.value.toLowerCase();
  const filteredStudents = visibleStudentData.filter(student =>
    student.name.toLowerCase().includes(query) ||
    student.cpf?.includes(query)
  );
  const userRole = document.body.dataset.role;
  renderStudentsTable(filteredStudents, userRole);
}

// Função principal para inicializar tudo
export async function initializeStudentsFeature(user) {
  const container = document.getElementById("students-container");
  if (!container || !user) return;

  const refreshWithUserContext = () => refreshTable(user);

  if (!isInitialized) {
    renderInitialLayout(container, user.role);
    
    const searchInput = container.querySelector(".search__input--students");
    const tableBody = container.querySelector("#students-table-body");

    searchInput.addEventListener("input", handleSearch);

    if (user.role === 'admin') {
      const openModalButton = container.querySelector(".btn--open-modal");
      const modal = container.querySelector(".modal--add-student");
      const modalCloseButtons = container.querySelectorAll(".modal__close, .modal__close-btn");
      const modalForm = container.querySelector(".form--add-student");

      openModalButton.addEventListener("click", () => {
        // Código para abrir modal
      });
      modalCloseButtons.forEach(btn => btn.addEventListener("click", () => {
        // Código para fechar modal
      }));

      modalForm.addEventListener("submit", async (event) => {
        await handleFormSubmit(event);
        await refreshWithUserContext();
      });

      tableBody.addEventListener("click", async (event) => {
        handleTableClick(event, user.role);
        if (event.target.classList.contains('btn--delete')) {
            await refreshWithUserContext();
        }
      });

      // Carrega as turmas para o formulário
      try {
        const response = await getClassesForForm();
        allClassDataForForm = response.classes || [];
      } catch (error) {
        console.error("Não foi possível carregar a lista de oficinas.", error);
      }
    }
    isInitialized = true;
  }
  await refreshWithUserContext();
}
