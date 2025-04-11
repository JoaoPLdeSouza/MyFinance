import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Importa React Router
import Login from "../pages/Login"; // Importa a página de Login

// Componente que define as rotas do app
const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} /> {/* Define a rota para a página de login */}
        <Route path="/" element={<Login />} /> {/* Define a rota para a página de login */}
      </Routes>
    </Router>
  );
};

export default AppRoutes;
