import React, { useState } from "react";
import authService from "../services/authService";
import "../assets/Popup.css";

const EditEmailPopup = ({ usuario, onClose }) => {
  const [novoEmail, setNovoEmail] = useState(usuario.email);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [mensagem, setMensagem] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    authService.alterarEmail(usuario.id, novoEmail, senhaAtual)
      .then(() => {
        setMensagem("Email atualizado com sucesso!");
        //Delay
        setTimeout(onClose, 1500);
      })
      .catch((error) => {
        console.error("Erro ao atualizar email:", error.response?.data || error.message);
        setMensagem("Erro ao atualizar email. Verifique sua senha atual e tente novamente.");
      });
  };

  return (
    <div className="popup">
      <h3>Editar Email</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={novoEmail}
          onChange={(e) => setNovoEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Sua senha atual"
          value={senhaAtual}
          onChange={(e) => setSenhaAtual(e.target.value)}
          required
        />
        <button type="submit">Salvar</button>
        <button type="button" onClick={onClose}>Cancelar</button>
        {mensagem && <p className="popup-message">{mensagem}</p>}
      </form>
    </div>
  );
};

export default EditEmailPopup;