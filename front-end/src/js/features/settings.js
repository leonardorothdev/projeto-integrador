import { apiFetch } from '../lib/api.js';
import { getAuthData } from './auth.js';

// Controle para evitar inicialização repetida
let isInitialized = false;

// Funções para comunicação com a API (atualiza e busca dados do usuário)
const updateUserProfile = (id, data) => apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
const getCurrentUserData = (id) => apiFetch(`/users/${id}`);

// Renderiza o layout inicial da página de configurações
function renderInitialLayout(container) {
  container.innerHTML = `
    <h2 class="main-title">Configurações</h2>
    <div class="settings__container">
      <div class="settings__card">
        <h3 class="card-title">Editar perfil</h3>
        <form class="form form--profile">
          <label for="profile-name">Nome</label>
          <input type="text" class="form__input" name="name" required />

          <label for="profile-username">Nome de usuário (não pode ser alterado)</label>
          <input type="text" class="form__input" name="username" readonly disabled />

          <label for="profile-email">Email</label>
          <input type="email" class="form__input" name="email" required />

          <label for="profile-phone">Telefone</label>
          <input type="tel" class="form__input" name="phone" placeholder="(99) 99999-9999" />
          
          <div data-permission="admin">
            <label for="profile-role">Cargo</label>
            <select class="form__input" name="role">
              <option value="admin">Admin</option>
              <option value="professor">Professor</option>
            </select>
          </div>

          <label for="profile-password">Nova senha (opcional)</label>
          <input type="password" class="form__input" name="password" placeholder="Deixe em branco para manter" />

          <label for="profile-confirm-password">Confirmar nova senha</label>
          <input type="password" class="form__input" name="confirm_password" placeholder="Repita a nova senha" />

          <div class="form__buttons">
            <button type="submit" class="btn btn--submit">Salvar alterações</button>
          </div>
          <p class="form__success-message" style="color: green;"></p>
          <p class="form__error-message" style="color: red;"></p>
        </form>
      </div>
      <div class="settings__card">
        <div class="settings__right">
          <h4 class="card-title">Aparência</h4>
          <div class="settings__theme-switch">
            <button class="settings__theme-btn">
              <i data-lucide="sun"></i>
              <i data-lucide="moon"></i>
            </button>
            <p class="settings__theme-label">Modo escuro</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Preenche os campos do formulário com os dados do usuário
function populateProfileForm(form, userData) {
  if (!form || !userData) return;
  form.querySelector('[name="name"]').value = userData.name || '';
  form.querySelector('[name="username"]').value = userData.username || '';
  form.querySelector('[name="email"]').value = userData.email || '';
  form.querySelector('[name="phone"]').value = userData.phone || '';
  
  const roleSelect = form.querySelector('[name="role"]');
  if (roleSelect) {
    roleSelect.value = userData.role || '';
  }
}

// Configura a troca de tema (claro/escuro)
function setupThemeToggle() {
  const themeButton = document.querySelector(".settings__theme-btn");
  const themeLabel = document.querySelector(".settings__theme-label");

  const applyTheme = (theme) => {
    document.body.classList.toggle("dark-mode", theme === "dark");
    if (themeLabel) {
      themeLabel.textContent = theme === "dark" ? "Modo claro" : "Modo escuro";
    }
    if (window.lucide) {
      lucide.createIcons();
    }
  };

  const savedTheme = localStorage.getItem("theme") || "light";
  applyTheme(savedTheme);

  if (themeButton) {
    themeButton.addEventListener("click", () => {
      const newTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
      localStorage.setItem("theme", newTheme);
      applyTheme(newTheme);
    });
  }
}

// Envia o formulário para atualizar os dados do perfil
async function handleProfileSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const successMessage = form.querySelector('.form__success-message');
  const errorMessage = form.querySelector('.form__error-message');
  successMessage.textContent = '';
  errorMessage.textContent = '';

  const formData = new FormData(form);
  
  const authData = getAuthData();
  if (!authData) {
    errorMessage.textContent = 'Sessão inválida. Por favor, faça login novamente.';
    return;
  }

  // Monta os dados para enviar na atualização
  const userData = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    role: authData.user.role === 'admin' ? formData.get('role') : authData.user.role,
  };
  
  const newPassword = formData.get('password');
  const confirmPassword = formData.get('confirm_password');

  // Verifica se a senha nova é válida
  if (newPassword) {
    if (newPassword !== confirmPassword) {
      errorMessage.textContent = 'As senhas não coincidem. Por favor, tente novamente.';
      return;
    }
    if (newPassword.length < 8) {
      errorMessage.textContent = 'A nova senha deve ter pelo menos 8 caracteres.';
      return;
    }
    userData.password = newPassword;
  }

  try {
    const updatedUserResponse = await updateUserProfile(authData.user.id, userData);
    successMessage.textContent = 'Perfil atualizado com sucesso!';
    
    // Limpa campos de senha
    form.querySelector('[name="password"]').value = '';
    form.querySelector('[name="confirm_password"]').value = '';

    // Atualiza os dados do usuário no localStorage e na interface
    localStorage.setItem('userInfo', JSON.stringify(updatedUserResponse.user));
    document.getElementById('welcome-message').textContent = updatedUserResponse.user.name;
    
    populateProfileForm(form, updatedUserResponse.user);
    
  } catch (error) {
    errorMessage.textContent = error.message;
  }
}

// Função principal para iniciar a tela de configurações
export async function initializeSettingsFeature() {
  const container = document.getElementById("settings-container");
  if (!container) return;

  if (!isInitialized) {
    renderInitialLayout(container);

    const profileForm = container.querySelector(".form--profile");
    profileForm.addEventListener('submit', handleProfileSubmit);
    
    setupThemeToggle();
    isInitialized = true;
  }

  // Busca os dados do usuário logado e preenche o formulário
  const authData = getAuthData();
  if (authData && authData.user) {
    try {
      const currentUserData = await getCurrentUserData(authData.user.id);
      const profileForm = container.querySelector(".form--profile");
      populateProfileForm(profileForm, currentUserData);
    } catch (error) {
      console.error("Erro ao buscar dados do perfil:", error);
      const errorMessage = container.querySelector('.form__error-message');
      if (errorMessage) errorMessage.textContent = "Não foi possível carregar os dados do seu perfil.";
    }
  } else {
    const errorMessage = container.querySelector('.form__error-message');
    if (errorMessage) errorMessage.textContent = "Não foi possível carregar os dados do seu perfil. Tente fazer login novamente.";
  }
}
