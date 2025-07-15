import { Router } from "express";

import {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
} from "../../controllers/classes/class-controller.js";

import { verifyToken, isAdmin } from "../../middlewares/auth-middleware.js";

const classRoutes = Router();

// Rota para criar uma nova turma (só admin autorizado)
classRoutes.post("/", verifyToken, isAdmin, createClass);

// Rota para obter todas as turmas (usuário autenticado)
classRoutes.get("/", verifyToken, getAllClasses);

// Rota para obter uma turma específica pelo ID (usuário autenticado)
classRoutes.get("/:id", verifyToken, getClassById);

// Rota para atualizar uma turma pelo ID (só admin autorizado)
classRoutes.put("/:id", verifyToken, isAdmin, updateClass);

// Rota para deletar uma turma pelo ID (só admin autorizado)
classRoutes.delete("/:id", verifyToken, isAdmin, deleteClass);

export default classRoutes;
