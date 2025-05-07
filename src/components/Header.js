import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/Header.css";
import { FaBars, FaCog } from "react-icons/fa";
import authService from "../services/authService";

const Header = ({ toggleSidebar }) => {
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const dadosSalvos = JSON.parse(localStorage.getItem("usuario"));
    if (dadosSalvos?.id) {
      authService.getUserById(dadosSalvos.id)
        .then(res => setNomeUsuario(res.data.nome))
        .catch(err => console.error("Erro ao buscar nome do usuário:", err));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      await authService.delet(usuario.id);
      localStorage.removeItem("usuario");
      alert("Conta deletada com sucesso.");
      navigate("/login");
    } catch (err) {
      alert("Erro ao deletar conta.");
      console.error(err);
    }
  };

  const goTo = (path) => {
    setShowMenu(false);
    navigate(path);
  };

  return (
    <header className="header">
      <button className="menu-button" onClick={toggleSidebar}>
        <FaBars size={20} />
      </button>

      <div className="header-info">
        <span className="user-name">Olá, {nomeUsuario || "Usuário"}</span>

        <div className="config-wrapper" ref={menuRef}>
          <button className="config-button" onClick={() => setShowMenu(!showMenu)}>
            <FaCog size={18} />
          </button>

          {showMenu && (
            <div className="config-menu">
              <button onClick={() => goTo("/config")}>Alterar Senha</button>
              <button onClick={() => goTo("/alterar-rendimento")}>Alterar Rendimento</button>
              <button onClick={() => goTo("/alterar-email")}>Alterar E-mail</button>
              <button onClick={() => setShowModal(true)} className="deletar-opcao">Deletar Conta</button>
            </div>
          )}
        </div>

        <button className="logout-button" onClick={handleLogout}>Sair</button>
      </div>

      {/* Modal de Confirmação */}
      {showModal && (
        <div className="modal-confirmacao">
          <div className="modal-conteudo">
            <p>Tem certeza que deseja excluir sua conta?</p>
            <button className="confirmar-btn" onClick={handleDeleteAccount}>Sim, excluir</button>
            <button className="cancelar-btn" onClick={() => setShowModal(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
