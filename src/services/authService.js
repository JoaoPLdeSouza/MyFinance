import axios from "axios";

// Certifique-se de que esta URL está correta para seu backend
// É uma boa prática ter isso em uma variável de ambiente ou um arquivo de configuração separado
const API_URL = "http://localhost:9087"; 

const login = async ({ email, senha }) => {
  try {
    return await axios.post(`${API_URL}/login`, { email, senha }, {
      headers: { "Content-Type": "application/json" },
      timeout: 5000 // 5 segundos
    });
  } catch (error) {
    console.error("Erro no login:", error);
    throw error; // Propagar o erro para o componente que chamou
  }
};

const register = async (usuario) => {
  try {
    return await axios.post(`${API_URL}/usuario/cadastrar`, usuario);
  } catch (error) {
    console.error("Erro no registro:", error);
    throw error;
  }
};

const getUserById = async (id) => {
  try {
    return await axios.get(`${API_URL}/usuario/buscar/${id}`);
  } catch (error) {
    console.error("Erro ao buscar usuário por ID:", error);
    throw error;
  }
};

const alterarSenha = async (id, request) => {
  try {
    return await axios.put(`${API_URL}/usuario/alterar/senha?id=${id}`, request);
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    throw error;
  }
};

const delet = async (id) => {
  try {
    // Note: Esta função parece ser para `usuario_gasto/delete`, verificar se é o endpoint correto
    return await axios.delete(`${API_URL}/usuario_gasto/delete?id=${id}`);
  } catch (error) {
    console.error("Erro ao deletar usuário_gasto:", error);
    throw error;
  }
};

const alterarDadosUsuario = async (id, dados) => {
  try {
    return await axios.put(`${API_URL}/usuario/alterar?id=${id}`, dados);
  } catch (error) {
    console.error("Erro ao alterar dados do usuário:", error);
    throw error;
  }
};

const alterarEmail = async (id, email, senha) => {
  try {
    return await axios.put(`${API_URL}/usuario/alterar/email?id=${id}`, { email, senha });
  } catch (error) {
    console.error("Erro ao alterar email:", error);
    throw error;
  }
};

/**
 * Busca lançamentos por usuário, com filtro opcional por datas.
 *
 * @param {number} idUsuario O ID do usuário.
 * @param {object} [filtrosData] Objeto opcional contendo as datas para filtro.
 * @param {string} [filtrosData.dataInicio] Data de início para o filtro (formato "DD/MM/YYYY").
 * @param {string} [filtrosData.dataFinal] Data final para o filtro (formato "DD/MM/YYYY").
 */
const buscarLancamentosPorUsuario = async (idUsuario, filtrosData = {}) => {
  try {
    const { dataInicio, dataFinal } = filtrosData;

    const requestBody = {};
    if (dataInicio && dataFinal) {
      requestBody.dataInicio = dataInicio;
      requestBody.dataFinal = dataFinal;
    }

    return await axios.post(`${API_URL}/gasto/buscar/categoria`, requestBody, {
      params: { idUsuario },
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Erro ao buscar lançamentos por usuário:", error);
    throw error;
  }
};

const alterarGasto = async (id, gasto) => {
  try {
    return await axios.put(`${API_URL}/gasto/alterar`, gasto, {
      params: { id }
    });
  } catch (error) {
    console.error("Erro ao alterar gasto:", error);
    throw error;
  }
};

const cadastrarGasto = async (idUsuario, dados) => {
  try {
    return await axios.post(`${API_URL}/gasto/cadastrar`, dados, {
      params: { idUsuario }
    });
  } catch (error) {
    console.error("Erro ao cadastrar gasto:", error);
    throw error;
  }
};

const deletarGasto = async (id) => {
  try {
    return await axios.delete(`${API_URL}/gasto/deletar`, {
      params: { id }
    });
  } catch (error) {
    console.error("Erro ao deletar gasto:", error);
    throw error;
  }
};

/**
 * Gera um novo plano financeiro para o usuário.
 * O valor para poupar é opcional e enviado como um parâmetro de query.
 * @param {number} idUsuario O ID do usuário.
 * @param {number} [valorPraPoupar] O valor opcional que o usuário deseja poupar por mês.
 */
const gerarPlano = async (idUsuario, valorPraPoupar = null) => {
  try {
    // Constrói a URL base com idUsuario como query parameter.
    let url = `${API_URL}/plano?idUsuario=${idUsuario}`;

    // Se valorPraPoupar for fornecido (não nulo/indefinido) e for um número válido,
    // adicione-o como um parâmetro de query adicional na URL.
    // parseFloat garante que o valor é um número, e encodeURIComponent o codifica para a URL.
    if (valorPraPoupar !== null && valorPraPoupar !== undefined && !isNaN(parseFloat(valorPraPoupar))) {
      url += `&valorPraPoupar=${encodeURIComponent(parseFloat(valorPraPoupar))}`;
    }

    // Realiza a requisição POST para a URL construída.
    // O segundo argumento de axios.post é o corpo da requisição (body),
    // que é null aqui, pois os parâmetros são enviados na URL (query string),
    // conforme o @RequestParam do seu backend.
    const response = await axios.post(url, null); 
    return response;
  } catch (error) {
    console.error("Erro ao gerar plano:", error);
    throw error; // Propagar o erro para o componente para tratamento de UI
  }
};

const buscarPlanosPorUsuario = async (idUsuario) => {
  try {
    return await axios.get(`${API_URL}/plano/usuario`, {
      params: { idUsuario }
    });
  } catch (error) {
    console.error("Erro ao buscar planos por usuário:", error);
    throw error;
  }
};

const authService = {
  login,
  register,
  getUserById,
  alterarSenha,
  delet,
  alterarDadosUsuario,
  alterarEmail,
  buscarLancamentosPorUsuario, // Função atualizada e simplificada
  alterarGasto,
  cadastrarGasto,
  deletarGasto,
  gerarPlano,
  buscarPlanosPorUsuario
};

export default authService;