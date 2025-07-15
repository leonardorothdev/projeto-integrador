import jwt from "jsonwebtoken";
import config from "../config/index.js";

// Middleware para verificar se o token JWT está presente e é válido
export const verifyToken = (req, res, next) => {
  // Pega o cabeçalho 'authorization' da requisição
  const authHeader = req.headers["authorization"];
  // Extrai o token do formato "Bearer token"
  const token = authHeader && authHeader.split(" ")[1];

  // Se não tiver token, retorna erro 401 (não autorizado)
  if (!token) {
    return res
      .status(401)
      .json({ message: "Acesso negado. Token não fornecido." });
  }

  try {
    // Verifica e decodifica o token usando a chave secreta
    const decoded = jwt.verify(token, config.jwt.secret);

    // Adiciona os dados do usuário decodificados ao objeto req para uso posterior
    req.user = decoded;
    // Continua para o próximo middleware ou rota
    next();
  } catch (error) {
    // Se o token for inválido ou expirado, retorna erro 403 (proibido)
    return res.status(403).json({ message: "Token inválido ou expirado." });
  }
};

// Middleware para verificar se o usuário é administrador
export const isAdmin = (req, res, next) => {
  // Se o usuário estiver autenticado e seu papel for 'admin', permite acesso
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    // Caso contrário, nega acesso com erro 403
    res
      .status(403)
      .json({
        message: "Acesso negado. Esta rota é exclusiva para administradores.",
      });
  }
};
