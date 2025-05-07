// src/pages/AlterarEmail.js
import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import authService from "../services/authService";
import "../assets/Config.css";

const AlterarEmail = () => {
  const [email, setEmail] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("usuario"));
    if (storedUser) {
      authService.getUserById(storedUser.id)
        .then((res) => {
          setUsuario(res.data);
          setEmail(res.data.email);
        })
        .catch((err) => console.error("Erro ao carregar dados:", err));
    }
  }, []);

  const handleSalvar = async (e) => {
    e.preventDefault();
    try {
      await authService.alterarEmail(usuario.id, email, senhaAtual);
      alert("E-mail atualizado com sucesso!");
      setSenhaAtual("");
    } catch (error) {
      alert("Senha incorreta.");
      console.error(error);
    }
  };

  return (
    <Layout>
      <div className="config-container">
        <h2>Alterar E-mail</h2>
        <form className="config-form" onSubmit={handleSalvar}>
          <div className="form-group">
            <label>Novo e-mail:</label>
            <input
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Senha atual:</label>
            <input
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="salvar-btn">Salvar</button>
        </form>
      </div>
    </Layout>
  );
};

export default AlterarEmail;
