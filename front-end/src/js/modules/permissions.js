// Função para aplicar a role (cargo) do usuário no body
export function applyRolePermissions(role) {
  if (role) {
    // Salva a role no atributo data-role do body
    // Ex: <body data-role="admin"> -> isso ajuda no CSS para mostrar/esconder elementos
    document.body.dataset.role = role;
  }
}
