// src/pages/Lancamentos.js
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import authService from "../services/authService";
import "../assets/Lancamentos.css";

const Lancamentos = () => {
  const [lancamentos, setLancamentos] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 15;

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (usuario?.id) {
      authService.buscarLancamentosPorUsuario(usuario.id)
        .then(res => setLancamentos(res.data))
        .catch(err => console.error("Erro ao buscar lançamentos", err));
    }
  }, []);

  const totalPaginas = Math.ceil(lancamentos.length / itensPorPagina);
  const lancamentosExibidos = lancamentos.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  const mudarPagina = (novaPagina) => {
    if (novaPagina >= 1 && novaPagina <= totalPaginas) {
      setPaginaAtual(novaPagina);
    }
  };

  const handleExcluir = async (id) => {
    if (window.confirm("Deseja realmente excluir este lançamento?")) {
      try {
        await authService.delet(id);
        setLancamentos(lancamentos.filter(l => l.id !== id));
      } catch (error) {
        alert("Erro ao excluir lançamento.");
        console.error(error);
      }
    }
  };

  return (
    <Layout>
      <div className="lancamentos-container">
        <div className="header-bar">
          <h2>Lançamentos</h2>
          <button className="novo-button">+ Novo Lançamento</button>
        </div>

        <table className="lancamentos-table">
          <thead>
            <tr>
              <th>Valor</th>
              <th>Categoria</th>
              <th>Subcategoria</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lancamentosExibidos.map((item) => (
              <tr key={item.id}>
                <td>R$ {item.valor.toFixed(2)}</td>
                <td>{item.categoria}</td>
                <td>{item.subcategoria}</td>
                <td>{item.data}</td>
                <td className="acoes">
                  <button className="editar">Editar</button>
                  <button className="excluir" onClick={() => handleExcluir(item.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="paginacao">
          <button onClick={() => mudarPagina(paginaAtual - 1)} disabled={paginaAtual === 1}>Anterior</button>
          <span>Página {paginaAtual} de {totalPaginas}</span>
          <button onClick={() => mudarPagina(paginaAtual + 1)} disabled={paginaAtual === totalPaginas}>Próxima</button>
        </div>
      </div>
    </Layout>
  );
};

export default Lancamentos;
