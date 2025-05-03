// src/pages/AlterarRendimento.js
import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import authService from "../services/authService";
import "../assets/Config.css";

const AlterarRendimento = () => {
  const [rendimento, setRendimento] = useState("");
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("usuario"));
    if (storedUser) {
      authService.getUserById(storedUser.id)
        .then((res) => {
          setUsuario(res.data);
          setRendimento(res.data.rendimento || "");
        })
        .catch((err) => console.error("Erro ao carregar dados:", err));
    }
  }, []);

  const handleSalvar = async (e) => {
    e.preventDefault();
    try {
      await authService.alterarRendimento({ id: usuario.id, rendimento });
      alert("Rendimento atualizado com sucesso!");
    } catch (error) {
      alert("Erro ao atualizar rendimento.");
      console.error(error);
    }
  };

  return (
    <Layout>
      <div className="config-container">
        <h2>Alterar Rendimento</h2>
        <form className="config-form" onSubmit={handleSalvar}>
          <div className="form-group">
            <label>Novo rendimento:</label>
            <input
              type="number"
              value={rendimento}
              onChange={(e) => setRendimento(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="salvar-btn">Salvar</button>
        </form>
      </div>
    </Layout>
  );
};

export default AlterarRendimento;
