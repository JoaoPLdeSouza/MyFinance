import axios from "axios";

const API_URL = "http://localhost:9087"; 

const login = async ({ email, senha }) => {
  try {
    return await axios.post(`${API_URL}/login`, { email, senha }, {
      headers: { "Content-Type": "application/json" },
      timeout: 5000 
    });
  } catch (error) {
    console.error("Erro no login:", error);
    throw error; 
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
 * Se dataInicio ou dataFinal não forem fornecidas, elas serão enviadas como strings vazias.
 *
 * @param {number} idUsuario O ID do usuário.
 * @param {object} [filtrosData] Objeto opcional contendo as datas para filtro.
 * @param {string} [filtrosData.dataInicio] Data de início para o filtro (formato "DD/MM/YYYY" ou vazio).
 * @param {string} [filtrosData.dataFinal] Data final para o filtro (formato "DD/MM/YYYY" ou vazio).
 */
const buscarLancamentosPorUsuario = async (idUsuario, filtrosData = {}) => {
  try {
    const { dataInicio = "", dataFinal = "" } = filtrosData; // Define "" como padrão

    const requestBody = {
      dataInicio: dataInicio,
      dataFinal: dataFinal
    };
    
    const response = await axios.post(`${API_URL}/gasto/buscar/categoria`, requestBody, {
      params: { idUsuario }, 
      headers: { "Content-Type": "application/json" }
    });
    return response; // Retorna o objeto de resposta completo (incluindo .data)
  } catch (error) {
    console.error("Erro ao buscar lançamentos por usuário:", error.response?.data || error.message);
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
    let url = `${API_URL}/plano?idUsuario=${idUsuario}`;
    if (valorPraPoupar !== null && valorPraPoupar !== undefined && !isNaN(parseFloat(valorPraPoupar))) {
      url += `&valorPraPoupar=${encodeURIComponent(parseFloat(valorPraPoupar))}`;
    }
    const response = await axios.post(url, null); 
    return response;
  } catch (error) {
    console.error("Erro ao gerar plano:", error);
    throw error; 
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
  buscarLancamentosPorUsuario, 
  alterarGasto,
  cadastrarGasto,
  deletarGasto,
  gerarPlano,
  buscarPlanosPorUsuario
};

export default authService;