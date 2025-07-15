# Projeto Integrador - Sistema Escolar (Full Stack)

Este é um sistema de gerenciamento escolar simples, composto por um painel de controle (front-end) e uma API RESTful (back-end). A aplicação foi desenvolvida como parte das disciplinas de **Engenharia de Software** e **Programação II**.

O painel de controle é uma aplicação **SPA-like** (Single Page Application) que oferece recursos para gerenciamento de **turmas, usuários, estudantes e configurações**, com controle de acesso baseado em **roles** (admin e professor). A comunicação é feita com uma API dedicada que gerencia toda a lógica de negócio e a persistência dos dados.

---

## Funcionalidades

**Autenticação de Usuários** (Login, Logout e Registro).

**Controle de Permissões** por nível de acesso (Admin / Professor).

**Gerenciamento Completo de Usuários**.

**Gerenciamento Completo de Turmas**.

**Gerenciamento Completo de Estudantes**.

**Vínculo** entre professores, estudantes e turmas.

**Interface Responsiva** e moderna.

**Tema Claro/Escuro** com persistência no navegador.

**Busca e Filtragem** dinâmica em tabelas.

---

## Tecnologias Utilizadas

### **Front-end**
- **HTML5, CSS3**
- **JavaScript**
- **Fetch API** para comunicação com o back-end.
- **LocalStorage** para persistência de sessão e tema.
- **Lucide Icons** (ícones SVG).

### **Back-end**
- **Node.js** (v22.16.0 ou superior).
- **Express.js** para a criação da API.
- **PostgreSQL** (v14.18 ou superior) como banco de dados.
- **JWT (JSON Web Token)** para autenticação e segurança de rotas.
- **Bcrypt.js** para hashing de senhas.

---

## Como Rodar o Projeto Localmente

Para executar o projeto completo, é necessário configurar e iniciar o back-end primeiro, e depois o front-end.

### **Parte 1: Configurando o Back-end (API)**

1.  **Pré-requisitos:**
    * Node.js (v22.16.0+).
    * PostgreSQL (v14.18+).

2.  **Clone o repositório do back-end**:
    ```bash
    git clone https://github.com/leonardorothdev/projeto-integrador
    cd projeto-integrador
    cd back-end
    ```

3.  **Instale as dependências:**
    ```bash
    npm install
    ```

4.  **Configure as Variáveis de Ambiente:**
    
    Crie um arquivo chamado `.env` na raiz do projeto back-end e preencha com suas credenciais do PostgreSQL.
    ```env
    DB_USER=nome_do_seu_usuario_postgres
    DB_HOST=localhost
    DB_NAME=nome_do_seu_banco
    DB_PASSWORD=senha_do_seu_banco
    DB_PORT=5432
    JWT_SECRET=48fsdjf3r9fjsd!@FDKJ34rjrf93rjfk3fjrk!@fdk
    JWT_EXPIRATION=1h
    PORT=3000
    ```

5.  **Crie as tabelas no banco de dados:**
    
    Este comando executará o script de migração para criar a estrutura necessária.
    ```bash
    node src/utils/run-migrations.js
    ```

6.  **Inicie o servidor da API:**

    O back-end estará rodando em `http://localhost:3000`.
    ```bash
    npm run dev
    ```

7. **Crie os dados iniciais:**

    Utilize um script para criar dados automaticamente.

    Em um outro terminal, execute:

     ```bash
    node src/utils/seed.js
    ```
    

### **Parte 2: Configurando o Front-end (Dashboard)**

1.  **Pré-requisitos:**
    * O back-end deve estar rodando na porta `3000`.


2.  **Inicie um servidor local:**
    
    Você pode usar qualquer servidor estático. A extensão **Live Server** do VS Code é uma ótima opção.
    Execute com o live server o arquivo index.html.

    **projetointegrador/front-end/pages/index.html** 

---

## Login de Teste

Para acessar o sistema, você pode usar os dados abaixo, que devem ser criados previamente no back-end.

-   **Admin:**
    -   **Email:** `admin@sistema.com`
    -   **Senha:** `adminpassword`

-   **Professor:**
    -   **Usuário:** `ana.prof@escola.com`
    -   **Senha:** `12345678`

---

## Endpoints da API

A API segue uma arquitetura RESTful. Todas as rotas (exceto `/auth`) são protegidas e exigem um token JWT.

-   `POST /api/auth/login`: Realiza o login.
-   `POST /api/auth/register`: Cadastra um novo usuário.

-   `GET /api/users`: Lista todos os usuários (Admin).
-   `GET /api/users/:id`: Retorna um usuário específico.
-   `PUT /api/users/:id`: Atualiza um usuário.
-   `DELETE /api/users/:id`: Deleta um usuário (Admin).

-   `GET /api/classes`: Retorna turmas (Admin: todas; Professor: apenas as vinculadas).
-   `POST /api/classes`: Cria uma nova turma (Admin).
-   `PUT /api/classes/:id`: Edita uma turma (Admin).
-   `DELETE /api/classes/:id`: Deleta uma turma (Admin).

-   `GET /api/students`: Retorna estudantes (Admin: todos; Professor: apenas os de suas turmas).
-   `POST /api/students`: Cria um novo estudante (Admin).
-   `PUT /api/students/:id`: Edita um estudante (Admin).
-   `DELETE /api/students/:id`: Deleta um estudante (Admin).

---

## Guia de Testes da API (Postman)

Para garantir que o back-end está funcionando corretamente, siga este guia de testes usando o Postman ou uma ferramenta similar.

### 1. Cadastro e Login

#### 1.1. Registrar Usuário Administrador
-   **Método:** `POST`
-   **URL:** `http://localhost:3000/api/auth/register`
-   **Body (JSON):**
    ```json
    {
        "name": "admin",
        "username": "admin",
        "email": "admin@teste.com",
        "password": "123456",
        "role": "admin",
        "phone": "49999999999"
    }
    ```

#### 1.2. Registrar Usuário Professor
-   **Método:** `POST`
-   **URL:** `http://localhost:3000/api/auth/register`
-   **Body (JSON):**
    ```json
    {
        "name": "Professor Teste",
        "username": "prof.teste",
        "email": "professor@teste.com",
        "password": "123456",
        "role": "professor",
        "phone": "49999990002"
    }
    ```

#### 1.3. Efetuar Login
-   **Método:** `POST`
-   **URL:** `http://localhost:3000/api/auth/login`
-   **Body (JSON):**
    ```json
    {
        "email": "admin@teste.com",
        "password": "123456"
    }
    ```
**Ação:** Copie o `token` JWT retornado. Ele será usado no Header (`Authorization: Bearer <seu_token>`) para autenticar as próximas requisições.

*(Repita o processo de login para o professor para obter o token dele).*

---

### 2. Rotas de Turmas (usando token de Admin)

#### 2.1. Criar Turma
-   **Método:** `POST`
-   **URL:** `http://localhost:3000/api/classes`
-   **Body (JSON):**
    ```json
    {
        "name": "Oficina de Robótica",
        "shift": "Vespertino",
        "time": "14:00 - 16:00",
        "number_of_vacancies": 20
    }
    ```

#### 2.2. Vincular Professor a uma Turma
-   **Método:** `PUT`
-   **URL:** `http://localhost:3000/api/users/2` (Use o ID do professor criado)
-   **Body (JSON):**
    ```json
    {
        "name": "Professor Teste",
        "email": "professor@teste.com",
        "role": "professor",
        "phone": "49988887777",
        "classIds": [1]
    }
    ```

### 3. Rotas de Estudantes (usando token de Admin)

#### 3.1. Criar Estudante
-   **Método:** `POST`
-   **URL:** `http://localhost:3000/api/students`
-   **Body (JSON):**
    ```json
    {
        "name": "Mariana Alves",
        "birth_date": "2012-02-10",
        "age": 13,
        "institution": "Escola Modelo",
        "grade": "7º Ano",
        "nationality": "Brasileira",
        "hometown": "Chapecó",
        "state": "SC",
        "marital_status": "Solteira",
        "profession": "Estudante",
        "sex": "feminino",
        "responsible_name": "Juliana Alves",
        "responsible_contact": "49977776666",
        "cpf": "123.456.789-00",
        "rg": "1234567",
        "uf": "SC",
        "address": "Rua Teste, 123",
        "has_health_plan": false,
        "uses_medication": false,
        "has_allergy": false,
        "has_special_needs": false,
        "image_authorization": true,
        "classIds": [1]
    }
    ```

### 4. Verificando Permissões (usando token de Professor)

-   **Listar Turmas:**
    -   **Método:** `GET`
    -   **URL:** `http://localhost:3000/api/classes`
    -   **Retorno Esperado:** Um array contendo apenas a "Oficina de Robótica" (ID 1).

-   **Listar Estudantes:**
    -   **Método:** `GET`
    -   **URL:** `http://localhost:3000/api/students`
    -   **Retorno Esperado:** Um array contendo apenas os dados da estudante "Mariana Alves".

---

## Licença

Este projeto é de uso acadêmico, desenvolvido como parte de um trabalho para as disciplinas de **Engenharia de Software** e **Programação II**.
