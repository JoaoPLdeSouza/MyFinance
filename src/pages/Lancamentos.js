import React, { useEffect, useState, useCallback } from "react"; // Importa hooks essenciais do React
import Layout from "../components/Layout"; // Componente de layout comum da aplicação
import authService from "../services/authService"; // Serviço para comunicação com a API de autenticação/dados
import EditarModal from "../components/EditarModal"; // Modal para edição de lançamentos
import NovoModal from "../components/NovoModal"; // Modal para criação de novos lançamentos
import "../assets/Lancamentos.css"; // Estilos CSS específicos para a página de lançamentos

// Mapeamento de categorias da API para categorias amigáveis ao usuário.
// Esta constante é movida para fora do componente para evitar recriação desnecessária em cada renderização.
const categoriaMapeada = {
  NECESSIDADES: "Necessidade",
  DESEJOS: "Desejo",
  INVESTIMENTO_E_POUPANCA: "Investimento/Poupança"
};

// Mapeamento reverso para converter as categorias amigáveis de volta para o formato da API.
// Essencial para enviar dados corretos ao backend.
const categoriaReversaMapeada = Object.keys(categoriaMapeada).reduce((acc, key) => {
  acc[categoriaMapeada[key]] = key; // Inverte chave-valor
  return acc;
}, {});

// Função auxiliar para formatar uma string de data do formato YYYY-MM-DD (usado por input type="date")
// para DD/MM/YYYY, que pode ser o formato esperado pela API para certos endpoints.
const formatarDataParaAPI = (isoDateString) => {
  if (!isoDateString) return ""; // Retorna string vazia se a entrada for nula/vazia
  const [year, month, day] = isoDateString.split('-'); // Divide a string YYYY-MM-DD
  return `${day}/${month}/${year}`; // Retorna no formato DD/MM/YYYY
};

// Nova função para converter uma string de data no formato DD/MM/YYYY para um objeto Date.
// Isso é útil para comparações de data e ordenação.
const parseDateDDMMYYYY = (dateString) => {
  if (!dateString) return null; // Retorna nulo se a string for vazia/nula
  const parts = dateString.split('/'); // Divide a string DD/MM/YYYY
  // Importante: O mês em JavaScript Date é baseado em 0 (janeiro=0, dezembro=11)
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Subtrai 1 para ajustar ao índice do mês
  const year = parseInt(parts[2], 10);

  // Tenta extrair informações de tempo (HH:mm:ss) se presentes na string
  const timeMatch = dateString.match(/(\d{2}):(\d{2}):(\d{2})/);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const seconds = parseInt(timeMatch[3], 10);
    return new Date(year, month, day, hours, minutes, seconds); // Cria Date com data e hora
  }

  return new Date(year, month, day); // Cria Date apenas com a data
};

// Função auxiliar para formatar uma data para exibição na UI (sempre DD/MM/AAAA).
// Lida tanto com strings ISO (do backend) quanto com strings DD/MM/YYYY.
const formatarDataParaExibicao = (dateInput) => {
  if (!dateInput) return "Data Inválida"; // Retorna mensagem de erro se a entrada for inválida

  let date;

  // Primeiro, tenta tratar como formato ISO 8601 (ex: "YYYY-MM-DDTHH:mm:ss.sssZ")
  if (typeof dateInput === 'string' && dateInput.includes('-') && dateInput.includes('T')) {
    date = new Date(dateInput);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('pt-BR'); // Formata para o padrão local (DD/MM/AAAA)
    }
  }

  // Se não for um formato ISO válido, tenta parsear como DD/MM/YYYY (que é o formato que a API
  // parece estar retornando para dataHora em alguns casos, ou o formato que o modal de edição envia).
  date = parseDateDDMMYYYY(dateInput);
  if (date && !isNaN(date.getTime())) {
    // Retorna a data formatada para DD/MM/AAAA
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Fallback para caso não consiga parsear em nenhum dos formatos esperados
  return "Data Inválida";
};

// Componente principal da página de Lançamentos
const Lancamentos = () => {
  // Estados para gerenciar os dados dos lançamentos e o comportamento da UI
  const [lancamentos, setLancamentos] = useState([]); // Lançamentos atualmente exibidos na tabela (após filtros locais)
  const [paginaAtual, setPaginaAtual] = useState(1); // Página atual da tabela
  const [modalAberto, setModalAberto] = useState(false); // Estado para controlar a visibilidade do modal de edição
  const [lancamentoSelecionado, setLancamentoSelecionado] = useState(null); // Lançamento a ser editado no modal
  const [novoModalAberto, setNovoModalAberto] = useState(false); // Estado para controlar a visibilidade do modal de novo lançamento
  const [idParaExcluir, setIdParaExcluir] = useState(null); // ID do lançamento a ser excluído (para o popup de confirmação)

  const [filtrosVisiveis, setFiltrosVisiveis] = useState(false); // Estado para controlar a visibilidade da seção de filtros

  // Estados para os valores dos filtros
  const [filtroCategoria, setFiltroCategoria] = useState(""); // Filtro por categoria
  const [filtroSubcategoria, setFiltroSubcategoria] = useState(""); // Filtro por subcategoria
  const [filtroDataInicio, setFiltroDataInicio] = useState(""); // Filtro de data de início (formato YYYY-MM-DD para input type="date")
  const [filtroDataFinal, setFiltroDataFinal] = useState("");   // Filtro de data final (formato YYYY-MM-DD para input type="date")

  // Estados para armazenar as opções disponíveis nos selects de filtro
  const [opcoesCategorias, setOpcoesCategorias] = useState([]);
  const [opcoesSubcategorias, setOpcoesSubcategorias] = useState([]);
  
  // Armazena todos os lançamentos originais buscados da API, antes da aplicação de filtros locais.
  // Essencial para resetar ou aplicar múltiplos filtros sem refazer a chamada à API constantemente.
  const [todosLancamentosOriginais, setTodosLancamentosOriginais] = useState([]);

  const itensPorPagina = 15; // Quantidade de itens a serem exibidos por página

  // Função `buscarLancamentos`:
  // Responsável por buscar os lançamentos do usuário na API.
  // Utiliza `useCallback` para memorizar a função e evitar recriações desnecessárias,
  // otimizando o desempenho e prevenindo loops infinitos em `useEffect`.
  const buscarLancamentos = useCallback(async (dataInicio = "", dataFinal = "") => {
    const usuario = JSON.parse(localStorage.getItem("usuario")); // Obtém informações do usuário logado
    if (usuario?.id) { // Verifica se o ID do usuário existe
      const filtros = {
        dataInicio: dataInicio, // Passa a data de início para a API
        dataFinal: dataFinal    // Passa a data final para a API
      };
      
      try {
        // Chama o serviço para buscar lançamentos do usuário, passando os filtros de data
        const response = await authService.buscarLancamentosPorUsuario(usuario.id, filtros);
        const dadosLancamentos = response.data; // Acessa o array de dados da resposta
        
        // Ordena os lançamentos: primeiro por data (mais recente para mais antiga),
        // e depois por ID (decrescente) se as datas forem iguais.
        const lancamentosOrdenados = dadosLancamentos.sort((a, b) => { 
          const dateA = parseDateDDMMYYYY(a.dataHora); // Converte data A para objeto Date
          const dateB = parseDateDDMMYYYY(b.dataHora); // Converte data B para objeto Date

          // Compara as datas para ordenação
          if (dateA && dateB && dateA.getTime() === dateB.getTime()) {
            return b.id - a.id; // Se datas iguais, ordena por ID (decrescente)
          }
          // Ordena por data (mais recente primeiro), tratando nulos/inválidos
          return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
        });

        setLancamentos(lancamentosOrdenados); // Atualiza os lançamentos exibidos
        setTodosLancamentosOriginais(lancamentosOrdenados); // Armazena a lista original para filtros locais

        // Popula as opções de categoria e subcategoria para os filtros
        const categoriasIniciais = [...new Set(lancamentosOrdenados.map(item => categoriaMapeada[item.categoria] || item.categoria).filter(Boolean))].sort();
        const subcategoriasIniciais = [...new Set(lancamentosOrdenados.map(item => item.subcategoria).filter(Boolean))].sort();
        
        setOpcoesCategorias(categoriasIniciais);
        setOpcoesSubcategorias(subcategoriasIniciais);
      } catch (err) {
        console.error("Erro ao buscar lançamentos", err); // Log de erro
        // Limpa os estados em caso de erro na busca
        setLancamentos([]);
        setTodosLancamentosOriginais([]);
        setOpcoesCategorias([]);
        setOpcoesSubcategorias([]);
      }
    }
  }, []); // Dependências do useCallback: nenhuma, pois é uma função de busca geral

  // `useEffect` para buscar lançamentos quando o componente monta.
  // A função `buscarLancamentos` é a única dependência.
  useEffect(() => {
    buscarLancamentos();
  }, [buscarLancamentos]);

  // `useEffect` para re-buscar lançamentos na API quando os filtros de data mudam.
  // `setPaginaAtual(1)` garante que a paginação seja resetada ao aplicar novos filtros de data.
  useEffect(() => {
    // Formata as datas de início e fim para o formato esperado pela API
    const dataInicioFormatada = filtroDataInicio ? formatarDataParaAPI(filtroDataInicio) : "";
    const dataFinalFormatada = filtroDataFinal ? formatarDataParaAPI(filtroDataFinal) : "";

    setPaginaAtual(1); // Reseta a paginação ao mudar os filtros de data
    buscarLancamentos(dataInicioFormatada, dataFinalFormatada); // Chama a função de busca com os novos filtros
  }, [filtroDataInicio, filtroDataFinal, buscarLancamentos]); // Dependências: filtros de data e a função de busca

  // `useEffect` para aplicar filtros locais de categoria e subcategoria.
  // Este useEffect filtra os `todosLancamentosOriginais` (que são os dados da API)
  // e atualiza o estado `lancamentos` (que é exibido na tabela).
  useEffect(() => {
    let filteredByCatSub = todosLancamentosOriginais; // Começa com todos os lançamentos

    if (filtroCategoria) {
      // Se há um filtro de categoria, converte para o formato original e filtra
      const categoriaOriginal = categoriaReversaMapeada[filtroCategoria] || filtroCategoria;
      filteredByCatSub = filteredByCatSub.filter(item => item.categoria === categoriaOriginal);
    }

    if (filtroSubcategoria) {
      // Se há um filtro de subcategoria, filtra
      filteredByCatSub = filteredByCatSub.filter(item => item.subcategoria === filtroSubcategoria);
    }

    // Atualiza as opções de subcategorias e categorias baseadas nos lançamentos filtrados
    // Isso garante que os dropdowns de filtro mostrem apenas opções relevantes
    const novasOpcoesSubcategorias = [...new Set(filteredByCatSub.map(item => item.subcategoria).filter(Boolean))].sort();
    setOpcoesSubcategorias(novasOpcoesSubcategorias);

    const novasOpcoesCategorias = [...new Set(filteredByCatSub.map(item => categoriaMapeada[item.categoria] || item.categoria).filter(Boolean))].sort();
    setOpcoesCategorias(novasOpcoesCategorias);

    setLancamentos(filteredByCatSub); // Atualiza a lista de lançamentos para exibição
    setPaginaAtual(1); // Reseta a paginação ao aplicar filtros locais
  }, [filtroCategoria, filtroSubcategoria, todosLancamentosOriginais]); // Dependências: filtros de categoria/subcategoria e a lista original

  // Cálculo para paginação
  const totalPaginas = Math.ceil(lancamentos.length / itensPorPagina); // Calcula o número total de páginas
  const lancamentosExibidos = lancamentos.slice( // Slice para pegar os itens da página atual
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  // Função para mudar a página da tabela
  const mudarPagina = (novaPagina) => {
    if (novaPagina >= 1 && novaPagina <= totalPaginas) {
      setPaginaAtual(novaPagina);
    }
  };

  // Funções para gerenciamento da exclusão de lançamento (popup de confirmação)
  const confirmarExclusao = (id) => {
    setIdParaExcluir(id); // Armazena o ID do item a ser excluído para exibição do popup
  };

  const cancelarExclusao = () => {
    setIdParaExcluir(null); // Fecha o popup de confirmação
  };

  // Função assíncrona para confirmar a exclusão e interagir com a API
  const excluirConfirmado = async () => {
    try {
      await authService.deletarGasto(idParaExcluir); // Chama o serviço para deletar o gasto
      // Após exclusão, re-busca todos os lançamentos com os filtros de data atuais
      const dataInicioFormatada = filtroDataInicio ? formatarDataParaAPI(filtroDataInicio) : "";
      const dataFinalFormatada = filtroDataFinal ? formatarDataParaAPI(filtroDataFinal) : "";
      buscarLancamentos(dataInicioFormatada, dataFinalFormatada); // Atualiza a lista de lançamentos
      setIdParaExcluir(null); // Fecha o popup
      setPaginaAtual(1); // Reseta a paginação
    } catch (error) {
      alert("Erro ao excluir lançamento."); // Alerta em caso de erro
      console.error("Erro ao excluir gasto:", error); // Log detalhado do erro
    }
  };

  // Função para abrir o modal de edição, passando o lançamento selecionado
  const abrirModal = (lancamento) => {
    setLancamentoSelecionado(lancamento);
    setModalAberto(true);
  };

  // Função assíncrona para salvar as alterações de um lançamento editado
  const salvarAlteracoes = async (lancamentoEditado) => {
    try {
      // Converte a categoria para o formato da API, se necessário
      const categoriaParaSalvar = categoriaReversaMapeada[lancamentoEditado.categoria] || lancamentoEditado.categoria;
      
      // Chama o serviço para alterar o gasto na API
      await authService.alterarGasto(lancamentoEditado.id, {
        valor: lancamentoEditado.valor,
        categoria: categoriaParaSalvar,
        subcategoria: lancamentoEditado.subcategoria,
        dataHora: lancamentoEditado.dataHora, // A dataHora já vem do EditarModal no formato DD/MM/AAAA
      });
      // Após alteração, re-busca todos os lançamentos com os filtros de data atuais
      const dataInicioFormatada = filtroDataInicio ? formatarDataParaAPI(filtroDataInicio) : "";
      const dataFinalFormatada = filtroDataFinal ? formatarDataParaAPI(filtroDataFinal) : "";
      buscarLancamentos(dataInicioFormatada, dataFinalFormatada); // Atualiza a lista de lançamentos
      setModalAberto(false); // Fecha o modal de edição
    } catch (error) {
      console.error("Erro ao salvar alteração:", error); // Log detalhado do erro
      alert("Erro ao salvar alteração no lançamento."); // Alerta em caso de erro
    }
  };

  return (
    <Layout> {/* Componente de layout que envolve o conteúdo da página */}
      <div className="lancamentos-container">
        {/* Barra de cabeçalho com título e botões */}
        <div className="header-bar">
          <h2>Lançamentos</h2>
          <div className="header-buttons">
            {/* Botão para abrir o modal de novo lançamento */}
            <button className="novo-button" onClick={() => setNovoModalAberto(true)}>
              + Novo Lançamento
            </button>
            {/* Botão para mostrar/esconder a seção de filtros */}
            <button
              className="toggle-filtros-button"
              onClick={() => setFiltrosVisiveis(!filtrosVisiveis)}
            >
              {filtrosVisiveis ? "Esconder Filtros" : "Mostrar Filtros"}
            </button>
          </div>
        </div>

        {/* Seção de Filtros: visível apenas se `filtrosVisiveis` for true */}
        {filtrosVisiveis && (
          <div className="filters-section"> {/* Novo contêiner para os filtros */}
            {/* Grupo de filtro para Categoria */}
            <div className="filter-group">
              <label htmlFor="filtroCategoria">Categoria:</label>
              <select
                id="filtroCategoria"
                value={filtroCategoria}
                onChange={(e) => {
                  setFiltroCategoria(e.target.value);
                  setPaginaAtual(1); // Reseta a paginação ao mudar o filtro de categoria
                  setFiltroSubcategoria(""); // Limpa o filtro de subcategoria para evitar inconsistências
                }}
              >
                <option value="">Todas as Categorias</option>
                {/* Mapeia as opções de categoria disponíveis */}
                {opcoesCategorias.map((categoria) => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
            </div>

            {/* Grupo de filtro para Subcategoria */}
            <div className="filter-group">
              <label htmlFor="filtroSubcategoria">Subcategoria:</label>
              <select
                id="filtroSubcategoria"
                value={filtroSubcategoria}
                onChange={(e) => {
                  setFiltroSubcategoria(e.target.value);
                  setPaginaAtual(1); // Reseta a paginação ao mudar o filtro de subcategoria
                  // Não reseta filtroCategoria aqui, pois são filtros independentes agora
                }}
              >
                <option value="">Todas as Subcategorias</option>
                {/* Mapeia as opções de subcategoria disponíveis */}
                {opcoesSubcategorias.map((subcategoria) => (
                  <option key={subcategoria} value={subcategoria}>{subcategoria}</option>
                ))}
              </select>
            </div>

            {/* Grupo de filtro para Data de Início (input tipo "date") */}
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

            {/* Grupo de filtro para Data Final (input tipo "date") */}
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

        {/* Tabela de Lançamentos */}
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
            {/* Renderização condicional: se não houver lançamentos, exibe mensagem; senão, exibe a tabela */}
            {lancamentosExibidos.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-results-message">
                  Nenhum lançamento encontrado com os filtros aplicados.
                </td>
              </tr>
            ) : (
              // Mapeia e renderiza cada lançamento da página atual
              lancamentosExibidos.map((item) => (
                <tr key={item.id}>
                  {/* Formata o valor para exibição em moeda local */}
                  <td>{item.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                  {/* Exibe a categoria formatada (ex: "Necessidade" ao invés de "NECESSIDADES") */}
                  <td>{categoriaMapeada[item.categoria] || item.categoria}</td>
                  <td>{item.subcategoria}</td>
                  {/* Formata e exibe a data */}
                  <td>{formatarDataParaExibicao(item.dataHora)}</td>
                  <td className="acoes">
                    {/* Botão de Editar que abre o modal de edição com o item selecionado */}
                    <button className="editar" onClick={() => abrirModal(item)}>Editar</button>
                    {/* Botão de Excluir que abre o popup de confirmação */}
                    <button className="excluir" onClick={() => confirmarExclusao(item.id)}>Excluir</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Controles de Paginação */}
        <div className="paginacao">
          {/* Botão Anterior: desabilitado se estiver na primeira página */}
          <button onClick={() => mudarPagina(paginaAtual - 1)} disabled={paginaAtual === 1}>Anterior</button>
          {/* Exibe a página atual e o total de páginas */}
          <span>Página {paginaAtual} de {totalPaginas === 0 ? 1 : totalPaginas}</span>
          {/* Botão Próxima: desabilitado se estiver na última página ou se não houver lançamentos */}
          <button onClick={() => mudarPagina(paginaAtual + 1)} disabled={paginaAtual === totalPaginas || totalPaginas === 0}>Próxima</button>
        </div>
      </div>

      {/* Modal de Edição: renderizado condicionalmente se `modalAberto` for true */}
      {modalAberto && (
        <EditarModal
          lancamento={lancamentoSelecionado} // Passa o lançamento a ser editado
          onClose={() => setModalAberto(false)} // Função para fechar o modal
          onSave={salvarAlteracoes} // Função para salvar as alterações
        />
      )}

      {/* Modal de Novo Lançamento: renderizado condicionalmente se `novoModalAberto` for true */}
      {novoModalAberto && (
        <NovoModal
          onClose={() => setNovoModalAberto(false)} // Função para fechar o modal
          onSalvarNovo={async (idUsuario, novoGasto) => { // Função para salvar um novo lançamento
            try {
              await authService.cadastrarGasto(idUsuario, novoGasto); // Chama o serviço para cadastrar
              // Após cadastro, re-busca todos os lançamentos com os filtros de data atuais
              const dataInicioFormatada = filtroDataInicio ? formatarDataParaAPI(filtroDataInicio) : "";
              const dataFinalFormatada = filtroDataFinal ? formatarDataParaAPI(filtroDataFinal) : "";
              buscarLancamentos(dataInicioFormatada, dataFinalFormatada); // Atualiza a lista
              setNovoModalAberto(false); // Fecha o modal
            } catch (err) {
              console.error("Erro ao cadastrar gasto:", err); // Log de erro
              alert("Erro ao cadastrar novo lançamento."); // Alerta em caso de erro
            }
          }}
        />
      )}

      {/* Popup de Confirmação de Exclusão: renderizado condicionalmente se `idParaExcluir` não for nulo */}
      {idParaExcluir !== null && (
        <div className="popup-overlay">
          <div className="popup">
            <p>Tem certeza que deseja excluir este lançamento?</p>
            <div className="popup-buttons">
              {/* Botão para confirmar a exclusão */}
              <button className="btn-confirmar" onClick={excluirConfirmado}>Confirmar</button>
              {/* Botão para cancelar a exclusão */}
              <button className="btn-cancelar" onClick={cancelarExclusao}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Lancamentos; // Exporta o componente Lancamentos