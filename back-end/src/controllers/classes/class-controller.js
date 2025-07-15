import * as ClassModel from "../../models/class-model.js";

// Cria uma nova turma no sistema
export const createClass = async (req, res) => {
  try {
    // Extrai os dados da turma do corpo da requisição (professor_id pode ser nulo)
    const { name, shift, time, number_of_vacancies, professor_id } = req.body;

    // Verifica se os campos obrigatórios foram preenchidos
    if (!name || !shift || !time || !number_of_vacancies) {
      return res
        .status(400)
        .json({ message: "Preencha todos os campos obrigatórios." });
    }

    // Chama o model para criar a turma no banco de dados
    const newClass = await ClassModel.create({
      name,
      shift,
      time,
      number_of_vacancies,
      professor_id,
    });

    // Retorna sucesso com os dados da nova turma criada
    res.status(201).json({
      message: "Turma criada com sucesso.",
      class: newClass,
    });
  } catch (error) {
    // Em caso de erro, mostra no console e responde com erro 500
    console.error("Erro ao criar turma:", error);
    res.status(500).json({ message: "Erro interno ao criar turma." });
  }
};

// Busca e retorna todas as turmas que o usuário pode acessar
export const getAllClasses = async (req, res) => {
  try {
    // Pega os dados do usuário autenticado da requisição
    const user = req.user;

    // Busca todas as turmas permitidas para esse usuário no model
    const allClasses = await ClassModel.findAll(user);

    // Retorna sucesso com a lista de turmas encontradas
    res.status(200).json({
      message: "Turmas obtidas com sucesso.",
      classes: allClasses,
    });
  } catch (error) {
    // Em caso de erro, mostra no console e responde com erro 500
    console.error("Erro ao buscar turmas:", error);
    res.status(500).json({ message: "Erro interno ao buscar turmas." });
  }
};

// Busca e retorna uma turma específica pelo ID recebido na URL
export const getClassById = async (req, res) => {
  try {
    // Converte o parâmetro de ID para número inteiro
    const classId = parseInt(req.params.id, 10);

    // Valida se o ID é um número válido
    if (isNaN(classId)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    // Busca a turma pelo ID no model
    const foundClass = await ClassModel.findById(classId);

    // Se não encontrou, responde com erro 404
    if (!foundClass) {
      return res.status(404).json({ message: "Turma não encontrada." });
    }

    // Retorna sucesso com os dados da turma encontrada
    res.status(200).json({
      message: "Turma recuperada com sucesso.",
      class: foundClass,
    });
  } catch (error) {
    // Em caso de erro, mostra no console e responde com erro 500
    console.error("Erro ao buscar turma:", error);
    res.status(500).json({ message: "Erro interno ao buscar turma." });
  }
};

// Atualiza os dados de uma turma existente pelo ID
export const updateClass = async (req, res) => {
  try {
    // Converte o parâmetro de ID para número inteiro
    const classId = parseInt(req.params.id, 10);

    // Extrai os dados da turma do corpo da requisição (professor_id pode ser nulo)
    const { name, shift, time, number_of_vacancies, professor_id } = req.body;

    // Verifica se o ID é válido e os campos obrigatórios foram preenchidos
    if (isNaN(classId) || !name || !shift || !time || !number_of_vacancies) {
      return res
        .status(400)
        .json({ message: "ID inválido e todos os campos são obrigatórios." });
    }

    // Chama o model para atualizar a turma no banco de dados
    const updatedClass = await ClassModel.update(classId, {
      name,
      shift,
      time,
      number_of_vacancies,
      professor_id,
    });

    // Se não encontrou a turma para atualizar, responde com erro 404
    if (!updatedClass) {
      return res
        .status(404)
        .json({ message: "Turma não encontrada para atualização." });
    }

    // Retorna sucesso com os dados da turma atualizada
    res.status(200).json({
      message: "Turma atualizada com sucesso.",
      class: updatedClass,
    });
  } catch (error) {
    // Em caso de erro, mostra no console e responde com erro 500
    console.error("Erro ao atualizar turma:", error);
    res.status(500).json({ message: "Erro interno ao atualizar turma." });
  }
};

// Deleta uma turma pelo ID recebido na URL
export const deleteClass = async (req, res) => {
  try {
    // Converte o parâmetro de ID para número inteiro
    const classId = parseInt(req.params.id, 10);

    // Valida se o ID é válido
    if (isNaN(classId)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    // Chama o model para remover a turma do banco de dados
    const deletedClass = await ClassModel.remove(classId);

    // Se não encontrou a turma para deletar, responde com erro 404
    if (!deletedClass) {
      return res
        .status(404)
        .json({ message: "Turma não encontrada para exclusão." });
    }

    // Retorna sucesso confirmando a exclusão
    res.status(200).json({ message: "Turma excluída com sucesso." });
  } catch (error) {
    // Em caso de erro, mostra no console e responde com erro 500
    console.error("Erro ao excluir turma:", error);
    res.status(500).json({ message: "Erro interno ao excluir turma." });
  }
};
