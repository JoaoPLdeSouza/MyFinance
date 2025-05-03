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

  // Atualizar usuário com id passado como query string
  const updateUser = (usuario) => {
    return axios.put(`${API_URL}/usuario/alterar`, usuario);
  };

  const delet = (id) => {
    return axios.delete(`${API_URL}/usuario/delete?id=${id}`);
  };

  const alterarRendimento = (id, rendimento) => {
    return axios.put(`${API_URL}/usuario/alterar/rendimento`, null, {
      params: { id, rendimento },
    });
  };
  
  const alterarEmail = (id, email) => {
    return axios.put(`${API_URL}/usuario/alterar/email`, null, {
      params: { id, email },
    });
  };

  const authService = {
    login,
    register,
    getUserById,
    updateUser,
    delet,
    alterarRendimento,
    alterarEmail
  };

  export default authService;
