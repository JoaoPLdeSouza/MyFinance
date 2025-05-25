import React, { useState, useEffect } from "react";
import authService from "../services/authService";
import "../assets/Popup.css";

const EditRendaPopup = ({ usuario, onClose }) => {
  const [novaRenda, setNovaRenda] = useState(usuario.renda || 0);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    console.log("EditRendaPopup - Prop 'usuario' recebida:", usuario);
    if (usuario && !usuario.nome) {
      console.warn("EditRendaPopup - 'usuario.nome' está ausente:", usuario.nome);
    }
  }, [usuario]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const nomeDoUsuario = usuario?.nome ? String(usuario.nome).trim() : "";
    if (!nomeDoUsuario) {
      setMensagem("Erro: O nome do usuário está ausente. Não é possível atualizar o rendimento.");
      return;
    }

    const dadosParaAtualizar = {
      nome: nomeDoUsuario, // <- CORREÇÃO AQUI!
      renda: novaRenda,
    };

    authService.alterarDadosUsuario(usuario.id, dadosParaAtualizar)
      .then(() => {
        setMensagem("Rendimento atualizado com sucesso!");
        setTimeout(() => {
          setMensagem("");
          onClose();
        }, 1500);
      })
      .catch((error) => {
        console.error("Erro ao atualizar rendimento:", error.response || error.message);
        let errorMessage = "Erro ao atualizar rendimento. Tente novamente.";
        if (error.response && error.response.data) {
          const backendData = error.response.data;
          if (backendData.message) {
            if (Array.isArray(backendData.message)) {
              errorMessage = backendData.message.join(" | ");
            } else if (typeof backendData.message === 'string') {
              errorMessage = backendData.message;
            }
          } else if (backendData.error) {
            errorMessage = backendData.error;
          }
        }

        if (errorMessage.includes("Nome") &&
            (errorMessage.includes("vazio") || errorMessage.includes("nulo") || errorMessage.includes("preenchido incorretamente"))) {
          setMensagem(`Erro no nome: ${errorMessage}. Verifique o nome em seu perfil ou contate o suporte.`);
        } else {
          setMensagem(errorMessage);
        }
      });
  };

  return (
    <div className="popup">
      <h3>Editar Rendimento</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          step="0.01"
          value={novaRenda}
          onChange={(e) => {
            const valor = parseFloat(e.target.value);
            setNovaRenda(isNaN(valor) ? 0 : valor);
          }}
          required
        />
        <button type="submit">Salvar</button>
        <button type="button" onClick={onClose}>Cancelar</button>
        {mensagem && <p className="popup-message">{mensagem}</p>}
      </form>
    </div>
  );
};

export default EditRendaPopup;
