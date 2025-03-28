import React from "react";
import { Link } from "react-router-dom";
import "../assets/Sidebar.css";

const Sidebar = () => {
  return (
    <nav className="sidebar">
      <ul>
        <li><Link to="/home">Relatórios</Link></li>
        <li><Link to="/lancamentos">Lançamentos</Link></li>
        <li><Link to="/metas">Metas</Link></li>
        <li><Link to="/ia">IA</Link></li>
      </ul>
    </nav>
  );
};

export default Sidebar;
