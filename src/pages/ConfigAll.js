import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import authService from "../services/authService";
import "../assets/ConfigAll.css";

// Import de PoPUps
import EditEmailPopup from "../components/EditEmailPopup";
import EditRendaPopup from "../components/EditRendaPopup";
import EditSenhaPopup from "../components/EditSenhaPopup";

const ConfigAll = () => {
  const [usuario, setUsuario] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [tipoEdicao, setTipoEdicao] = useState("");

  useEffect(() => {
    // Pegar informações do usuário
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

    fetchUserData();

  }, []); 

  const abrirModal = (tipo) => {
    setTipoEdicao(tipo);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setTipoEdicao("");
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

          {/* Campo Nome (Primeira informação) */}
          <div className="info-item">
            <span className="info-label">Nome:</span>
            <span className="info-value">
              {usuario.nome || "Não informado"}
            </span>
          </div>

          {/* Campo de E-mail */}
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

          {/* Campo de Senha */}
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

          {/* Campo de Rendimento */}
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

        {/* Renderiza o PoPUp baseada no tipoEdicao */}
        {modalAberto && (
          <div className="modal-overlay"> {/* Overlay para o popup */}
            {tipoEdicao === "email" && (
              <EditEmailPopup usuario={usuario} onClose={fecharModal} />
            )}
            {tipoEdicao === "rendimento" && (
              <EditRendaPopup usuario={usuario} onClose={fecharModal} />
            )}
            {tipoEdicao === "senha" && (
              <EditSenhaPopup usuario={usuario} onClose={fecharModal} />
            )}
            {/* Espaço para adicionar mais caso precise */}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ConfigAll;