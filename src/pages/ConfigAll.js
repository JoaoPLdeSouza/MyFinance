import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import authService from "../services/authService"; // Ensure authService is correctly imported
import "../assets/ConfigAll.css"; // Keep using the same CSS file for the main page layout

// Import the new specific popup components
import EditEmailPopup from "../components/EditEmailPopup";
import EditRendaPopup from "../components/EditRendaPopup";
import EditSenhaPopup from "../components/EditSenhaPopup";

const ConfigAll = () => {
  const [usuario, setUsuario] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [tipoEdicao, setTipoEdicao] = useState("");

  useEffect(() => {
    // Function to fetch user data
    const fetchUserData = () => {
      const usuarioStorage = JSON.parse(localStorage.getItem("usuario"));
      if (usuarioStorage?.id) {
        authService
          .getUserById(usuarioStorage.id)
          .then((res) => setUsuario(res.data))
          .catch((err) =>
            console.error("Erro ao buscar dados do usuário:", err)
          );
      }
    };

    fetchUserData(); // Initial fetch

    // We'll call fetchUserData again after a modal closes to get updated data
    // This is handled in fecharModal
  }, []); // Empty dependency array means this runs once on mount

  const abrirModal = (tipo) => {
    setTipoEdicao(tipo);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setTipoEdicao("");
    // Re-fetch user data to display the updated information on the main page
    const usuarioStorage = JSON.parse(localStorage.getItem("usuario"));
    if (usuarioStorage?.id) {
      authService
        .getUserById(usuarioStorage.id)
        .then((res) => setUsuario(res.data))
        .catch((err) =>
          console.error("Erro ao buscar dados do usuário:", err)
        );
    }
  };

  if (!usuario) {
    return (
      <Layout>
        <div className="profile-container">Carregando informações...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="profile-container">
        <div className="profile-card-simplified">
          <h1 className="profile-header-simplified">Meu Perfil</h1>

          {/* Nome Field (first information) */}
          <div className="info-item">
            <span className="info-label">Nome:</span>
            <span className="info-value">
              {usuario.nome || "Não informado"}
            </span>
            {/* No edit button for name, as per requirements */}
          </div>

          {/* E-mail Field */}
          <div className="info-item">
            <span className="info-label">E-mail:</span>
            <span className="info-value">{usuario.email}</span>
            <button
              className="edit-button-simplified"
              onClick={() => abrirModal("email")}
            >
              Editar
            </button>
          </div>

          {/* Senha Field */}
          <div className="info-item">
            <span className="info-label">Senha:</span>
            <span className="info-value">********</span>
            <button
              className="edit-button-simplified"
              onClick={() => abrirModal("senha")}
            >
              Alterar
            </button>
          </div>

          {/* Rendimento Field */}
          <div className="info-item">
            <span className="info-label">Rendimento:</span>
            <span className="info-value">
              {usuario.renda?.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              }) || "Não informado"}
            </span>
            <button
              className="edit-button-simplified"
              onClick={() => abrirModal("rendimento")}
            >
              Editar
            </button>
          </div>
        </div>

        {/* Conditional rendering of popups based on tipoEdicao */}
        {modalAberto && (
          <div className="modal-overlay"> {/* Overlay for the popup */}
            {tipoEdicao === "email" && (
              <EditEmailPopup usuario={usuario} onClose={fecharModal} />
            )}
            {tipoEdicao === "rendimento" && (
              <EditRendaPopup usuario={usuario} onClose={fecharModal} />
            )}
            {tipoEdicao === "senha" && (
              <EditSenhaPopup usuario={usuario} onClose={fecharModal} />
            )}
            {/* Add more conditions for other types if needed */}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ConfigAll;