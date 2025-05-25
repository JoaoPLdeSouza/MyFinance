// src/services/authService.js
import axios from "axios";

const API_URL = "http://localhost:9087"; // Certifique-se de que esta URL está correta para seu backend

const login = async ({ email, senha }) => {
  return axios.post(`${API_URL}/login`, { email, senha }, {
    headers: { "Content-Type": "application/json" },
    timeout: 5000 // 5 segundos
  });
};

const register = (usuario) => {
  return axios.post(`${API_URL}/usuario/cadastrar`, usuario);
};

const getUserById = async (id) => {
  return axios.get(`${API_URL}/usuario/buscar/${id}`);
};

const alterarSenha = async (id, request) => {
  // As per your Swagger, PUT /usuario/alterar/senha expects 'id' as query param and body
  return await axios.put(`${API_URL}/usuario/alterar/senha?id=${id}`, request);
};

const delet = (id) => {
  // This seems to be for deleting a user_gasto by ID, not a user.
  // Verify the exact endpoint and parameters for this function in your backend.
  return axios.delete(`${API_URL}/usuario_gasto/delete?id=${id}`);
};

// This function is for PUT /usuario/alterar, which updates name and renda.
// It expects 'id' as a query parameter and 'dados' (object with name and renda) as the request body.
const alterarDadosUsuario = (id, dados) => {
  return axios.put(`${API_URL}/usuario/alterar?id=${id}`, dados);
};

const alterarEmail = (id, email, senha) => {
  // As per your Swagger, PUT /usuario/alterar/email expects 'id' as query param and body { email, senha }
  return axios.put(`${API_URL}/usuario/alterar/email?id=${id}`, { email, senha });
};

const buscarLancamentosPorUsuario = (idUsuario) => {
  return axios.get(`${API_URL}/gasto/buscar/categoria`, {
    params: { idUsuario }
  });
};

const alterarGasto = (id, gasto) => {
  // As per your Swagger, PUT /gasto/alterar expects 'id' as query param and 'gasto' as request body.
  return axios.put(`${API_URL}/gasto/alterar`, gasto, {
    params: { id }
  });
};

const cadastrarGasto = (idUsuario, dados) => {
  // As per your Swagger, POST /gasto/cadastrar expects 'idUsuario' as query param and 'dados' as request body.
  return axios.post(`${API_URL}/gasto/cadastrar`, dados, {
    params: { idUsuario }
  });
};

const deletarGasto = (id) => {
  // As per your Swagger, DELETE /gasto/deletar expects 'id' as query param.
  return axios.delete(`${API_URL}/gasto/deletar`, {
    params: { id }
  });
};

const gerarPlano = (idUsuario) => {
  // Conforme o screenshot do Swagger, o endpoint é POST /plano
  // e o idUsuario é passado como um parâmetro de query (?idUsuario=1)
  return axios.post(`${API_URL}/plano`, null, { // null para o corpo, já que o idUsuario vai no params
    params: { idUsuario }
  });
};

const buscarPlanosPorUsuario = (idUsuario) => {
  return axios.get(`${API_URL}/plano/usuario`, {
    params: { idUsuario }
  });
};

// Export all the functions
const authService = {
  login,
  register,
  getUserById,
  alterarSenha,
  delet,
  alterarDadosUsuario, // This is the key function for updating user name and income
  alterarEmail,
  buscarLancamentosPorUsuario,
  alterarGasto,
  cadastrarGasto,
  deletarGasto,
  gerarPlano,
  buscarPlanosPorUsuario
};

export default authService;