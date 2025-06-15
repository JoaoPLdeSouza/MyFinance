import React, { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import authService from "../services/authService";
import EditarModal from "../components/EditarModal";
import NovoModal from "../components/NovoModal";
import "../assets/Lancamentos.css";

// Mova categoriaMapeada para FORA do componente
const categoriaMapeada = {
  NECESSIDADES: "Necessidade",
  DESEJOS: "Desejo",
  INVESTIMENTO_E_POUPANCA: "Investimento/Poupança"
};

// Mapeamento reverso para quando precisar do valor original (ex: para salvar na API)
const categoriaReversaMapeada = Object.keys(categoriaMapeada).reduce((acc, key) => {
  acc[categoriaMapeada[key]] = key;
  return acc;
}, {});

// Função auxiliar para formatar a data do input date (YYYY-MM-DD) para DD/MM/YYYY
const formatarDataParaAPI = (isoDateString) => {
  if (!isoDateString) return "";
  const [year, month, day] = isoDateString.split('-');
  return `${day}/${month}/${year}`;
};

// Nova função para converter DD/MM/YYYY para um objeto Date
const parseDateDDMMYYYY = (dateString) => {
  if (!dateString) return null;
  const parts = dateString.split('/');
  // Note: Month is 0-indexed in JavaScript Date
  // New Date(year, monthIndex, day, hours, minutes, seconds, milliseconds)
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Mês é base 0
  const year = parseInt(parts[2], 10);

  // Tentativa de extrair tempo se houver (para dataHora)
  const timeMatch = dateString.match(/(\d{2}):(\d{2}):(\d{2})/);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const seconds = parseInt(timeMatch[3], 10);
    return new Date(year, month, day, hours, minutes, seconds);
  }

  return new Date(year, month, day);
};

// Função auxiliar para formatar a data para exibição (sempre DD/MM/AAAA)
const formatarDataParaExibicao = (dateInput) => {
  if (!dateInput) return "Data Inválida";

  let date;

  // Primeiro, tenta tratar como formato ISO (YYYY-MM-DDTHH:mm:ss.sssZ) ou similar
  if (typeof dateInput === 'string' && dateInput.includes('-') && dateInput.includes('T')) {
    date = new Date(dateInput);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('pt-BR');
    }
  }

  // Se não for um formato ISO válido ou se já for DD/MM/YYYY
  // Tenta parsear como DD/MM/YYYY (que é o formato que a API parece estar retornando)
  date = parseDateDDMMYYYY(dateInput);
  if (date && !isNaN(date.getTime())) {
    // Retorna a data formatada para DD/MM/AAAA
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Fallback para caso não consiga parsear
  return "Data Inválida";
};


const Lancamentos = () => {
  const [lancamentos, setLancamentos] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [modalAberto, setModalAberto] = useState(false);
  const [lancamentoSelecionado, setLancamentoSelecionado] = useState(null);
  const [novoModalAberto, setNovoModalAberto] = useState(false);
  const [idParaExcluir, setIdParaExcluir] = useState(null);

  const [filtrosVisiveis, setFiltrosVisiveis] = useState(false);

  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroSubcategoria, setFiltroSubcategoria] = useState("");
  const [filtroDataInicio, setFiltroDataInicio] = useState(""); // Formato YYYY-MM-DD para input type="date"
  const [filtroDataFinal, setFiltroDataFinal] = useState("");   // Formato YYYY-MM-DD para input type="date"

  const [opcoesCategorias, setOpcoesCategorias] = useState([]);
  const [opcoesSubcategorias, setOpcoesSubcategorias] = useState([]);
  
  const [todosLancamentosOriginais, setTodosLancamentosOriginais] = useState([]); // Usado para filtros locais

  const itensPorPagina = 15;

  const buscarLancamentos = useCallback(async (dataInicio = "", dataFinal = "") => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (usuario?.id) {
      const filtros = {
        dataInicio: dataInicio,
        dataFinal: dataFinal
      };
      
      try {
        // Correção aqui: Acessar response.data para obter o array de lançamentos
        const response = await authService.buscarLancamentosPorUsuario(usuario.id, filtros);
        const dadosLancamentos = response.data; //
        
        const lancamentosOrdenados = dadosLancamentos.sort((a, b) => { 
          const dateA = parseDateDDMMYYYY(a.dataHora); 
          const dateB = parseDateDDMMYYYY(b.dataHora); 

          if (dateA && dateB && dateA.getTime() === dateB.getTime()) {
            return b.id - a.id;
          }
          return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
        });

        setLancamentos(lancamentosOrdenados);
        setTodosLancamentosOriginais(lancamentosOrdenados);

        const categoriasIniciais = [...new Set(lancamentosOrdenados.map(item => categoriaMapeada[item.categoria] || item.categoria).filter(Boolean))].sort();
        const subcategoriasIniciais = [...new Set(lancamentosOrdenados.map(item => item.subcategoria).filter(Boolean))].sort();
        
        setOpcoesCategorias(categoriasIniciais);
        setOpcoesSubcategorias(subcategoriasIniciais);
      } catch (err) {
        console.error("Erro ao buscar lançamentos", err);
        setLancamentos([]);
        setTodosLancamentosOriginais([]);
        setOpcoesCategorias([]);
        setOpcoesSubcategorias([]);
      }
    }
  }, []);

  useEffect(() => {
    buscarLancamentos();
  }, [buscarLancamentos]);

  useEffect(() => {
    const dataInicioFormatada = filtroDataInicio ? formatarDataParaAPI(filtroDataInicio) : "";
    const dataFinalFormatada = filtroDataFinal ? formatarDataParaAPI(filtroDataFinal) : "";

    setPaginaAtual(1); 
    buscarLancamentos(dataInicioFormatada, dataFinalFormatada);
  }, [filtroDataInicio, filtroDataFinal, buscarLancamentos]);

  // useEffect para aplicar filtros locais de categoria e subcategoria
  useEffect(() => {
    let filteredByCatSub = todosLancamentosOriginais;

    if (filtroCategoria) {
      const categoriaOriginal = categoriaReversaMapeada[filtroCategoria] || filtroCategoria;
      filteredByCatSub = filteredByCatSub.filter(item => item.categoria === categoriaOriginal);
    }

    if (filtroSubcategoria) {
      filteredByCatSub = filteredByCatSub.filter(item => item.subcategoria === filtroSubcategoria);
    }

    const novasOpcoesSubcategorias = [...new Set(filteredByCatSub.map(item => item.subcategoria).filter(Boolean))].sort();
    setOpcoesSubcategorias(novasOpcoesSubcategorias);

    const novasOpcoesCategorias = [...new Set(filteredByCatSub.map(item => categoriaMapeada[item.categoria] || item.categoria).filter(Boolean))].sort();
    setOpcoesCategorias(novasOpcoesCategorias);

    setLancamentos(filteredByCatSub);
    setPaginaAtual(1);
  }, [filtroCategoria, filtroSubcategoria, todosLancamentosOriginais]);


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

  const confirmarExclusao = (id) => {
    setIdParaExcluir(id);
  };

  const cancelarExclusao = () => {
    setIdParaExcluir(null);
  };

  const excluirConfirmado = async () => {
    try {
      await authService.deletarGasto(idParaExcluir);
      // Após exclusão, re-busca todos os lançamentos com os filtros de data atuais
      const dataInicioFormatada = filtroDataInicio ? formatarDataParaAPI(filtroDataInicio) : "";
      const dataFinalFormatada = filtroDataFinal ? formatarDataParaAPI(filtroDataFinal) : "";
      buscarLancamentos(dataInicioFormatada, dataFinalFormatada);
      setIdParaExcluir(null);
      setPaginaAtual(1);
    } catch (error) {
      alert("Erro ao excluir lançamento.");
      console.error("Erro ao excluir gasto:", error);
    }
  };

  const abrirModal = (lancamento) => {
    setLancamentoSelecionado(lancamento);
    setModalAberto(true);
  };

  const salvarAlteracoes = async (lancamentoEditado) => {
    try {
      const categoriaParaSalvar = categoriaReversaMapeada[lancamentoEditado.categoria] || lancamentoEditado.categoria;
      
      await authService.alterarGasto(lancamentoEditado.id, {
        valor: lancamentoEditado.valor,
        categoria: categoriaParaSalvar,
        subcategoria: lancamentoEditado.subcategoria,
        dataHora: lancamentoEditado.dataHora, 
      });
      // Após alteração, re-busca todos os lançamentos com os filtros de data atuais
      const dataInicioFormatada = filtroDataInicio ? formatarDataParaAPI(filtroDataInicio) : "";
      const dataFinalFormatada = filtroDataFinal ? formatarDataParaAPI(filtroDataFinal) : "";
      buscarLancamentos(dataInicioFormatada, dataFinalFormatada);
      setModalAberto(false);
    } catch (error) {
      console.error("Erro ao salvar alteração:", error);
      alert("Erro ao salvar alteração no lançamento.");
    }
  };

  return (
    <Layout>
      <div className="lancamentos-container">
        <div className="header-bar">
          <h2>Lançamentos</h2>
          <div className="header-buttons">
            <button className="novo-button" onClick={() => setNovoModalAberto(true)}>
              + Novo Lançamento
            </button>
            <button
              className="toggle-filtros-button"
              onClick={() => setFiltrosVisiveis(!filtrosVisiveis)}
            >
              {filtrosVisiveis ? "Esconder Filtros" : "Mostrar Filtros"}
            </button>
          </div>
        </div>

        {/* NOVA SEÇÃO DE FILTROS AQUI, FORA DA TABELA */}
        {filtrosVisiveis && (
          <div className="filters-section">
            <div className="filter-group">
              <label htmlFor="filtroCategoria">Categoria:</label>
              <select
                id="filtroCategoria"
                value={filtroCategoria}
                onChange={(e) => {
                  setFiltroCategoria(e.target.value);
                  setPaginaAtual(1); 
                  setFiltroSubcategoria(""); 
                }}
              >
                <option value="">Todas as Categorias</option>
                {opcoesCategorias.map((categoria) => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="filtroSubcategoria">Subcategoria:</label>
              <select
                id="filtroSubcategoria"
                value={filtroSubcategoria}
                onChange={(e) => {
                  setFiltroSubcategoria(e.target.value);
                  setPaginaAtual(1);
                  // Não resete filtroCategoria aqui, pois é um filtro independente agora
                }}
              >
                <option value="">Todas as Subcategorias</option>
                {opcoesSubcategorias.map((subcategoria) => (
                  <option key={subcategoria} value={subcategoria}>{subcategoria}</option>
                ))}
              </select>
            </div>

            <div className="filter-group date-filter-group">
              <label htmlFor="filtroDataInicio">Data de Início:</label>
              <input
                type="date"
                id="filtroDataInicio"
                value={filtroDataInicio}
                onChange={(e) => setFiltroDataInicio(e.target.value)}
                title="Data de Início"
              />
            </div>

            <div className="filter-group date-filter-group">
              <label htmlFor="filtroDataFinal">Data Final:</label>
              <input
                type="date"
                id="filtroDataFinal"
                value={filtroDataFinal}
                onChange={(e) => setFiltroDataFinal(e.target.value)}
                title="Data Final"
              />
            </div>
          </div>
        )}

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
            {lancamentosExibidos.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-results-message">
                  Nenhum lançamento encontrado com os filtros aplicados.
                </td>
              </tr>
            ) : (
              lancamentosExibidos.map((item) => (
                <tr key={item.id}>
                  <td>{item.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                  <td>{categoriaMapeada[item.categoria] || item.categoria}</td>
                  <td>{item.subcategoria}</td>
                  <td>{formatarDataParaExibicao(item.dataHora)}</td>
                  <td className="acoes">
                    <button className="editar" onClick={() => abrirModal(item)}>Editar</button>
                    <button className="excluir" onClick={() => confirmarExclusao(item.id)}>Excluir</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="paginacao">
          <button onClick={() => mudarPagina(paginaAtual - 1)} disabled={paginaAtual === 1}>Anterior</button>
          <span>Página {paginaAtual} de {totalPaginas === 0 ? 1 : totalPaginas}</span>
          <button onClick={() => mudarPagina(paginaAtual + 1)} disabled={paginaAtual === totalPaginas || totalPaginas === 0}>Próxima</button>
        </div>
      </div>

      {modalAberto && (
        <EditarModal
          lancamento={lancamentoSelecionado} 
          onClose={() => setModalAberto(false)}
          onSave={salvarAlteracoes}
        />
      )}

      {novoModalAberto && (
        <NovoModal
          onClose={() => setNovoModalAberto(false)}
          onSalvarNovo={async (idUsuario, novoGasto) => { 
            try {
              await authService.cadastrarGasto(idUsuario, novoGasto);
              // Após cadastro, re-busca todos os lançamentos com os filtros de data atuais
              const dataInicioFormatada = filtroDataInicio ? formatarDataParaAPI(filtroDataInicio) : "";
              const dataFinalFormatada = filtroDataFinal ? formatarDataParaAPI(filtroDataFinal) : "";
              buscarLancamentos(dataInicioFormatada, dataFinalFormatada);
              setNovoModalAberto(false);
            } catch (err) {
              console.error("Erro ao cadastrar gasto:", err);
              alert("Erro ao cadastrar novo lançamento.");
            }
          }}
        />
      )}

      {idParaExcluir !== null && (
        <div className="popup-overlay">
          <div className="popup">
            <p>Tem certeza que deseja excluir este lançamento?</p>
            <div className="popup-buttons">
              <button className="btn-confirmar" onClick={excluirConfirmado}>Confirmar</button>
              <button className="btn-cancelar" onClick={cancelarExclusao}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Lancamentos;