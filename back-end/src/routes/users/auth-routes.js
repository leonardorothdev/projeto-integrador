import { Router } from "express";
import { register, login } from "../../controllers/users/auth-controller.js";

const authRoutes = Router();

// Rota para registrar um novo usuário (criar conta)
authRoutes.post("/register", register);

// Rota para realizar login (autenticar usuário)
authRoutes.post("/login", login);

export default authRoutes;
