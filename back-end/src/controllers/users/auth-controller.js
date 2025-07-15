import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import * as UserModel from "../../models/user-model.js";
import config from "../../config/index.js";

// Função para registrar um novo usuário
export const register = async (req, res) => {
  // Extrai os dados do corpo da requisição
  const { name, username, email, password, role, phone, classIds } = req.body;

  // Validação dos campos obrigatórios
  if (!name || !username || !email || !password || !role) {
    return res
      .status(400)
      .json({
        message:
          "Nome, nome de usuário, email, senha e cargo são obrigatórios.",
      });
  }

  // Valida se o email tem formato correto
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Email inválido!" });
  }

  // Valida se a senha tem no mínimo 8 caracteres
  if (!validator.isLength(password, { min: 8 })) {
    return res
      .status(400)
      .json({ message: "A senha deve ter pelo menos 8 caracteres." });
  }

  try {
    // Gera um salt para o hash da senha
    const salt = await bcrypt.genSalt(10);
    // Cria o hash da senha com o salt
    const hashedPassword = await bcrypt.hash(password, salt);

    // Prepara os dados do usuário para criar no banco (com senha hashada)
    const userData = {
      name,
      username,
      email,
      password: hashedPassword,
      role,
      phone,
    };

    // Chama o model para criar o usuário no banco, incluindo as turmas
    const newUser = await UserModel.create(userData, classIds);

    // Retorna sucesso com os dados do novo usuário criado
    res
      .status(201)
      .json({ message: "Usuário registrado com sucesso!", user: newUser });
  } catch (error) {
    // Se o erro for violação de unicidade (email ou username já usados)
    if (error.code === "23505") {
      const field = error.constraint.includes("email") ? "email" : "username";
      return res.status(409).json({ message: `O ${field} já está em uso.` });
    }
    // Outros erros retornam erro interno do servidor
    console.error("Erro no registro:", error);
    res
      .status(500)
      .json({ message: "Erro interno do servidor ao tentar registrar." });
  }
};

// Função para autenticar usuário e gerar token JWT
export const login = async (req, res) => {
  // Extrai email e senha do corpo da requisição
  const { email, password } = req.body;

  // Verifica se email e senha foram enviados
  if (!email || !password) {
    return res.status(400).json({ message: "Email e senha são obrigatórios." });
  }

  try {
    // Busca o usuário pelo email no banco
    const user = await UserModel.findByEmail(email);

    // Se não encontrar o usuário, retorna erro de credenciais inválidas
    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    // Compara a senha enviada com o hash armazenado
    const isMatch = await bcrypt.compare(password, user.password);

    // Se as senhas não batem, retorna erro de credenciais inválidas
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    // Prepara os dados que vão no payload do token JWT
    const payload = { id: user.id, role: user.role };

    // Gera o token JWT com a chave secreta e tempo de expiração definidos na config
    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    // Remove a senha do objeto usuário antes de enviar na resposta
    delete user.password;

    // Retorna sucesso com o token e os dados do usuário (sem senha)
    res.json({
      message: "Login bem-sucedido!",
      token,
      user,
    });
  } catch (error) {
    // Em caso de erro interno, loga e retorna erro 500
    console.error("Erro no login:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};
