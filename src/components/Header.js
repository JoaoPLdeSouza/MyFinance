import React from "react";
import "../assets/Header.css";
import { FaBars } from "react-icons/fa";

const Header = ({ toggleSidebar }) => {
  return (
    <header className="header">
      <button className="menu-button" onClick={toggleSidebar}>
        <FaBars size={20} />
      </button>
      <div className="header-info">
        <span className="user-name">Olá, Usuário</span>
        <button className="logout-button">Sair</button>
      </div>
    </header>
  );
};

export default Header;
