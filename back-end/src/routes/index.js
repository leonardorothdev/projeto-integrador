// src/routes/index.js
import { Router } from "express";

// Importação dos arquivos de rotas
import authRoutes from "./users/auth-routes.js"; // Rotas de autenticação (login e registro)
import userRoutes from "./users/user-routes.js"; // Rotas para gerenciamento de usuários
import classRoutes from "./classes/class-routes.js"; // Rotas para gerenciamento de turmas
import studentRoutes from "./students/student-routes.js"; // Rotas para gerenciamento de estudantes

const router = Router();

// Rota raiz da API
router.get("/", (req, res) => {
  res.status(200).json({
    message: "API está no ar! Bem-vindo(a).",
  });
});

// Agrupamento das rotas por prefixo
router.use("/auth", authRoutes);
router.use("/classes", classRoutes);
router.use("/students", studentRoutes);
router.use("/users", userRoutes);

export default router;
