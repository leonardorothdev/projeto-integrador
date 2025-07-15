// Aqui, estamos "puxando" uma função de outro arquivo.
// A `apiFetch` é como um atalho que criamos para conversar com o nosso servidor (back-end).
import { apiFetch } from '../lib/api.js';

// --- Variáveis para Guardar Informações ---
// Pense nelas como caixas que guardam dados enquanto a página está aberta.

// `allStudentData`: Uma lista (array) que vai guardar todos os estudantes que buscarmos da API.
let allStudentData = [];
// `allClassDataForForm`: Uma lista que vai guardar todas as turmas disponíveis, para podermos mostrar nos checkboxes do formulário.
let allClassDataForForm = [];
// `isInitialized`: Uma "bandeira" (true/false) para sabermos se a página de estudantes já foi montada pela primeira vez.
// Isso evita que a gente crie os botões e a estrutura várias vezes sem necessidade.
let isInitialized = false;

// --- Funções que Conversam com a API ---
// Cada uma dessas é uma "ponte" para uma rota específica do nosso back-end.

// Pede para a API a lista de todos os estudantes.
const getAllStudents = () => apiFetch('/students');
// Envia os dados de um novo estudante para a API para serem salvos.
const createStudent = (data) => apiFetch('/students', { method: 'POST', body: JSON.stringify(data) });
// Envia os dados de um estudante que foi editado para a API.
const updateStudent = (id, data) => apiFetch(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) });
// Pede para a API apagar um estudante com um ID específico.
const deleteStudent = (id) => apiFetch(`/students/${id}`, { method: 'DELETE' });
// Pede para a API a lista de todas as turmas (para usar no formulário).
const getClassesForForm = () => apiFetch('/classes');


// --- Funções que Montam a Interface (UI) ---

// Esta função "desenha" a estrutura inicial da página de estudantes.
// Ela cria o título, os botões, a tabela vazia e o modal (a janela de cadastro) que fica escondido.
function renderInitialLayout(container) {
  container.innerHTML = `
    <h2 class="main-title">Estudantes</h2>
    <div class="section-controls">
      <div class="search">
        <input type="search" class="search__input search__input--students" placeholder="Procurar estudante por nome ou CPF...">
      </div>
      <button class="btn btn--default btn--open-modal" data-permission="admin">Cadastrar novo estudante</button>
    </div>

    <div class="modal modal--add-student modal--hidden">
      <div class="modal__content modal__content--large">
        <span class="modal__close">&times;</span>
        <h3 class="modal__title">Cadastrar Novo Estudante</h3>
        <form class="form form--add-student">
          <input type="hidden" name="id" />
          
          <fieldset>
            <legend>Dados Pessoais</legend>
            <label>Nome Completo</label><input type="text" class="form__input" name="name" required />
            <label>Data de Nascimento</label><input type="date" class="form__input" name="birth_date" required />
            <label>Idade</label><input type="number" class="form__input" name="age" min="0" max="150" required />
            <label>Sexo</label><select class="form__input" name="sex" required><option value="" disabled selected>Selecione</option><option value="feminino">Feminino</option><option value="masculino">Masculino</option></select>
            <label>Nacionalidade</label><input type="text" class="form__input" name="nationality" />
            <label>Naturalidade (Cidade)</label><input type="text" class="form__input" name="hometown" />
            <label>Estado Civil</label><input type="text" class="form__input" name="marital_status" />
            <label>Profissão</label><input type="text" class="form__input" name="profession" />
          </fieldset>

          <fieldset>
            <legend>Documentos</legend>
            <label>CPF</label><input type="text" class="form__input" name="cpf" placeholder="999.999.999-99" required />
            <label>RG</label><input type="text" class="form__input" name="rg" required />
            <label>UF do RG</label><input type="text" class="form__input" name="uf" maxlength="2" />
          </fieldset>
          
          <fieldset>
            <legend>Informações Escolares</legend>
            <label>Instituição de Ensino</label><input type="text" class="form__input" name="institution" required />
            <label>Série/Ano</label><input type="text" class="form__input" name="grade" required />
          </fieldset>

          <fieldset>
            <legend>Contato e Responsáveis</legend>
            <label>Endereço Completo</label><textarea class="form__input" name="address" required></textarea>
            <label>Nome do Responsável Principal</label><input type="text" class="form__input" name="responsible_name" required />
            <label>Contato do Responsável Principal</label><input type="tel" class="form__input" name="responsible_contact" placeholder="(99) 99999-9999" required />
            <label>Nome de um Segundo Responsável (Opcional)</label><input type="text" class="form__input" name="additional_responsible_name" />
            <label>Contato do Segundo Responsável (Opcional)</label><input type="tel" class="form__input" name="additional_responsible_contact" />
          </fieldset>

          <fieldset>
            <legend>Informações de Saúde</legend>
            <label>Tipo Sanguíneo</label><input type="text" class="form__input" name="blood_type" />
            <label>Possui Plano de Saúde?</label><select class="form__input" name="has_health_plan"><option value="false">Não</option><option value="true">Sim</option></select>
            <label>Nome do Plano de Saúde</label><input type="text" class="form__input" name="health_plan_name" />
            <label>Usa Medicação Contínua?</label><select class="form__input" name="uses_medication"><option value="false">Não</option><option value="true">Sim</option></select>
            <label>Qual Medicação?</label><textarea class="form__input" name="medication_name"></textarea>
            <label>Possui Alergia?</label><select class="form__input" name="has_allergy"><option value="false">Não</option><option value="true">Sim</option></select>
            <label>Qual Alergia?</label><textarea class="form__input" name="allergy_type"></textarea>
            <label>Possui Necessidade Especial?</label><select class="form__input" name="has_special_needs"><option value="false">Não</option><option value="true">Sim</option></select>
            <label>Qual Necessidade?</label><textarea class="form__input" name="special_needs_type"></textarea>
          </fieldset>
          
          <fieldset>
            <legend>Matrícula e Autorizações</legend>
            <label>Oficinas para Matricular:</label>
            <div id="student-classes-checkboxes" class="checkbox-container"></div>
            <label>Autoriza o Uso de Imagem?</label>
            <select class="form__input" name="image_authorization"><option value="false">Não</option><option value="true">Sim</option></select>
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
          <tr><th>Nome</th><th>Idade</th><th>Oficinas</th><th>Contato</th><th data-permission="admin">Ações</th></tr>
        </thead>
        <tbody id="students-table-body"></tbody>
      </table>
    </div>
  `;
}

// Esta função pega a lista de turmas e cria um checkbox para cada uma dentro do formulário.
function renderClassCheckboxes(classes, selectedClassIds = []) {
  const container = document.getElementById('student-classes-checkboxes');
  if (!container) return;
  container.innerHTML = classes.length ? '' : 'Nenhuma oficina disponível.';
  classes.forEach(cls => {
    const isChecked = selectedClassIds.includes(cls.id);
    container.innerHTML += `
      <div class="checkbox-group">
        <input type="checkbox" name="classIds" value="${cls.id}" id="student-class-${cls.id}" ${isChecked ? 'checked' : ''}>
        <label for="student-class-${cls.id}">${cls.name}</label>
      </div>
    `;
  });
}

// Esta função pega a lista de estudantes vinda da API e desenha as linhas (<tr>) da tabela.
function renderStudentsTable(students) {
  const tableBody = document.getElementById("students-table-body");
  if (!tableBody) return;
  tableBody.innerHTML = "";

  if (!students || students.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5">Nenhum estudante encontrado.</td></tr>';
    return;
  }

  students.forEach(student => {
    const row = tableBody.insertRow();
    row.dataset.id = student.id;
    const classNames = student.classes && student.classes.length > 0 
      ? student.classes.map(c => c.name).join(', ') 
      : 'Nenhuma';

    row.innerHTML = `
      <td data-label="Nome">${student.name}</td>
      <td data-label="Idade">${student.age}</td>
      <td data-label="Oficinas">${classNames}</td>
      <td data-label="Contato">${student.responsible_contact}</td>
      <td data-label="Ações" data-permission="admin">
        <button class="btn btn--edit">Editar</button>
        <button class="btn btn--delete">Apagar</button>
      </td>
    `;
  });
}

// Uma função para atualizar a tabela. Ela primeiro chama a API para pegar os dados mais recentes
// e depois chama a `renderStudentsTable` para redesenhar a tabela com os novos dados.
async function refreshTable() {
  const tableBody = document.getElementById("students-table-body");
  if (!tableBody) return;
  tableBody.innerHTML = '<tr><td colspan="5">Carregando...</td></tr>';
  try {
    const data = await getAllStudents();
    allStudentData = data || [];
    renderStudentsTable(allStudentData);
  } catch (error) {
    console.error("Falha ao atualizar a lista de estudantes:", error);
    if(tableBody) tableBody.innerHTML = `<tr><td colspan="5">${error.message}</td></tr>`;
  }
}

// --- Funções que Lidam com Ações do Usuário (Eventos) ---

// Esta função é chamada quando o botão "Cadastrar" ou "Salvar Alterações" do formulário é clicado.
async function handleFormSubmit(event) {
  event.preventDefault(); // Impede o comportamento padrão do formulário de recarregar a página.
  const form = event.target;
  const errorElement = form.querySelector('.form__error-message');
  errorElement.textContent = '';
  
  const formData = new FormData(form);
  const id = formData.get("id");
  const mode = form.dataset.mode;
  
  // Pega todos os dados do formulário de uma vez só.
  const studentData = Object.fromEntries(formData.entries());
  
  // Pega os IDs de todas as turmas que foram marcadas com um checkbox.
  const checkedClasses = form.querySelectorAll('input[name="classIds"]:checked');
  studentData.classIds = Array.from(checkedClasses).map(cb => parseInt(cb.value, 10));

  // Converte os valores "true"/"false" (que vêm como texto do formulário) para verdadeiro/falso de verdade.
  for (const key in studentData) {
    if (studentData[key] === 'true') studentData[key] = true;
    if (studentData[key] === 'false') studentData[key] = false;
  }

  try {
    // Decide se deve chamar a API de criar ou de editar, com base no modo do formulário.
    if (mode === "edit") {
      await updateStudent(id, studentData);
    } else {
      await createStudent(studentData);
    }
    form.closest('.modal').classList.add('modal--hidden'); // Esconde o modal
    await refreshTable(); // Atualiza a tabela para mostrar as mudanças
  } catch (error) {
    errorElement.textContent = error.message; // Mostra uma mensagem de erro se algo der errado
  }
}

// Esta função é chamada quando qualquer parte da tabela é clicada.
// Ela usa "delegação de eventos" para descobrir se o clique foi em um botão de "Editar" ou "Apagar".
async function handleTableClick(event) {
  const target = event.target;
  const row = target.closest("tr");
  if (!row || !row.dataset.id) return;

  const id = row.dataset.id;
  const modal = document.querySelector(".modal--add-student");
  const form = modal.querySelector("form");

  // Se o clique foi em um botão de editar...
  if (target.classList.contains("btn--edit")) {
    const studentToEdit = allStudentData.find((s) => s.id == id);
    if (studentToEdit) {
      form.reset();
      form.dataset.mode = "edit"; // Coloca o formulário em modo de edição
      modal.querySelector(".modal__title").textContent = "Editar Estudante";
      
      // Preenche todos os campos do formulário com os dados do estudante que será editado.
      for (const key in studentToEdit) {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
          if (input.type === 'date' && studentToEdit[key]) {
            input.value = new Date(studentToEdit[key]).toISOString().split('T')[0];
          } else {
            input.value = studentToEdit[key];
          }
        }
      }
      
      const selectedClassIds = studentToEdit.classes ? studentToEdit.classes.map(c => c.id) : [];
      renderClassCheckboxes(allClassDataForForm, selectedClassIds);

      modal.classList.remove('modal--hidden'); // Mostra o modal
    }
  }

  // Se o clique foi em um botão de apagar...
  if (target.classList.contains("btn--delete")) {
    if (confirm("Tem certeza que deseja apagar este estudante?")) {
      deleteStudent(id).then(refreshTable).catch((error) => alert(error.message));
    }
  }
}

// Esta função é chamada toda vez que o usuário digita algo no campo de busca.
function handleSearch(event) {
  const query = event.target.value.toLowerCase();
  // Filtra a lista de estudantes para mostrar apenas aqueles cujo nome ou CPF correspondem à busca.
  const filteredStudents = allStudentData.filter(student =>
    student.name.toLowerCase().includes(query) ||
    (student.cpf && student.cpf.includes(query))
  );
  renderStudentsTable(filteredStudents); // Redesenha a tabela com os resultados filtrados.
}

// --- Função Principal de Inicialização ---
// Esta é a função que o `navigation.js` chama para iniciar tudo nesta seção.
export async function initializeStudentsFeature() {
  const container = document.getElementById("students-container");
  if (!container) return;

  // Se for a primeira vez que entramos aqui, monta o layout e configura os botões.
  if (!isInitialized) {
    renderInitialLayout(container);

    const openModalButton = container.querySelector(".btn--open-modal");
    const searchInput = container.querySelector(".search__input--students");
    const tableBody = container.querySelector("#students-table-body");
    const modal = container.querySelector(".modal--add-student");
    const modalForm = modal.querySelector("form");
    const modalCloseButtons = container.querySelectorAll(".modal__close, .modal__close-btn");

    // Prepara o modal para o modo de "Adicionar" quando o botão principal é clicado.
    const setupAddModal = () => {
      modalForm.reset();
      modalForm.dataset.mode = "add";
      modalForm.querySelector('[name="id"]').value = ''; // Limpa o ID para garantir que é uma criação
      modal.querySelector(".modal__title").textContent = "Cadastrar Novo Estudante";
      renderClassCheckboxes(allClassDataForForm);
      modal.classList.remove('modal--hidden');
    };

    openModalButton.addEventListener("click", setupAddModal);

    modalCloseButtons.forEach(btn => btn.addEventListener("click", () => modal.classList.add('modal--hidden')));
    modalForm.addEventListener("submit", handleFormSubmit);
    tableBody.addEventListener("click", handleTableClick);
    searchInput.addEventListener("input", handleSearch);

    // Busca a lista de turmas uma única vez para usar no formulário.
    try {
        const response = await getClassesForForm();
        allClassDataForForm = response.classes || [];
    } catch(error) {
        console.error("Não foi possível carregar a lista de oficinas para o formulário.", error);
    }

    isInitialized = true;
  }

  // Sempre que a seção de estudantes for aberta, atualiza a tabela com os dados mais recentes.
  await refreshTable();
}
