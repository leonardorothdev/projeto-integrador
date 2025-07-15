// src/routes/user-routes.js
import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../../controllers/users/user-controller.js";
import { verifyToken, isAdmin } from "../../middlewares/auth-middleware.js";

const router = express.Router();

// Lista todos os usuários - acesso protegido, somente administradores
router.get("/", verifyToken, isAdmin, getAllUsers);

// Busca um usuário específico pelo ID - acesso protegido (qualquer usuário autenticado)
router.get("/:id", verifyToken, getUserById);

// Atualiza um usuário pelo ID - acesso protegido (qualquer usuário autenticado, com regras no controller)
router.put("/:id", verifyToken, updateUser);

// Deleta um usuário pelo ID - acesso protegido, somente administradores
router.delete("/:id", verifyToken, isAdmin, deleteUser);

export default router;
