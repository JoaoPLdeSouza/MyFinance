import React from "react";
import { Link } from "react-router-dom";
import "../assets/Sidebar.css";
import { FaChartBar, FaExchangeAlt, FaRobot } from "react-icons/fa";

// Componente funcional Sidebar que recebe a prop isOpen (booleano para controle da expansão/recolhimento)
const Sidebar = ({ isOpen }) => {
  return (
    // A div terá a classe 'sidebar' e também 'open' ou 'closed' dependendo do estado isOpen
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <ul>
        {/* Link para a página Home (Relatórios) com ícone e texto */}
        <li>
          <Link to="/home">
            <FaChartBar className="sidebar-icon" />
            <span className="link-text">Relatórios</span>
          </Link>
        </li>

        {/* Link para a página Lançamentos com ícone e texto */}
        <li>
          <Link to="/lancamentos">
            <FaExchangeAlt className="sidebar-icon" />
            <span className="link-text">Lançamentos</span>
          </Link>
        </li>

        {/* Link para a página IA com ícone e texto */}
        <li>
          <Link to="/ia">
            <FaRobot className="sidebar-icon" />
            <span className="link-text">IA</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
