// Importa o pacote dotenv para carregar variáveis de ambiente do arquivo .env
import dotenv from "dotenv";

// Inicializa o dotenv para carregar as variáveis de ambiente
dotenv.config();

// Objeto de configuração centralizado para a aplicação
const config = {
  // Porta onde o servidor vai rodar, usa variável de ambiente ou padrão 3000
  port: process.env.PORT || 3000,

  // Configurações do banco de dados agrupadas
  db: {
    host: process.env.DB_HOST, // Endereço do servidor do banco
    port: process.env.DB_PORT, // Porta do banco de dados
    user: process.env.DB_USER, // Usuário do banco
    password: process.env.DB_PASSWORD, // Senha do banco
    database: process.env.DB_NAME, // Nome do banco de dados
  },

  // Configurações relacionadas ao JWT (token de autenticação)
  jwt: {
    secret: process.env.JWT_SECRET, // Chave secreta usada para assinar o token
    expiresIn: process.env.JWT_EXPIRATION || "1h", // Tempo de expiração do token, padrão 1 hora
  },
};

// Exporta o objeto de configuração para ser usado no projeto
export default config;
