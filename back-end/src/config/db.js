// Importa a classe Pool do pacote 'pg' para gerenciar conexões com o PostgreSQL
import { Pool } from "pg";
// Importa as configurações do banco de dados do arquivo 'index.js'
import config from "./index.js";

// Cria uma nova pool de conexões usando os dados de configuração
const pool = new Pool({
  user: config.db.user, // Usuário do banco
  host: config.db.host, // Endereço do servidor do banco
  database: config.db.database, // Nome do banco de dados
  password: config.db.password, // Senha do usuário
  port: config.db.port, // Porta de conexão
});

// Função assíncrona para testar a conexão com o banco de dados
export const testDbConnection = async () => {
  try {
    // Executa uma query simples para verificar a conexão
    await pool.query("SELECT 1");
    console.log("Conexão com o banco de dados estabelecida com sucesso.");
  } catch (error) {
    // Caso haja erro, exibe mensagem e encerra o processo
    console.error("Não foi possível conectar ao banco de dados:", error);
    process.exit(1);
  }
};

// Exporta o objeto pool para ser usado em outras partes do projeto
export const db = pool;
