import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/Header.css";
import { FaBars, FaCog } from "react-icons/fa";
import authService from "../services/authService";

const Header = ({ toggleSidebar }) => {
  const [nomeUsuario, setNomeUsuario] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const dadosSalvos = JSON.parse(localStorage.getItem("usuario"));
    if (dadosSalvos && dadosSalvos.id) {
      authService.getUserById(dadosSalvos.id)
        .then(res => setNomeUsuario(res.data.nome))
        .catch(err => console.error("Erro ao buscar nome do usuário:", err));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  const handleConfig = () => {
    navigate("/config");
  };

  return (
    <header className="header">
      <button className="menu-button" onClick={toggleSidebar}>
        <FaBars size={20} />
      </button>
      <div className="header-info">
        <span className="user-name">Olá, {nomeUsuario || "Usuário"}</span>
        <button className="config-button" onClick={handleConfig}>
          <FaCog size={18} />
        </button>
        <button className="logout-button" onClick={handleLogout}>Sair</button>
      </div>
    </header>
  );
};

export default Header;
