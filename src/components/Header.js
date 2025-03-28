import React from "react";
import "../assets/Header.css";
import { FiLogOut, FiMenu } from "react-icons/fi";

const Header = ({ toggleSidebar, userName }) => {
  return (
    <header className="header">
      <button className="menu-btn" onClick={toggleSidebar}>
        <FiMenu />
      </button>
      <div className="user-info">
        <span className="user-name">{userName}</span>
        <button className="logout-btn">
          <FiLogOut /> Sair
        </button>
      </div>
    </header>
  );
};

export default Header;
