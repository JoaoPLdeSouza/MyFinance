import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/Header.css";
import { FaBars, FaCog } from "react-icons/fa";
import authService from "../services/authService";
import ExclPop from "./ExclPop";

const Header = ({ toggleSidebar }) => {
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
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
      setShowConfirmModal(false); // Fecha o modal de confirmação
      setShowSuccessPopup(true); // Mostra o pop-up de sucesso

      // Redireciona após 3 segundos
      setTimeout(() => {
        navigate("/login");
      }, 3000); // 3 segundos
      
    } catch (err) {
      alert("Erro ao deletar conta."); // Mantido o alert de erro.
      console.error(err);
      setShowConfirmModal(false); // Fecha o modal de confirmação mesmo com erro
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
              <button onClick={() => goTo("/config")}>Meu perfil</button>
              <button onClick={() => setShowConfirmModal(true)} className="deletar-opcao">Deletar Conta</button>
            </div>
          )}
        </div>

        <button className="logout-button" onClick={handleLogout}>Sair</button>
      </div>

      {/* Pop-up de Confirmação de Deleção */}
      {showConfirmModal && (
        <ExclPop
          message="Tem certeza que deseja excluir sua conta? Esta ação é irreversível."
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}

      {/* Pop-up de Sucesso após a Deleção (sem botões e com temporizador) */}
      {showSuccessPopup && (
        <ExclPop
          message="Conta deletada com sucesso!"
        />
      )}
    </header>
  );
};

export default Header;