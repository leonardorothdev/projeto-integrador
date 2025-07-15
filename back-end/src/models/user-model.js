import { db } from "../config/db.js";

// Cria um novo usuário e, se for professor, vincula às turmas especificadas
// Usa transação para garantir atomicidade
export const create = async (userData, classIds = []) => {
  const { name, username, email, password, role, phone } = userData;
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const insertUserQuery = `
      INSERT INTO users(name, username, email, password, role, phone)
      VALUES($1, $2, $3, $4, $5, $6)
      RETURNING id, name, username, email, role, phone;
    `;
    const userValues = [
      name,
      username,
      email,
      password,
      role || "professor",
      phone,
    ];
    const userResult = await client.query(insertUserQuery, userValues);
    const newUser = userResult.rows[0];

    if (newUser.role === "professor" && classIds && classIds.length > 0) {
      const updateClassesQuery =
        "UPDATE classes SET professor_id = $1 WHERE id = ANY($2::int[])";
      await client.query(updateClassesQuery, [newUser.id, classIds]);
    }

    await client.query("COMMIT");
    return newUser;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Atualiza dados do usuário e, se professor, suas turmas vinculadas
export const update = async (id, userData, classIds) => {
  const { name, email, role, phone, password } = userData;
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Monta a query dinamicamente, incluindo senha apenas se fornecida
    const fields = ["name = $1", "email = $2", "role = $3", "phone = $4"];
    const values = [name, email, role, phone];

    if (password) {
      fields.push(`password = $${values.length + 1}`);
      values.push(password);
    }

    values.push(id); // Para o WHERE

    const updateUserQuery = `
      UPDATE users 
      SET ${fields.join(", ")} 
      WHERE id = $${values.length} 
      RETURNING id, name, username, email, role, phone`;

    const userResult = await client.query(updateUserQuery, values);

    if (userResult.rows.length === 0) {
      throw new Error("Usuário não encontrado para atualização.");
    }

    if (role === "professor") {
      // Remove vinculação antiga das turmas
      await client.query(
        "UPDATE classes SET professor_id = NULL WHERE professor_id = $1",
        [id]
      );
      // Vincula as novas turmas
      if (classIds && classIds.length > 0) {
        const updateClassesQuery =
          "UPDATE classes SET professor_id = $1 WHERE id = ANY($2::int[])";
        await client.query(updateClassesQuery, [id, classIds]);
      }
    }

    await client.query("COMMIT");
    return userResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Busca todos os usuários (sem senha)
export const findAll = async () => {
  const query =
    "SELECT id, name, username, email, role, phone FROM users ORDER BY name ASC";
  const result = await db.query(query);
  return result.rows;
};

// Busca usuário pelo email (inclui senha)
export const findByEmail = async (email) => {
  const result = await db.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows[0] || null;
};

// Busca usuário pelo ID (sem senha)
export const findById = async (id) => {
  const query =
    "SELECT id, name, username, email, role, phone FROM users WHERE id = $1";
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
};

// Remove usuário pelo ID, retorna true se removido
export const remove = async (id) => {
  const result = await db.query("DELETE FROM users WHERE id = $1", [id]);
  return result.rowCount > 0;
};
