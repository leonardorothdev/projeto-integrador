import * as StudentModel from "../../models/student-model.js";

// Função para extrair os dados do estudante do corpo da requisição
// Remove o campo classIds para não ser incluído nos dados principais
const getStudentDataFromRequest = (body) => {
  const { classIds, ...studentData } = body;
  return studentData;
};

// Cria um novo estudante e matricula em turmas
export const createStudent = async (req, res) => {
  try {
    // Extrai os dados do estudante e as turmas do corpo da requisição
    const studentData = getStudentDataFromRequest(req.body);
    const { classIds } = req.body;

    // Verifica se os campos obrigatórios foram preenchidos
    if (!studentData.name || !studentData.cpf || !studentData.rg) {
      return res
        .status(400)
        .json({ message: "Nome, CPF e RG são obrigatórios." });
    }

    // Cria o estudante no banco de dados via model
    const newStudent = await StudentModel.create(studentData, classIds);

    // Retorna sucesso com os dados do novo estudante criado
    res.status(201).json({
      message: "Estudante criado e matriculado com sucesso.",
      student: newStudent,
    });
  } catch (error) {
    // Se o erro for conflito de CPF ou RG duplicados, retorna 409
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ message: `Erro: CPF ou RG já cadastrado.` });
    }
    // Outros erros retornam erro 500 interno
    console.error("Erro ao criar estudante:", error);
    res.status(500).json({ message: "Erro interno ao criar estudante." });
  }
};

// Retorna todos os estudantes visíveis para o usuário autenticado
export const getAllStudents = async (req, res) => {
  try {
    // Pega o usuário logado da requisição (definido no middleware)
    const user = req.user;

    // Busca todos os estudantes filtrados pelo model
    const allStudents = await StudentModel.findAll(user);

    // Retorna a lista de estudantes encontrada
    res.status(200).json(allStudents);
  } catch (error) {
    console.error("Erro ao buscar estudantes:", error);
    res.status(500).json({ message: "Erro interno ao buscar estudantes." });
  }
};

// Retorna um estudante específico pelo ID na URL
export const getStudentById = async (req, res) => {
  try {
    // Converte o parâmetro ID para número inteiro
    const studentId = parseInt(req.params.id, 10);

    // Verifica se o ID é válido
    if (isNaN(studentId)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    // Busca o estudante pelo ID no model
    const foundStudent = await StudentModel.findById(studentId);

    // Se não encontrar, retorna erro 404
    if (!foundStudent) {
      return res.status(404).json({ message: "Estudante não encontrado." });
    }

    // Retorna os dados do estudante encontrado
    res.status(200).json(foundStudent);
  } catch (error) {
    console.error("Erro ao buscar estudante:", error);
    res.status(500).json({ message: "Erro interno ao buscar estudante." });
  }
};

// Atualiza um estudante existente pelo ID
export const updateStudent = async (req, res) => {
  try {
    // Converte o parâmetro ID para número inteiro
    const studentId = parseInt(req.params.id, 10);

    // Verifica se o ID é válido
    if (isNaN(studentId)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    // Extrai os dados do estudante e as turmas do corpo da requisição
    const studentData = getStudentDataFromRequest(req.body);
    const { classIds } = req.body;

    // Atualiza o estudante no banco via model
    const updatedStudent = await StudentModel.update(
      studentId,
      studentData,
      classIds
    );

    // Se estudante não encontrado para atualizar, retorna erro 404
    if (!updatedStudent) {
      return res
        .status(404)
        .json({ message: "Estudante não encontrado para atualização." });
    }

    // Retorna sucesso com dados do estudante atualizado
    res.status(200).json({
      message: "Estudante atualizado com sucesso.",
      student: updatedStudent,
    });
  } catch (error) {
    // Se erro for conflito de CPF ou RG duplicados, retorna 409
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ message: `Erro: CPF ou RG já cadastrado.` });
    }
    console.error("Erro ao atualizar estudante:", error);
    res.status(500).json({ message: "Erro interno ao atualizar estudante." });
  }
};

// Deleta um estudante pelo ID
export const deleteStudent = async (req, res) => {
  try {
    // Converte o parâmetro ID para número inteiro
    const studentId = parseInt(req.params.id, 10);

    // Verifica se o ID é válido
    if (isNaN(studentId)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    // Remove o estudante do banco via model
    const deletedStudent = await StudentModel.remove(studentId);

    // Se estudante não encontrado para exclusão, retorna erro 404
    if (!deletedStudent) {
      return res
        .status(404)
        .json({ message: "Estudante não encontrado para exclusão." });
    }

    // Retorna sucesso confirmando exclusão
    res.status(200).json({ message: "Estudante excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir estudante:", error);
    res.status(500).json({ message: "Erro interno ao excluir estudante." });
  }
};
