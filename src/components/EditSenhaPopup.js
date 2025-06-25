import React, { useState } from "react";
import authService from "../services/authService";
import "../assets/Popup.css";

const EditSenhaPopup = ({ usuario, onClose }) => {
  const [senhaAntiga, setSenhaAntiga] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");
  const [mensagem, setMensagem] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (novaSenha !== confirmarNovaSenha) {
      setMensagem("As novas senhas não coincidem!");
      return;
    }

    const requestBody = {
      email: usuario.email,
      senhaAntiga: senhaAntiga,
      senhaNova: novaSenha,
    };

    authService.alterarSenha(usuario.id, requestBody)
      .then(() => {
        setMensagem("Senha atualizada com sucesso!");
        setSenhaAntiga("");
        setNovaSenha("");
        setConfirmarNovaSenha("");
        setTimeout(onClose, 1500);
      })
      .catch((error) => {
        console.error("Erro ao atualizar senha:", error.response?.data || error.message);
        setMensagem("Erro ao atualizar senha. Verifique a senha antiga e tente novamente.");
      });
  };

  return (
    <div className="popup">
      <h3>Alterar Senha</h3>
      <form onSubmit={handleSubmit}>
        {/* <input
          type="email"
          value={email}
          readOnly
          disabled
          className="read-only-input"
        /> */}
        <input
          type="password"
          placeholder="Senha Antiga"
          value={senhaAntiga}
          onChange={(e) => setSenhaAntiga(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Nova Senha"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirmar Nova Senha"
          value={confirmarNovaSenha}
          onChange={(e) => setConfirmarNovaSenha(e.target.value)}
          required
        />
        <button type="submit">Salvar</button>
        <button type="button" onClick={onClose}>Cancelar</button>
        {mensagem && <p className="popup-message">{mensagem}</p>}
      </form>
    </div>
  );
};

export default EditSenhaPopup;