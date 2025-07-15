import { db } from "../config/db.js";

// Prepara os dados do estudante para inserção, convertendo strings vazias em null
const sanitizeStudentData = (data) => {
  const sanitizedData = { ...data };
  for (const key in sanitizedData) {
    if (sanitizedData[key] === "") {
      sanitizedData[key] = null;
    }
  }
  return sanitizedData;
};

// Cria um novo estudante e o matricula nas turmas especificadas
export const create = async (studentData, classIds = []) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const data = sanitizeStudentData(studentData);

    const studentQuery = `
      INSERT INTO students (
        name, birth_date, age, institution, grade, nationality, hometown, state,
        marital_status, profession, sex, responsible_name, responsible_contact,
        additional_responsible_name, additional_responsible_contact, cpf, rg, uf, address,
        has_health_plan, health_plan_name, uses_medication, medication_name,
        has_allergy, allergy_type, has_special_needs, special_needs_type,
        blood_type, image_authorization
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29
      ) RETURNING *;
    `;
    const studentValues = [
      data.name,
      data.birth_date,
      data.age,
      data.institution,
      data.grade,
      data.nationality,
      data.hometown,
      data.state || data.uf,
      data.marital_status,
      data.profession,
      data.sex,
      data.responsible_name,
      data.responsible_contact,
      data.additional_responsible_name,
      data.additional_responsible_contact,
      data.cpf,
      data.rg,
      data.uf,
      data.address,
      data.has_health_plan,
      data.health_plan_name,
      data.uses_medication,
      data.medication_name,
      data.has_allergy,
      data.allergy_type,
      data.has_special_needs,
      data.special_needs_type,
      data.blood_type,
      data.image_authorization,
    ];
    const studentResult = await client.query(studentQuery, studentValues);
    const newStudent = studentResult.rows[0];

    // Se houver turmas para matricular, insere na tabela de relacionamento
    if (classIds && classIds.length > 0) {
      const enrollmentQuery =
        "INSERT INTO student_classes (student_id, classes_id) VALUES ($1, $2)";
      for (const classId of classIds) {
        await client.query(enrollmentQuery, [newStudent.id, classId]);
      }
    }

    await client.query("COMMIT");
    return newStudent;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Atualiza os dados de um estudante e suas matrículas
export const update = async (id, studentData, classIds) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const data = sanitizeStudentData(studentData);

    const studentQuery = `
      UPDATE students SET
        name = $1, birth_date = $2, age = $3, institution = $4, grade = $5,
        nationality = $6, hometown = $7, state = $8, marital_status = $9,
        profession = $10, sex = $11, responsible_name = $12, responsible_contact = $13,
        additional_responsible_name = $14, additional_responsible_contact = $15,
        cpf = $16, rg = $17, uf = $18, address = $19, has_health_plan = $20,
        health_plan_name = $21, uses_medication = $22, medication_name = $23,
        has_allergy = $24, allergy_type = $25, has_special_needs = $26,
        special_needs_type = $27, blood_type = $28, image_authorization = $29
      WHERE id = $30
      RETURNING *;
    `;
    const studentValues = [
      data.name,
      data.birth_date,
      data.age,
      data.institution,
      data.grade,
      data.nationality,
      data.hometown,
      data.state || data.uf,
      data.marital_status,
      data.profession,
      data.sex,
      data.responsible_name,
      data.responsible_contact,
      data.additional_responsible_name,
      data.additional_responsible_contact,
      data.cpf,
      data.rg,
      data.uf,
      data.address,
      data.has_health_plan,
      data.health_plan_name,
      data.uses_medication,
      data.medication_name,
      data.has_allergy,
      data.allergy_type,
      data.has_special_needs,
      data.special_needs_type,
      data.blood_type,
      data.image_authorization,
      id,
    ];
    const studentResult = await client.query(studentQuery, studentValues);

    // Se estudante não existe, desfaz a transação e retorna null
    if (studentResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    // Atualiza as matrículas: apaga as antigas e insere as novas
    await client.query("DELETE FROM student_classes WHERE student_id = $1", [
      id,
    ]);
    if (classIds && classIds.length > 0) {
      const enrollmentQuery =
        "INSERT INTO student_classes (student_id, classes_id) VALUES ($1, $2)";
      for (const classId of classIds) {
        await client.query(enrollmentQuery, [id, classId]);
      }
    }

    await client.query("COMMIT");
    return studentResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Busca estudantes com base na role do usuário
export const findAll = async (user) => {
  if (!user || !["admin", "professor"].includes(user.role)) {
    return [];
  }

  let query;
  if (user.role === "admin") {
    query = `
      SELECT s.*, 
             COALESCE(
               json_agg(
                 json_build_object('id', c.id, 'name', c.name)
               ) FILTER (WHERE c.id IS NOT NULL), '[]'
             ) as classes
      FROM students s
      LEFT JOIN student_classes sc ON s.id = sc.student_id
      LEFT JOIN classes c ON sc.classes_id = c.id
      GROUP BY s.id
      ORDER BY s.name ASC;
    `;
    const result = await db.query(query);
    return result.rows;
  }

  if (user.role === "professor") {
    // Busca estudantes que pertencem a pelo menos uma turma do professor
    query = {
      text: `
        SELECT s.*,
               COALESCE(json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name)) FILTER (WHERE c.id IS NOT NULL), '[]') as classes
        FROM students s
        LEFT JOIN student_classes sc ON s.id = sc.student_id
        LEFT JOIN classes c ON sc.classes_id = c.id
        WHERE s.id IN (
            SELECT DISTINCT sc_inner.student_id
            FROM student_classes sc_inner
            JOIN classes c_inner ON sc_inner.classes_id = c_inner.id
            WHERE c_inner.professor_id = $1
        )
        GROUP BY s.id
        ORDER BY s.name ASC;
      `,
      values: [user.id],
    };
    const result = await db.query(query);
    return result.rows;
  }
};

// Busca um estudante pelo ID, incluindo suas turmas
export const findById = async (id) => {
  const query = `
    SELECT s.*, 
           COALESCE(
             json_agg(
               json_build_object('id', c.id, 'name', c.name)
             ) FILTER (WHERE c.id IS NOT NULL), '[]'
           ) as classes
    FROM students s
    LEFT JOIN student_classes sc ON s.id = sc.student_id
    LEFT JOIN classes c ON sc.classes_id = c.id
    WHERE s.id = $1
    GROUP BY s.id;
  `;
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
};

// Deleta um estudante do banco de dados
export const remove = async (id) => {
  const result = await db.query(
    "DELETE FROM students WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0] || null;
};
