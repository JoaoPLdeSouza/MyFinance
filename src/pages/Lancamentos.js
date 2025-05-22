// src/pages/Lancamentos.js
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import authService from "../services/authService";
import EditarModal from "../components/EditarModal";
import NovoModal from "../components/NovoModal"; // se estiver usando também
import "../assets/Lancamentos.css";

const Lancamentos = () => {
  const [lancamentos, setLancamentos] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [modalAberto, setModalAberto] = useState(false);
  const [lancamentoSelecionado, setLancamentoSelecionado] = useState(null);
  const [novoModalAberto, setNovoModalAberto] = useState(false);
  const itensPorPagina = 15;

  useEffect(() => {
    buscarLancamentos();
  }, []);

  const buscarLancamentos = () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (usuario?.id) {
      authService.buscarLancamentosPorUsuario(usuario.id)
        .then(res => setLancamentos(res.data))
        .catch(err => console.error("Erro ao buscar lançamentos", err));
    }
  };

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
        await authService.deletarGasto(id); // ✅ nova função específica
        setLancamentos(lancamentos.filter(l => l.id !== id));
      } catch (error) {
        alert("Erro ao excluir lançamento.");
        console.error("Erro ao excluir gasto:", error);
      }
    }
  };

  const abrirModal = (lancamento) => {
    setLancamentoSelecionado(lancamento);
    setModalAberto(true);
  };

  const salvarAlteracoes = async (lancamentoEditado) => {
    try {
      await authService.alterarGasto(lancamentoEditado.id, {
        valor: lancamentoEditado.valor,
        categoria: lancamentoEditado.categoria,
        subcategoria: lancamentoEditado.subcategoria,
        dataHora: lancamentoEditado.dataHora,
      });

      setLancamentos(prev =>
        prev.map(item => item.id === lancamentoEditado.id ? lancamentoEditado : item)
      );

      setModalAberto(false);
    } catch (error) {
      console.error("Erro ao salvar alteração:", error);
      alert("Erro ao salvar alteração no lançamento.");
    }
  };

  const categoriaMapeada = {
    NECESSIDADES: "Necessidade",
    DESEJOS: "Desejo",
    INVESTIMENTO_E_POUPANCA: "Investimento/Poupança"
  };

  return (
    <Layout>
      <div className="lancamentos-container">
        <div className="header-bar">
          <h2>Lançamentos</h2>
          <button className="novo-button" onClick={() => setNovoModalAberto(true)}>
            + Novo Lançamento
          </button>
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
                <td>{item.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                <td>{categoriaMapeada[item.categoria] || item.categoria}</td>
                <td>{item.subcategoria}</td>
                <td>{item.dataHora}</td>
                <td className="acoes">
                  <button className="editar" onClick={() => abrirModal(item)}>Editar</button>
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

      {/* Modal de edição */}
      {modalAberto && (
        <EditarModal
          lancamento={lancamentoSelecionado}
          onClose={() => setModalAberto(false)}
          onSave={salvarAlteracoes}
        />
      )}

      {/* Modal de novo lançamento (opcional) */}
      {novoModalAberto && (
        <NovoModal
          onClose={() => setNovoModalAberto(false)}
          onSalvarNovo={(idUsuario, novoGasto) => {
            authService.cadastrarGasto(idUsuario, novoGasto)
              .then(() => {
                buscarLancamentos();
                setNovoModalAberto(false);
              })
              .catch(err => {
                console.error("Erro ao cadastrar gasto:", err);
                alert("Erro ao cadastrar novo lançamento.");
              });
          }}
        />
      )}
    </Layout>
  );
};

export default Lancamentos;
