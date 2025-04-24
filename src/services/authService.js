import axios from "axios";

const API_URL = "http://localhost:9087";

// Faz login com email e senha
const login = async ({ email, senha }) => {
  return axios.post(`${API_URL}/login`, { email, senha }, {
    headers: { "Content-Type": "application/json" }
  });
};

// Registra novo usuário com nome, email e senha
const register = async ({ nome, email, senha }) => {
  return axios.post(`${API_URL}/usuario`, { nome, email, senha }, {
    headers: { "Content-Type": "application/json" }
  });
};

// Busca usuário por ID
const getUserById = async (id) => {
  return axios.get(`${API_URL}/usuario/buscar/${id}`);
};

// Exporta as funções como um objeto nomeado
const authService = {
  login,
  register,
  getUserById
};

export default authService;
