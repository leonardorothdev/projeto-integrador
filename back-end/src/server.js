import app from "./app.js"; // Importa a aplicação Express configurada
import config from "./config/index.js"; // Importa as configurações de ambiente (ex: porta, variáveis)
import { testDbConnection } from "./config/db.js"; // Função para testar a conexão com o banco de dados

const PORT = config.port;

// Função principal para iniciar o servidor
const startServer = async () => {
  try {
    // Testa a conexão com o banco antes de iniciar o servidor
    await testDbConnection();

    // Inicia o servidor e escuta na porta configurada
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta: ${PORT}`);
    });
  } catch (error) {
    console.error("Falha fatal ao iniciar o servidor.");
    console.error(error);
    process.exit(1); // Encerra a aplicação com erro
  }
};

startServer();
