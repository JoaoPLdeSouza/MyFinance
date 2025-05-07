// src/pages/Config.js
import React, { useState } from "react";
import Layout from "../components/Layout";
import authService from "../services/authService";
import "../assets/Config.css";

const Config = () => {
  const [email, setEmail] = useState("");
  const [senhaAntiga, setSenhaAntiga] = useState("");
  const [novaSenha, setNovaSenha] = useState("");

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
      </div>
    </Layout>
  );
};

export default Config;
