// src/services/authService.js
import axios from "axios";

const API_URL = "http://localhost:9087";

const login = async ({ email, senha }) => {
  return axios.post(`${API_URL}/login`, { email, senha }, {
    headers: { "Content-Type": "application/json" }
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

const alterarRendimento = (id, rendimento) => {
  return axios.put(`${API_URL}/usuario/alterar/rendimento`, null, {
    params: { id, rendimento },
  });
};

const alterarEmail = (id, email, senha) => {
  return axios.put(`${API_URL}/usuario/alterar/email?id=${id}`, { email, senha });
};

const buscarLancamentosPorUsuario = (idUsuario) => {
  return axios.get(`${API_URL}/gasto/usuario/all`, {
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


const authService = {
  login,
  register,
  getUserById,
  alterarSenha,
  delet,
  alterarRendimento,
  alterarEmail,
  buscarLancamentosPorUsuario,
  alterarGasto,
  cadastrarGasto
};

export default authService;
