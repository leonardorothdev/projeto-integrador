import { getAuthData } from "../features/auth.js";

// URL base do back-end
const API_BASE_URL = "http://localhost:3000/api";

// Função para fazer requisições à API com autenticação
export async function apiFetch(endpoint, options = {}) {
  // Pega os dados do usuário (token) salvos no localStorage
  const authData = getAuthData();

  // Define os cabeçalhos padrão
  const headers = {
    "Content-Type": "application/json",
    ...options.headers, // Permite adicionar ou sobrescrever cabeçalhos
  };

  // Se existir token, adiciona no Authorization
  if (authData && authData.token) {
    headers["Authorization"] = `Bearer ${authData.token}`;
  }

  try {
    // Faz a requisição para o endpoint da API
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Se a resposta não deu certo, pega a mensagem de erro e lança uma exceção
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Erro na requisição: ${response.statusText}`
      );
    }

    // Se for DELETE e não tiver conteúdo, retorna objeto vazio
    if (response.status === 204) {
      return {};
    }

    // Caso contrário, retorna o JSON da resposta
    return response.json();
  } catch (error) {
    console.error(`Erro na chamada da API para: ${endpoint}`, error);
    throw error; // Repassa o erro para quem chamou
  }
}
