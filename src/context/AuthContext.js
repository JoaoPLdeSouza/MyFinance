import { createContext, useState, useEffect } from "react";

// Cria um contexto chamado AuthContext
export const AuthContext = createContext();

// Provedor de autenticação que envolve a aplicação para gerenciar login/logout
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado global de autenticação

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token); // Verifica se há token salvo e define a autenticação
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children} {/* Renderiza os componentes filhos dentro do contexto */}
    </AuthContext.Provider>
  );
};
