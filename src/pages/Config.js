// src/pages/Config.js
import React, { useState } from "react";
import Layout from "../components/Layout";
import authService from "../services/authService";
import "../assets/Config.css";
import { useNavigate } from "react-router-dom";

const Config = () => {
  const [email, setEmail] = useState("");
  const [senhaAntiga, setSenhaAntiga] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const navigate = useNavigate();

  const handleAlterarSenha = async (e) => {
    e.preventDefault();
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      const request = {
        email: email,
        senhaAntiga: senhaAntiga,
        senhaNova: novaSenha
      };
      

      await authService.alterarSenha(usuario.id, request);
      alert("Senha alterada com sucesso!");
      setEmail("");
      setSenhaAntiga("");
      setNovaSenha("");
    } catch (error) {
      alert("Erro ao alterar senha.");
      console.error(error);
    }
  };

  const handleConfirmarExclusao = async () => {
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      await authService.delet(usuario.id);
      localStorage.removeItem("usuario");
      navigate("/login");
    } catch (err) {
      alert("Erro ao deletar conta.");
      console.error(err);
    }
  };

  const abrirModalConfirmacao = () => setMostrarConfirmacao(true);
  const fecharModalConfirmacao = () => setMostrarConfirmacao(false);

  return (
    <Layout>
      <div className="config-container">
        <h2>Alterar Senha</h2>
        <form className="config-form" onSubmit={handleAlterarSenha}>
          <div className="form-group">
            <label>E-mail:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Senha Atual:</label>
            <input type="password" value={senhaAntiga} onChange={(e) => setSenhaAntiga(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Nova Senha:</label>
            <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} required />
          </div>

          <button type="submit" className="salvar-btn">Alterar Senha</button>
        </form>

        <button onClick={abrirModalConfirmacao} className="deletar-btn">Deletar Conta</button>

        {mostrarConfirmacao && (
          <div className="modal-confirmacao">
            <div className="modal-conteudo">
              <p>Tem certeza que deseja excluir sua conta?</p>
              <button onClick={handleConfirmarExclusao} className="confirmar-btn">Sim, excluir</button>
              <button onClick={fecharModalConfirmacao} className="cancelar-btn">Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Config;
