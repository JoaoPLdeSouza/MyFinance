// src/pages/Lancamentos.js
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import "../assets/Lancamentos.css"; // Novo CSS exclusivo para lançamentos

const Lancamentos = () => {
  const [lancamentos, setLancamentos] = useState([]);

  // Exemplo estático de lançamentos (você substituirá com dados reais do back futuramente)
  useEffect(() => {
    setLancamentos([
      { id: 1, descricao: "Salário", tipo: "Receita", valor: 3000 },
      { id: 2, descricao: "Aluguel", tipo: "Despesa", valor: 1200 },
      { id: 3, descricao: "Mercado", tipo: "Despesa", valor: 600 },
      { id: 4, descricao: "Freelance", tipo: "Receita", valor: 800 },
    ]);
  }, []);

  return (
    <Layout>
      <div className="lancamentos-container">
        <div className="header-bar">
          <h2>Meus Lançamentos</h2>
          <button className="novo-button">+ Novo Lançamento</button>
        </div>

        <input
          type="text"
          className="search-bar"
          placeholder="Pesquisar lançamentos..."
        />

        <table className="lancamentos-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Descrição</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lancamentos.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.descricao}</td>
                <td>{item.tipo}</td>
                <td>R$ {item.valor.toFixed(2)}</td>
                <td className="acoes">
                  <button className="visualizar">Visualizar</button>
                  <button className="editar">Editar</button>
                  <button className="excluir">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default Lancamentos;
