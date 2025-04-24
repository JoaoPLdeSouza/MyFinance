// src/services/authService.js
import axios from "axios";

const API_URL = "http://localhost:9087";

const login = async ({ email, senha }) => {
  return axios.post(`${API_URL}/login`, { email, senha }, {
    headers: { "Content-Type": "application/json" }
  });
};

const register = async ({ nome, email, senha }) => {
  return axios.post(`${API_URL}/usuario`, { nome, email, senha }, {
    headers: { "Content-Type": "application/json" }
  });
};

const authService = {
  login,
  register
};

export default authService;
