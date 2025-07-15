// URL base da API usada para autenticação
const API_BASE_URL = "http://localhost:3000/api";

export async function loginUser(email, password) {
  try {
    // Faz uma requisição para a rota de login enviando email e senha
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }), // Envia os dados no corpo da requisição
    });

    // Converte a resposta da API para JSON
    const data = await response.json();

    // Se a resposta não for OK, lança um erro
    if (!response.ok) {
      throw new Error(data.message || "Falha no login.");
    }

    // Salva o token e os dados do usuário no localStorage
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("userInfo", JSON.stringify(data.user));

    // Retorna os dados do usuário para usar em outras partes do sistema
    return data.user;
  } catch (error) {
    // Mostra o erro no console e repassa para quem chamou a função
    console.error("Erro na função loginUser:", error.message);
    throw error;
  }
}

export function logoutUser() {
  // Remove os dados de autenticação do localStorage
  localStorage.removeItem("authToken");
  localStorage.removeItem("userInfo");

  // Redireciona para a página de login
  window.location.href = "/pages/index.html";
}

export function getAuthData() {
  // Pega o token e as informações do usuário salvas no localStorage
  const token = localStorage.getItem("authToken");
  const userInfoString = localStorage.getItem("userInfo");

  // Se os dados existirem, tenta converter para objeto
  if (token && userInfoString) {
    try {
      const user = JSON.parse(userInfoString);
      return { token, user };
    } catch (e) {
      // Se der erro ao converter, limpa tudo para evitar problemas
      console.error("Erro ao analisar dados do usuário no localStorage:", e);
      localStorage.clear();
      return null;
    }
  }
  return null; // Se não encontrar dados, retorna null
}
