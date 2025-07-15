import { Router } from "express";

import * as studentController from "../../controllers/students/student-controller.js";

import { verifyToken, isAdmin } from "../../middlewares/auth-middleware.js";

const router = Router();

// Rota para listar todos os estudantes (requer autenticação)
router.get("/", verifyToken, studentController.getAllStudents);

// Rota para buscar um estudante pelo ID (requer autenticação)
router.get("/:id", verifyToken, studentController.getStudentById);

// Rota para criar um novo estudante (requer autenticação e perfil admin)
router.post("/", verifyToken, isAdmin, studentController.createStudent);

// Rota para atualizar um estudante pelo ID (requer autenticação e perfil admin)
router.put("/:id", verifyToken, isAdmin, studentController.updateStudent);

// Rota para deletar um estudante pelo ID (requer autenticação e perfil admin)
router.delete("/:id", verifyToken, isAdmin, studentController.deleteStudent);

export default router;
