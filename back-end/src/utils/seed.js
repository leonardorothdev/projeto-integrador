// seed.js
// Script para popular o banco via API

const BASE_URL = "http://localhost:3000/api";

// Usuários que serão criados
const usersToCreate = [
  {
    name: "Admin",
    username: "admin.sistema",
    email: "admin@sistema.com",
    password: "adminpassword",
    role: "admin",
    phone: "49999000001",
  },
  {
    name: "Professora Ana",
    username: "ana.prof",
    email: "ana.prof@escola.com",
    password: "12345678",
    role: "professor",
    phone: "49999000002",
  },
  {
    name: "Professor Bruno",
    username: "bruno.prof",
    email: "bruno.prof@escola.com",
    password: "12345678",
    role: "professor",
    phone: "49999000003",
  },
  {
    name: "Professora Carla",
    username: "carla.prof",
    email: "carla.prof@escola.com",
    password: "12345678",
    role: "professor",
    phone: "49999000004",
  },
];

// Turmas que serão criadas
const classesToCreate = [
  {
    name: "Matemática Avançada",
    shift: "Matutino",
    time: "08:00 - 10:00",
    number_of_vacancies: 25,
  },
  {
    name: "Clube de Leitura",
    shift: "Vespertino",
    time: "14:00 - 15:30",
    number_of_vacancies: 15,
  },
  {
    name: "Laboratório de Ciências",
    shift: "Matutino",
    time: "10:00 - 12:00",
    number_of_vacancies: 20,
  },
];

// Estudantes que serão criados
const studentsToCreate = [
  {
    name: "Lucas Pereira",
    birth_date: "2010-05-15",
    age: 14,
    institution: "Escola Bom Pastor",
    grade: "8º Ano",
    nationality: "Brasileiro",
    hometown: "Chapecó",
    state: "SC",
    marital_status: "Solteiro(a)",
    profession: "Estudante",
    sex: "masculino",
    responsible_name: "Marcos Pereira",
    responsible_contact: "49988112233",
    cpf: "111.222.333-44",
    rg: "1122334",
    uf: "SC",
    address: "Rua das Flores, 10",
    has_health_plan: true,
    uses_medication: false,
    has_allergy: false,
    has_special_needs: false,
    image_authorization: true,
  },
  {
    name: "Juliana Costa",
    birth_date: "2011-02-20",
    age: 13,
    institution: "Escola Luiza Santin",
    grade: "7º Ano",
    nationality: "Brasileira",
    hometown: "Xaxim",
    state: "SC",
    marital_status: "Solteiro(a)",
    profession: "Estudante",
    sex: "feminino",
    responsible_name: "Fernanda Costa",
    responsible_contact: "49988445566",
    cpf: "222.333.444-55",
    rg: "2233445",
    uf: "SC",
    address: "Avenida Principal, 200",
    has_health_plan: false,
    uses_medication: true,
    allergy_description: "Poeira",
    has_allergy: true,
    has_special_needs: false,
    image_authorization: true,
  },
  {
    name: "Gabriel Oliveira",
    birth_date: "2010-09-01",
    age: 14,
    institution: "Escola André Marafon",
    grade: "8º Ano",
    nationality: "Brasileiro",
    hometown: "Concórdia",
    state: "SC",
    marital_status: "Solteiro(a)",
    profession: "Estudante",
    sex: "masculino",
    responsible_name: "Ricardo Oliveira",
    responsible_contact: "49988778899",
    cpf: "333.444.555-66",
    rg: "3344556",
    uf: "SC",
    address: "Rua do Comércio, 55",
    has_health_plan: true,
    uses_medication: false,
    has_allergy: false,
    has_special_needs: false,
    image_authorization: false,
  },
];

// Função para enviar dados para API
async function postData(endpoint, body, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(`Erro ao criar em ${endpoint}:`, data.message || response.statusText);
    throw new Error(data.message);
  }

  console.log(`Criado: ${body.name || body.email}`);
  return data;
}

// Função principal para rodar o seed
async function seedDatabase() {
  try {
    console.log("Iniciando seed...");

    // Criar admin
    console.log("Criando admin...");
    const adminUser = usersToCreate.find((user) => user.role === "admin");
    await postData("/auth/register", adminUser);

    // Login admin
    console.log("Logando admin...");
    const loginResponse = await postData("/auth/login", {
      email: adminUser.email,
      password: adminUser.password,
    });
    const adminToken = loginResponse.token;

    if (!adminToken) throw new Error("Token não obtido");

    // Criar turmas
    console.log("Criando turmas...");
    const createdClasses = await Promise.all(
      classesToCreate.map((turma) => postData("/classes", turma, adminToken))
    );
    const classIds = createdClasses.map((c) => c.class.id);

    // Criar professores e vincular turmas
    console.log("Criando professores...");
    const professors = usersToCreate.filter((user) => user.role === "professor");
    const professorsWithClasses = professors.map((professor, index) => {
      if (index === 0) return { ...professor, classIds: [classIds[0], classIds[1]] };
      if (index === 1) return { ...professor, classIds: [classIds[0]] };
      if (index === 2) return { ...professor, classIds: [classIds[2]] };
      return professor;
    });

    await Promise.all(professorsWithClasses.map((professor) => postData("/auth/register", professor)));

    // Criar estudantes e vincular turmas
    console.log("Criando estudantes...");
    const studentsWithClasses = studentsToCreate.map((student, index) => {
      if (index === 0) return { ...student, classIds: [classIds[0]] };
      if (index === 1) return { ...student, classIds: [classIds[1], classIds[2]] };
      if (index === 2) return { ...student, classIds: [classIds[0], classIds[2]] };
      return student;
    });

    await Promise.all(studentsWithClasses.map((student) => postData("/students", student, adminToken)));

    console.log("Seed concluído.");
  } catch (error) {
    console.error("Erro no seed:", error.message);
    process.exit(1);
  }
}

seedDatabase();
