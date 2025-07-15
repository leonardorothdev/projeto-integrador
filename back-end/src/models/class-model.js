import { db } from "../config/db.js";

// Insere uma nova turma no banco de dados, incluindo o professor opcional.
export const create = async (classData) => {
  const { name, shift, time, number_of_vacancies, professor_id } = classData;

  // Insere uma nova turma na tabela 'classes' com os dados fornecidos.
  // Retorna o registro criado.
  const result = await db.query(
    "INSERT INTO classes (name, shift, time, number_of_vacancies, professor_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [name, shift, time, number_of_vacancies, professor_id || null]
  );
  return result.rows[0];
};

// Busca turmas no banco com base na role do usuário.
// Admins veem todas as turmas, professores veem apenas as suas.
export const findAll = async (user) => {
  // Se usuário não existir ou não tiver role válida, retorna lista vazia
  if (!user || !["admin", "professor"].includes(user.role)) {
    return [];
  }

  // Se for admin, retorna todas as turmas
  if (user.role === "admin") {
    const result = await db.query("SELECT * FROM classes ORDER BY name ASC");
    return result.rows;
  }

  // Se for professor, retorna só as turmas associadas ao seu ID
  if (user.role === "professor") {
    const result = await db.query(
      "SELECT * FROM classes WHERE professor_id = $1 ORDER BY name ASC",
      [user.id]
    );
    return result.rows;
  }
};

// Busca uma turma específica pelo seu ID.
export const findById = async (id) => {
  // Busca a turma no banco pelo ID
  const result = await db.query("SELECT * FROM classes WHERE id = $1", [id]);
  return result.rows[0] || null;
};

// Atualiza os dados de uma turma no banco.
export const update = async (id, classData) => {
  const { name, shift, time, number_of_vacancies, professor_id } = classData;

  // Atualiza os dados da turma pelo ID
  // Retorna a turma atualizada
  const result = await db.query(
    "UPDATE classes SET name = $1, shift = $2, time = $3, number_of_vacancies = $4, professor_id = $5 WHERE id = $6 RETURNING *",
    [name, shift, time, number_of_vacancies, professor_id || null, id]
  );
  return result.rows[0] || null;
};

// Deleta uma turma do banco pelo seu ID.
export const remove = async (id) => {
  // Remove a turma pelo ID e retorna o registro deletado
  const result = await db.query(
    "DELETE FROM classes WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0] || null;
};
