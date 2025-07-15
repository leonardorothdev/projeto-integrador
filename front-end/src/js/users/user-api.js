import { getAllData } from "../auth/auth.js";

const USERS_API_URL = "http://localhost:3000/api/users";
const AUTH_API_URL = "http://localhost:3000/api/auth";

const getAuthHeaders = () => {
  const userData = getAllData();
  if (!userData || !userData.token) {
    console.error("Token de autenticação não encontrado.");
    return null;
  }
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${userData.token}`,
  };
};

// GET all users (requer token de admin)
export const getAllUsers = async () => {
  const headers = getAuthHeaders();
  if (!headers) throw new Error("Usuário não autenticado.");

  const response = await fetch(USERS_API_URL, { headers });
  if (!response.ok) {
    throw new Error("Falha ao buscar os usuários. Acesso negado.");
  }
  return await response.json();
};

// POST a new user (usa o endpoint de registro)
export const createUser = async (userData) => {
  const response = await fetch(`${AUTH_API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Falha ao criar o usuário.");
  }
  return await response.json();
};

// PUT (update) an existing user
export const updateUser = async (id, userData) => {
  const headers = getAuthHeaders();
  if (!headers) throw new Error("Usuário não autenticado.");

  const response = await fetch(`${USERS_API_URL}/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Falha ao atualizar o usuário.");
  }
  return await response.json();
};

// DELETE a user
export const deleteUser = async (id) => {
  const headers = getAuthHeaders();
  if (!headers) throw new Error("Usuário não autenticado.");

  const response = await fetch(`${USERS_API_URL}/${id}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Falha ao apagar o usuário.");
  }
  return await response.json();
};
