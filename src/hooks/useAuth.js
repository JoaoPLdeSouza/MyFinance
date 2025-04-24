import { useState, useEffect } from "react"; // Importa useState e useEffect

// Hook que verifica se o usuário está autenticado
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado para armazenar status de autenticação

  useEffect(() => {
    // Recupera o token do localStorage
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token); // Define como autenticado se houver token
  }, []);

  return isAuthenticated; // Retorna o status de autenticação
};

export default useAuth;
