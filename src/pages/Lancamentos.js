// src/pages/Lancamentos.js

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

// A função parseDateString não será mais usada para ordenação, mas pode ser útil para o filtro de datas
// se as datas no dropdown continuarem sendo no formato "DD/MM/AAAA".
// Vou mantê-la e adaptar seu uso.
const parseDateString = (dateString) => {
  if (!dateString) return null;

  // Adaptação: Se a data já for ISO 8601 (como do Swagger: "2025-05-26T...Z"), new Date() a lê direto.
  // Se for "DD/MM/AAAA", tentamos parsear.
  // Isso cobre ambos os casos, caso a dataHora venha de fontes diferentes ou editores de texto.
  if (dateString.includes('-') && dateString.includes('T')) {
    return new Date(dateString); // Provavelmente ISO 8601
  }

  const parts = dateString.match(/(\d{2})\/(\d{2})\/(\d{4})(?: (\d{2}):(\d{2}):(\d{2}))?/);
  if (!parts) return null;

  const day = parseInt(parts[1], 10);
  const month = parseInt(parts[2], 10) - 1; // Mês é base 0
  const year = parseInt(parts[3], 10);
  const hour = parseInt(parts[4] || '0', 10);
  const minute = parseInt(parts[5] || '0', 10);
  const second = parseInt(parts[6] || '0', 10);

  return new Date(year, month, day, hour, minute, second);
};

// Função auxiliar para formatar a data para exibição (sempre DD/MM/AAAA)
const formatarDataParaExibicao = (isoString) => {
  try {
    // Tenta criar uma data a partir da string (pode ser ISO ou DD/MM/AAAA)
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      // Se a data for "DD/MM/AAAA", o new Date direto falha em alguns browsers, então usa parseDateString
      const parsedDate = parseDateString(isoString);
      if (parsedDate && !isNaN(parsedDate.getTime())) {
        return parsedDate.toLocaleDateString('pt-BR');
      }
      return "Data Inválida";
    }
    return date.toLocaleDateString('pt-BR');
  } catch (e) {
    console.error("Erro ao formatar data:", isoString, e);
    return "Data Inválida";
  }
};


const Lancamentos = () => {
  const [lancamentos, setLancamentos] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [modalAberto, setModalAberto] = useState(false);
  const [lancamentoSelecionado, setLancamentoSelecionado] = useState(null);
  const [novoModalAberto, setNovoModalAberto] = useState(false);
  const [idParaExcluir, setIdParaExcluir] = useState(null);

  const [filtrosVisiveis, setFiltrosVisiveis] = useState(false);

  // Estados para os valores dos filtros
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroSubcategoria, setFiltroSubcategoria] = useState("");
  const [filtroData, setFiltroData] = useState(""); // Este será a string "DD/MM/AAAA"

  // ESTADOS PARA AS OPÇÕES EXIBIDAS NOS DROPDOWNS (DINÂMICAS)
  const [opcoesCategorias, setOpcoesCategorias] = useState([]);
  const [opcoesSubcategorias, setOpcoesSubcategorias] = useState([]);
  const [opcoesDatas, setOpcoesDatas] = useState([]);

  // Estado para armazenar TODOS os lançamentos brutos (para facilitar a filtragem dinâmica)
  const [todosLancamentosOriginais, setTodosLancamentosOriginais] = useState([]);

  const itensPorPagina = 15;

  const buscarLancamentos = useCallback(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (usuario?.id) {
      authService.buscarLancamentosPorUsuario(usuario.id)
        .then(res => {
          // *** ALTERAÇÃO PRINCIPAL AQUI: ORDENAR POR ID DECRESCENTE ***
          const lancamentosOrdenados = res.data.sort((a, b) => {
            return b.id - a.id; // Ordem decrescente de ID (maior ID primeiro)
          });

          setLancamentos(lancamentosOrdenados);
          setTodosLancamentosOriginais(lancamentosOrdenados); // Armazenar dados brutos já ordenados

          // Inicializa as opções de filtro com base em TODOS os lançamentos (agora ordenados)
          const categoriasIniciais = [...new Set(lancamentosOrdenados.map(item => categoriaMapeada[item.categoria] || item.categoria).filter(Boolean))].sort();
          const subcategoriasIniciais = [...new Set(lancamentosOrdenados.map(item => item.subcategoria).filter(Boolean))].sort();
          
          // As datas para as opções do dropdown devem ser as datas formatadas para exibição,
          // e ordenadas (aqui ainda por data para o filtro de data ter ordem lógica)
          const datasUnicasExibicao = [...new Set(lancamentosOrdenados.map(item => formatarDataParaExibicao(item.dataHora)).filter(Boolean))].sort((a, b) => {
            // Convertemos para Date para ordenar as opções de data (ex: "25/05/2025")
            // Revertemos para AAAA-MM-DD para criar o objeto Date
            const partsA = a.split('/');
            const dateA = new Date(parseInt(partsA[2]), parseInt(partsA[1]) - 1, parseInt(partsA[0]));
            
            const partsB = b.split('/');
            const dateB = new Date(parseInt(partsB[2]), parseInt(partsB[1]) - 1, parseInt(partsB[0]));
            
            return dateB.getTime() - dateA.getTime(); // Ordem decrescente
          });


          setOpcoesCategorias(categoriasIniciais);
          setOpcoesSubcategorias(subcategoriasIniciais);
          setOpcoesDatas(datasUnicasExibicao);
        })
        .catch(err => console.error("Erro ao buscar lançamentos", err));
    }
  }, []); // Sem dependências desnecessárias

  useEffect(() => {
    buscarLancamentos();
  }, [buscarLancamentos]);

  // Efeito para atualizar as opções de Subcategoria e Categoria com base nos filtros selecionados
  useEffect(() => {
    let filteredByCatSub = todosLancamentosOriginais;

    // Se a categoria está selecionada, filtra os lançamentos por ela
    if (filtroCategoria) {
      const categoriaOriginal = categoriaReversaMapeada[filtroCategoria] || filtroCategoria;
      filteredByCatSub = filteredByCatSub.filter(item => item.categoria === categoriaOriginal);
    }

    // Se a subcategoria está selecionada, filtra os lançamentos por ela
    if (filtroSubcategoria) {
      filteredByCatSub = filteredByCatSub.filter(item => item.subcategoria === filtroSubcategoria);
    }

    // Gerar novas opções de subcategoria baseadas nos lançamentos filtrados pela categoria (e sub)
    const novasOpcoesSubcategorias = [...new Set(filteredByCatSub.map(item => item.subcategoria).filter(Boolean))].sort();
    setOpcoesSubcategorias(novasOpcoesSubcategorias);

    // Gerar novas opções de categoria baseadas nos lançamentos filtrados pela subcategoria (e cat)
    const novasOpcoesCategorias = [...new Set(filteredByCatSub.map(item => categoriaMapeada[item.categoria] || item.categoria).filter(Boolean))].sort();
    setOpcoesCategorias(novasOpcoesCategorias);

  }, [filtroCategoria, filtroSubcategoria, todosLancamentosOriginais]);


  // Lógica de FILTRAGEM PRINCIPAL (para exibição da tabela)
  const lancamentosFiltrados = lancamentos.filter((lancamento) => {
    const categoriaExibicao = categoriaMapeada[lancamento.categoria] || lancamento.categoria;
    const categoriaLower = categoriaExibicao ? categoriaExibicao.toLowerCase() : '';
    const subcategoriaLower = lancamento.subcategoria ? lancamento.subcategoria.toLowerCase() : '';
    
    // Usar formatarDataParaExibicao para garantir que a data do lançamento seja "DD/MM/AAAA" para comparação
    const dataLancamentoFormatada = formatarDataParaExibicao(lancamento.dataHora);

    const matchCategoria = filtroCategoria
      ? categoriaLower === filtroCategoria.toLowerCase()
      : true;
    const matchSubcategoria = filtroSubcategoria
      ? subcategoriaLower === filtroSubcategoria.toLowerCase()
      : true;
    const matchData = filtroData ? dataLancamentoFormatada === filtroData : true;

    return matchCategoria && matchSubcategoria && matchData;
  });

  const totalPaginas = Math.ceil(lancamentosFiltrados.length / itensPorPagina);
  const lancamentosExibidos = lancamentosFiltrados.slice(
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
      buscarLancamentos(); // Refresca os lançamentos e, consequentemente, as opções de filtro
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
      // Mapeia a categoria de volta para o formato original para a API
      const categoriaParaSalvar = categoriaReversaMapeada[lancamentoEditado.categoria] || lancamentoEditado.categoria;

      // Conversão da data para ISO 8601 se o modal retornar DD/MM/AAAA
      let dataHoraParaApi = lancamentoEditado.dataHora;
      if (typeof lancamentoEditado.dataHora === 'string' && lancamentoEditado.dataHora.includes('/')) {
          const [dia, mes, ano] = lancamentoEditado.dataHora.split('/');
          // Se precisar de horário específico, EditarModal deve fornecer.
          // Aqui, estamos criando uma data com base apenas no dia, mês e ano.
          dataHoraParaApi = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia)).toISOString();
      }


      await authService.alterarGasto(lancamentoEditado.id, {
        valor: lancamentoEditado.valor,
        categoria: categoriaParaSalvar, // Usar o valor original da categoria
        subcategoria: lancamentoEditado.subcategoria,
        dataHora: dataHoraParaApi, // Envia a data no formato ISO 8601
      });
      buscarLancamentos(); // Refresca os lançamentos e as opções de filtro
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

        <table className="lancamentos-table">
          <thead>
            <tr>
              <th>Valor</th>
              <th>Categoria</th>
              <th>Subcategoria</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
            {filtrosVisiveis && (
              <tr className="filter-row">
                <td> {/* Coluna Valor sem filtro */}</td>
                <td>
                  <select
                    value={filtroCategoria}
                    onChange={(e) => {
                      setFiltroCategoria(e.target.value);
                      setPaginaAtual(1);
                      setFiltroSubcategoria(""); // Limpa o filtro de subcategoria ao mudar a categoria
                    }}
                  >
                    <option value="">Todas as Categorias</option>
                    {opcoesCategorias.map((categoria) => (
                      <option key={categoria} value={categoria}>{categoria}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={filtroSubcategoria}
                    onChange={(e) => {
                      setFiltroSubcategoria(e.target.value);
                      setPaginaAtual(1);
                      setFiltroCategoria(""); // Limpa o filtro de categoria ao mudar a subcategoria
                    }}
                  >
                    <option value="">Todas as Subcategorias</option>
                    {opcoesSubcategorias.map((subcategoria) => (
                      <option key={subcategoria} value={subcategoria}>{subcategoria}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={filtroData}
                    onChange={(e) => {
                      setFiltroData(e.target.value);
                      setPaginaAtual(1);
                    }}
                  >
                    <option value="">Todas as Datas</option>
                    {opcoesDatas.map((data) => (
                      <option key={data} value={data}>{data}</option>
                    ))}
                  </select>
                </td>
                <td> {/* Coluna Ações sem filtro */}</td>
              </tr>
            )}
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
                  <td>{formatarDataParaExibicao(item.dataHora)}</td> {/* Usa a função auxiliar para exibir DD/MM/AAAA */}
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
          // Ao abrir o modal, passamos a dataHora no formato que ela vem da API (ISO 8601)
          // Se o seu EditarModal espera DD/MM/AAAA, você precisaria formatar aqui.
          // Por exemplo: dataHora: formatarDataParaExibicao(lancamentoSelecionado.dataHora)
          lancamento={lancamentoSelecionado}
          onClose={() => setModalAberto(false)}
          onSave={salvarAlteracoes}
        />
      )}

      {novoModalAberto && (
        <NovoModal
          onClose={() => setNovoModalAberto(false)}
          onSalvarNovo={(idUsuario, novoGasto) => {
            // NovoGasto.dataHora aqui pode vir em "DD/MM/AAAA" do modal de entrada
            // Se sim, precisamos converter para ISO 8601 para a API.
            let dataHoraParaApi = novoGasto.dataHora;
            if (typeof novoGasto.dataHora === 'string' && novoGasto.dataHora.includes('/')) {
                const [dia, mes, ano] = novoGasto.dataHora.split('/');
                // Por padrão, se o modal não fornecer hora, minuto, segundo, usaremos 00:00:00 UTC
                dataHoraParaApi = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia)).toISOString();
            }

            authService.cadastrarGasto(idUsuario, { ...novoGasto, dataHora: dataHoraParaApi })
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