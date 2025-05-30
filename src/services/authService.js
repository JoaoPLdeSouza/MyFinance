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
  return await axios.put(`${API_URL}/usuario/alterar/senha?id=${id}`, request);
};

const delet = (id) => {
  return axios.delete(`${API_URL}/usuario_gasto/delete?id=${id}`);
};

const alterarDadosUsuario = (id, dados) => {
  return axios.put(`${API_URL}/usuario/alterar?id=${id}`, dados);
};

const alterarEmail = (id, email, senha) => {
  return axios.put(`${API_URL}/usuario/alterar/email?id=${id}`, { email, senha });
};

const buscarLancamentosPorUsuario = (idUsuario) => {
  return axios.get(`${API_URL}/gasto/buscar/categoria`, {
    params: { idUsuario }
  });
};

const alterarGasto = (id, gasto) => {
  return axios.put(`${API_URL}/gasto/alterar`, gasto, {
    params: { id }
  });
};

const cadastrarGasto = (idUsuario, dados) => {
  return axios.post(`${API_URL}/gasto/cadastrar`, dados, {
    params: { idUsuario }
  });
};

const deletarGasto = (id) => {
  return axios.delete(`${API_URL}/gasto/deletar`, {
    params: { id }
  });
};

const gerarPlano = (idUsuario) => {
  return axios.post(`${API_URL}/plano`, null, {
    params: { idUsuario }
  });
};

const buscarPlanosPorUsuario = (idUsuario) => {
  return axios.get(`${API_URL}/plano/usuario`, {
    params: { idUsuario }
  });
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