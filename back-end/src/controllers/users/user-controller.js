import * as UserModel from "../../models/user-model.js";
import bcrypt from "bcryptjs";

// Retorna todos os usuários cadastrados
export const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.findAll();
    // Envia os usuários dentro de um objeto para manter consistência
    res.json({ users });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ message: "Erro interno ao buscar usuários." });
  }
};

// Retorna um usuário específico pelo ID recebido na URL
export const getUserById = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }
    res.json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário por ID:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// Atualiza os dados de um usuário existente
export const updateUser = async (req, res) => {
  const userIdToUpdate = req.params.id;
  const loggedInUser = req.user;

  // Verifica se o usuário logado tem permissão para atualizar
  // Só admins ou o próprio usuário podem atualizar os dados
  if (
    loggedInUser.role !== "admin" &&
    loggedInUser.id.toString() !== userIdToUpdate
  ) {
    return res.status(403).json({ message: "Acesso negado." });
  }

  try {
    const { name, email, role, phone, password, classIds } = req.body;
    const userData = { name, email, role, phone };

    // Se a senha foi fornecida, cria o hash antes de salvar
    if (password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(password, salt);
    }

    // Atualiza o usuário no banco de dados
    const updatedUser = await UserModel.update(
      userIdToUpdate,
      userData,
      classIds
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ message: "Usuário não encontrado para atualização." });
    }

    res.json({ message: "Usuário atualizado com sucesso!", user: updatedUser });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    res.status(500).json({ message: "Erro interno ao atualizar usuário." });
  }
};

// Deleta um usuário pelo ID recebido na URL
export const deleteUser = async (req, res) => {
  const userIdToDelete = req.params.id;
  const loggedInUser = req.user;

  // Usuário não pode deletar a própria conta
  if (loggedInUser.id.toString() === userIdToDelete) {
    return res
      .status(400)
      .json({ message: "Você não pode deletar sua própria conta." });
  }

  try {
    // Remove o usuário do banco de dados
    const success = await UserModel.remove(userIdToDelete);

    if (!success) {
      return res
        .status(404)
        .json({ message: "Usuário não encontrado para exclusão." });
    }

    res.json({ message: "Usuário excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    res.status(500).json({ message: "Erro interno ao excluir usuário." });
  }
};
