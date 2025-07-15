import express from "express";
import cors from "cors"; // Permite requisições de outros domínios (como o front-end)
import helmet from "helmet"; // Adiciona segurança aos cabeçalhos HTTP
import mainRouter from "./routes/index.js"; // Roteador principal que agrupa todas as rotas
import config from "./config/index.js"; // Configurações de ambiente (development, production)

//INICIALIZAÇÃO DO EXPRESS
const app = express();

app.use(helmet()); // Adiciona proteção contra vulnerabilidades conhecidas
app.use(cors()); // Permite chamadas do front-end à API
app.use(express.json()); // Interpreta o corpo das requisições em formato JSON

// Rota raiz para teste rápido de disponibilidade
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "API está no ar" });
});

// Prefixa as rotas principais da API com "/api"
app.use("/api", mainRouter);

// Middleware para tratar rotas inexistentes (404)
app.use((req, res, next) => {
  const error = new Error("Rota não encontrada.");
  error.status = 404;
  next(error); // Encaminha para o middleware global de erro
});

// Middleware global para tratamento de erros
app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    error: {
      message: error.message || "Ocorreu um erro interno no servidor.",
      stack: config.nodeEnv === "development" ? error.stack : undefined,
    },
  });
});

// Exporta o app para ser usado no arquivo principal
export default app;
