// src/pages/Config.js
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import authService from "../services/authService";
import "../assets/Config.css";

const Config = () => {
  const [usuario, setUsuario] = useState({ nome: "", email: "", senha: "" });
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    const dadosSalvos = JSON.parse(localStorage.getItem("usuario"));
    if (dadosSalvos?.id) {
      authService.getUserById(dadosSalvos.id)
        .then(res => setUsuario(res.data))
        .catch(err => console.error("Erro ao carregar dados do usuário:", err));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuario((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dadosSalvos = JSON.parse(localStorage.getItem("usuario"));
      await authService.updateUser(dadosSalvos.id, usuario);
      setMensagem("Dados atualizados com sucesso!");
    } catch (error) {
      setMensagem("Erro ao atualizar os dados.");
      console.error("Erro ao atualizar usuário:", error);
    }
  };

  return (
    <Layout>
      <div className="config-container">
        <h2>Alterar Dados</h2>
        <form className="config-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nome">Nome:</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={usuario.nome}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">E-mail:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={usuario.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Nova senha:</label>
            <input
              type="password"
              id="senha"
              name="senha"
              value={usuario.senha}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit">Salvar Alterações</button>
          {mensagem && <p>{mensagem}</p>}
        </form>
      </div>
    </Layout>
  );
};

export default Config;
