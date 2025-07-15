import { createClassesTableQuery } from "../migrations/table-classes.js";
import { createStudentsTableQuery } from "../migrations/table-students.js";
import { createUsersTableQuery } from "../migrations/table-users.js";
import { createStudentsClassesTableQuery } from "../migrations/table-students-classes.js";
import { db } from "../config/db.js";

export const runMigrations = async (db) => {
  try {
    // Criar a tabela de usuários
    await db.query(createUsersTableQuery);
    console.log("Tabela de usuários criada com sucesso.");

    // Criar a tabela de classes
    await db.query(createClassesTableQuery);
    console.log("Tabela de classes criada com sucesso.");

    // Criar a tabela de estudantes
    await db.query(createStudentsTableQuery);
    console.log("Tabela de estudantes criada com sucesso.");

    // Criar a tabela de estudantes_classes
    await db.query(createStudentsClassesTableQuery);
    console.log("Tabela de estudantes_classes criada com sucesso.");
  } catch (error) {
    console.error("Error ao criar tabelas:", error);
  }
};

runMigrations(db)
  .then(() => {
    console.log("Todas as migrações foram executadas com sucesso.");
  })
  .catch((error) => {
    console.error("Erro ao executar migrações:", error);
  })
  .finally(() => {
    db.end();
  });
