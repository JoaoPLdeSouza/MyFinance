import axios from "axios"; // Importa axios para fazer requisições HTTP

// URL base da API do backend
const API_URL = "http://localhost:8080/api/auth";

// Função para autenticar o usuário
export const login = async (email, password) => {
  try {
    // Envia uma requisição POST para o endpoint de login da API
    const response = await axios.post(`${API_URL}/login`, { email, password });

    // Armazena o token recebido no localStorage para manter o usuário logado
    localStorage.setItem("token", response.data);
    
    return true; // Retorna sucesso
  } catch (error) {
    return false; // Retorna falha no login
  }
};

// Função para deslogar o usuário removendo o token
export const logout = () => {
  localStorage.removeItem("token");
};
