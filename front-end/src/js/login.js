// Importa só a função que faz o login do módulo de autenticação
import { loginUser } from './features/auth.js';

// Pega os elementos do formulário e dos campos de email, senha e erro no HTML
const loginForm = document.querySelector(".login__form");
const emailInput = document.querySelector("#username");
const passwordInput = document.querySelector("#password");
const errorMessage = document.getElementById("login-error-message");

// Se o formulário existir, adiciona um evento para quando enviar o formulário
if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Impede o envio normal para tratar com JS

    errorMessage.textContent = ""; // Limpa mensagens de erro antigas

    // Pega o valor do email e senha digitados pelo usuário
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Verifica se algum campo está vazio e mostra erro se estiver
    if (!email || !password) {
      errorMessage.textContent = "Por favor, preencha todos os campos.";
      return; // Para aqui para o usuário corrigir
    }

    try {
      // Tenta fazer o login usando a função que chama a API
      const user = await loginUser(email, password);

      // Se login foi bem sucedido, redireciona para a página do dashboard
      if (user) {
        window.location.href = "../pages/dashboard.html";
      }
    } catch (error) {
      // Se der erro, mostra a mensagem que veio do módulo de autenticação
      errorMessage.textContent = error.message;
    }
  });
}
