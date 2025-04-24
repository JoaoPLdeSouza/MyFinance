import axios from "axios";

const API_URL = "http://localhost:9087";

const login = async ({ email, senha }) => {
  // Certifique-se que o corpo da requisição seja compatível com o LoginRequest.java
  return axios.post(`${API_URL}/login`, { email, senha }, {
    headers: { "Content-Type": "application/json" }
  });
};

const authService = {
  login,
};

export default authService;
