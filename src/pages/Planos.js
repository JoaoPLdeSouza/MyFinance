import React, { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import { Chart } from "react-google-charts";
import authService from "../services/authService";
import "../assets/Planos.css";
import VEcononoPopup from "../components/VEcononoPopup";

// Componente principal para a página de Planos Financeiros
const Planos = () => {
  // Estados para gerenciar os dados do plano, carregamento, erros, popups e navegação
  const [dadosPlano, setDadosPlano] = useState(null); // Armazena os dados do plano financeiro atual
  const [loading, setLoading] = useState(true); // Indica se a página está carregando dados
  const [error, setError] = useState(null); // Armazena mensagens de erro
  const [showValueInputPopup, setShowValueInputPopup] = useState(false); // Controla a visibilidade do popup de entrada de valor
  const [todosOsPlanos, setTodosOsPlanos] = useState([]); // Armazena todos os planos financeiros do usuário
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0); // Índice do plano atualmente exibido

  // Mapeamento de cores para cada categoria de despesa, usado nos gráficos
  const categoriaCores = {
    NECESSIDADES: '#007bff',           // Azul
    DESEJOS: '#dc3545',               // Vermelho
    INVESTIMENTO_E_POUPANCA: '#28a745', // Verde
    ECONOMIA_PLANEJADA: '#8A2BE2'      // Roxo
  };

  // Função para formatar um valor numérico para o formato de moeda BRL (Real Brasileiro)
  const formatarValor = (valor) => {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  // Mapeamento de nomes de categorias para exibição amigável ao usuário
  const categoriaMapeada = {
    NECESSIDADES: "Necessidades",
    DESEJOS: "Desejos",
    INVESTIMENTO_E_POUPANCA: "Investimento/Poupança",
    ECONOMIA_PLANEJADA: "Economia Planejada"
  };

  // Função para preparar os dados para os gráficos do Google Charts
  const prepararDadosParaGrafico = (dataArray, titulo) => {
    // Agrupa os valores por categoria
    const categoriasAgrupadas = dataArray.reduce((acc, item) => {
      acc[item.categoria] = (acc[item.categoria] || 0) + item.valor;
      return acc;
    }, {});

    // Define os cabeçalhos das colunas para o gráfico (Categoria, Título, Tooltip HTML)
    const dados = [["Categoria", titulo, { type: 'string', role: 'tooltip', p: { html: true } }]];
    const coresOrdenadas = [];
    const seriesOptions = {};

    // Obtém as chaves das categorias em ordem definida
    const orderedCategories = Object.keys(categoriaCores);
    let seriesIndex = 0;

    // Itera sobre as categorias ordenadas e adiciona os dados ao array para o gráfico
    orderedCategories.forEach(categoriaKey => {
      if (categoriasAgrupadas.hasOwnProperty(categoriaKey)) {
        const valorNumerico = categoriasAgrupadas[categoriaKey];
        const valorFormatado = formatarValor(valorNumerico);
        // Cria o HTML para o tooltip personalizado do gráfico
        const tooltipHtml = `<div style="padding: 10px; border: 1px solid #ccc; background-color: #fff; font-size: 14px;">` +
                             `<strong>${categoriaMapeada[categoriaKey]}</strong>: ${valorFormatado}` +
                             `</div>`;
        dados.push([categoriaMapeada[categoriaKey], valorNumerico, tooltipHtml]);
        coresOrdenadas.push(categoriaCores[categoriaKey]);
        seriesOptions[seriesIndex] = { color: categoriaCores[categoriaKey] };
        seriesIndex++;
      }
    });

    // Adiciona quaisquer outras categorias não predefinidas com uma cor padrão
    for (const categoriaKey in categoriasAgrupadas) {
      if (!orderedCategories.includes(categoriaKey)) {
        const valorNumerico = categoriasAgrupadas[categoriaKey];
        const valorFormatado = formatarValor(valorNumerico);
        const tooltipHtml = `<div style="padding: 10px; border: 1px solid #ccc; background-color: #fff; font-size: 14px;">` +
                             `<strong>${categoriaMapeada[categoriaKey] || categoriaKey}</strong>: ${valorFormatado}` +
                             `</div>`;
        dados.push([categoriaMapeada[categoriaKey] || categoriaKey, valorNumerico, tooltipHtml]);
        coresOrdenadas.push('#cccccc'); // Cor padrão para categorias não mapeadas
        seriesOptions[seriesIndex] = { color: '#cccccc' };
        seriesIndex++;
      }
    }
    
    return { data: dados, colors: coresOrdenadas, series: seriesOptions };
  };

  // Função assíncrona para carregar os planos financeiros do usuário
  const carregarPlanosDoUsuario = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      if (!usuario || !usuario.id) {
        throw new Error("ID do usuário não encontrado. Faça login novamente.");
      }

      const response = await authService.buscarPlanosPorUsuario(usuario.id);

      if (Array.isArray(response.data) && response.data.length > 0) {
        // Filtra planos pelo ID do usuário e ordena pelo ID (mais recente primeiro)
        const planosDoUsuario = response.data
          .filter((plano) => plano.idUsuario === usuario.id)
          .sort((a, b) => b.id - a.id);

        // Pega apenas os 3 últimos planos
        const ultimos3Planos = planosDoUsuario.slice(0, 3);
        setTodosOsPlanos(ultimos3Planos);

        // Define o primeiro plano como o plano atual a ser exibido
        if (ultimos3Planos.length > 0) {
          setDadosPlano(ultimos3Planos[0]);
          setCurrentPlanIndex(0);
        } else {
          setDadosPlano(null);
          setCurrentPlanIndex(0);
        }
      } else {
        setDadosPlano(null);
        setTodosOsPlanos([]);
        setCurrentPlanIndex(0);
      }
    } catch (err) {
      console.error("Erro ao carregar os planos:", err);
      // Trata diferentes tipos de erros e define a mensagem de erro
      if (err.response && err.response.data && err.response.data.message) {
        setError(`Erro ao carregar planos: ${err.response.data.message}`);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Não foi possível carregar os planos financeiros. Verifique sua conexão.");
      }
      setDadosPlano(null);
      setTodosOsPlanos([]);
    } finally {
      setLoading(false);
    }
  }, []); // Dependência vazia, pois não depende de nenhum valor externo reativo

  // Função assíncrona para gerar um novo plano financeiro padrão
  const gerarNovoPlano = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      if (!usuario || !usuario.id) {
        throw new Error("ID do usuário não encontrado. Faça login novamente.");
      }

      const response = await authService.gerarPlano(usuario.id);

      // Se o plano for gerado com sucesso, recarrega os planos do usuário
      if (response.data && response.data.id) {
        carregarPlanosDoUsuario();
      } else {
        setError("O plano foi gerado, mas não pudemos exibi-lo. Tente recarregar a página.");
      }
    } catch (err) {
      console.error("Erro ao gerar novo plano padrão:", err);
      let errorMessage = "Não foi possível gerar um novo plano financeiro. Tente novamente.";
      // Trata diferentes tipos de erros e define a mensagem de erro
      if (err.response) {
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data) {
          errorMessage = JSON.stringify(err.response.data);
        } else {
          errorMessage = `Erro do servidor: ${err.response.status} ${err.response.statusText}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setDadosPlano(null);
    } finally {
      setLoading(false);
    }
  }, [carregarPlanosDoUsuario]); // Depende da função carregarPlanosDoUsuario

  // Função assíncrona para gerar um novo plano financeiro com base em um valor de economia mensal
  const gerarNovoPlanoComValor = useCallback(async (valor) => {
    setLoading(true);
    setError(null);
    setShowValueInputPopup(false); // Fecha o popup após a submissão
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      if (!usuario || !usuario.id) {
        throw new Error("ID do usuário não encontrado. Faça login novamente.");
      }

      const response = await authService.gerarPlano(usuario.id, valor);

      // Se o plano for gerado com sucesso, recarrega os planos do usuário
      if (response.data && response.data.id) {
        carregarPlanosDoUsuario();
      } else {
        setError("O plano foi gerado, mas não pudemos exibi-lo. Tente recarregar a página.");
      }
    } catch (err) {
      console.error("Erro ao gerar novo plano com valor:", err);
      let errorMessage = "Ocorreu um erro ao gerar o plano com valor. Tente novamente.";
      // Trata diferentes tipos de erros e define a mensagem de erro
      if (err.response) {
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data) {
          errorMessage = JSON.stringify(err.response.data);
        } else {
          errorMessage = `Erro do servidor: ${err.response.status} ${err.response.statusText}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setDadosPlano(null);
    } finally {
      setLoading(false);
    }
  }, [carregarPlanosDoUsuario]); // Depende da função carregarPlanosDoUsuario

  // Lida com a navegação para o plano anterior na lista
  const handlePreviousPlan = () => {
    const newIndex = currentPlanIndex + 1;
    if (newIndex < todosOsPlanos.length) {
      setCurrentPlanIndex(newIndex);
      setDadosPlano(todosOsPlanos[newIndex]);
    }
  };

  // Lida com a navegação para o próximo plano na lista
  const handleNextPlan = () => {
    const newIndex = currentPlanIndex - 1;
    if (newIndex >= 0) {
      setCurrentPlanIndex(newIndex);
      setDadosPlano(todosOsPlanos[newIndex]);
    }
  };

  // Efeito colateral para carregar os planos do usuário quando o componente é montado
  useEffect(() => {
    carregarPlanosDoUsuario();
  }, [carregarPlanosDoUsuario]); // Garante que a função seja chamada quando carregarPlanosDoUsuario mudar (o que é improvável devido ao useCallback)

  // Verifica se há múltiplos planos para habilitar a navegação
  const hasMultiplePlans = todosOsPlanos.length > 1;

  // Opções globais de loader para Google Charts com localização em pt-BR
  const chartLoaders = {
    charts: ["PieChart", "BarChart"],
    language: "pt-BR", // Define o idioma para formatação numérica
  };

  // Renderização do componente
  return (
    <Layout>
      <div className="planos-container">
        <h1 className="planos-header">Seu Plano Financeiro</h1>
        <p className="planos-description">
          Aqui você pode visualizar seu plano financeiro atual. Ele é gerado com base nos seus lançamentos
          e oferece recomendações de ajustes e identifica áreas de risco em suas despesas.
        </p>

        {/* Grupo de ações para gerar planos */}
        <div className="planos-actions-group">
          {/* Card para gerar plano padrão */}
          <div className="plan-action-card">
            <p className="action-description">
              Gere um plano com base nos seus gastos atuais para identificar áreas de risco e oportunidades de ajuste,
              ajudando você a sair do vermelho e melhorar sua saúde financeira geral.
            </p>
            <button
              className="gerar-plano-button"
              onClick={gerarNovoPlano}
              disabled={loading} // Desabilita o botão durante o carregamento
            >
              {loading ? "Gerando Plano..." : "Gerar Plano Padrão"}
            </button>
          </div>

          {/* Card para gerar plano com valor de economia mensal */}
          <div className="plan-action-card">
            <p className="action-description">
              Quer planejar sua economia mensal? Clique no botão abaixo e informe
              o valor que você deseja economizar por mês. A ferramenta irá te ajudar a visualizar
              como alcançar essa meta!
            </p>
            <button
              className="gerar-plano-button"
              onClick={() => setShowValueInputPopup(true)} // Abre o popup
              disabled={loading} // Desabilita o botão durante o carregamento
            >
              Gerar Plano com Valor de Economia Mensal
            </button>
          </div>
        </div>

        {/* Mensagens de status (carregamento, erro) */}
        {loading && (
          <div className="planos-message loading-message">
            <p>Carregando plano financeiro...</p>
          </div>
        )}

        {error && (
          <div className="planos-message error-message">
            <p>{error}</p>
          </div>
        )}

        {/* Se não estiver carregando, sem erro e com dados do plano */}
        {!loading && !error && dadosPlano && (
          <>
            {/* Seção de resumo e avisos do plano */}
            <div className="planos-summary">
              <p>
                Entenda seu plano:
                <br></br>
                <br />
                Ajustes Recomendados: Representam oportunidades para otimizar seus gastos.
                Considere direcionar esses valores para suas economias ou investimentos,
                visando alcançar seus objetivos financeiros mais rapidamente.
                <br></br>
                <br />
                Áreas de Risco: Indicam despesas que foram identificadas como potencialmente altas.
                É crucial revisar esses itens para identificar onde você pode economizar
                e evitar que eles comprometam sua saúde financeira.
              </p>
              <p className="disclaimer-text">
                <span className="bold-disclaimer">Aviso:</span> Esta ferramenta é um auxílio para seu planejamento financeiro e não
                substitui o aconselhamento de um profissional. As projeções são baseadas nos dados fornecidos
                e não garantem resultados futuros.
              </p>
            </div>

            {/* Seção de Ajustes Recomendados (se houver dados) */}
            {dadosPlano.ajustes && dadosPlano.ajustes.length > 0 && (
              <div className="planos-section">
                <h2>Ajustes Recomendados</h2>
                <p>
                  Estes são os valores e categorias onde você pode ajustar seus gastos para melhorar sua saúde financeira.
                  Ao reduzir esses gastos, você pode direcionar mais recursos para suas metas financeiras.
                </p>
                <div className="planos-content-grid">
                  <div className="chart-wrapper">
                    {/* Gráfico de Pizza para Ajustes Recomendados */}
                    <Chart
                      chartType="PieChart"
                      width="100%"
                      height="100%"
                      data={prepararDadosParaGrafico(dadosPlano.ajustes, "Valor Ajustado").data}
                      loader={<div>Carregando Gráfico...</div>}
                      options={{
                        title: "Distribuição dos Ajustes Recomendados",
                        pieHole: 0.4,
                        is3D: false,
                        legend: { position: "bottom", alignment: "center" },
                        tooltip: { isHtml: true, trigger: 'focus' }, // Tooltip HTML ativado
                        backgroundColor: 'transparent',
                        chartArea: { left: "5%", top: "10%", width: "90%", height: "70%" },
                        colors: prepararDadosParaGrafico(dadosPlano.ajustes, "Valor Ajustado").colors
                      }}
                      loaders={chartLoaders} // Aplica opções de loader globais
                    />
                  </div>
                  {/* Lista de detalhes dos ajustes */}
                  <div className="list-wrapper">
                    <h3>Detalhes dos Ajustes:</h3>
                    <ul>
                      {dadosPlano.ajustes.map((item, index) => (
                        <li key={index}>
                          <strong>{categoriaMapeada[item.categoria] || item.categoria}:</strong> {item.subcategoria} - {formatarValor(item.valor)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Seção de Áreas de Risco (se houver dados) */}
            {dadosPlano.riscos && dadosPlano.riscos.length > 0 && (
              <div className="planos-section">
                <h2>Áreas de Risco</h2>
                <p>
                  Estes gastos foram identificados como potencialmente altos. Recomendamos que
                  você os revise para encontrar oportunidades de economia e evitar desequilíbrios em suas finanças.
                </p>
                <div className="planos-content-grid">
                  <div className="chart-wrapper">
                    {/* Gráfico de Barras para Áreas de Risco */}
                    <Chart
                      chartType="BarChart"
                      width="100%"
                      height="100%"
                      data={prepararDadosParaGrafico(dadosPlano.riscos, "Valor Detectado").data}
                      loader={<div>Carregando Gráfico...</div>}
                      options={{
                        title: "Valores por Categoria de Risco",
                        legend: { position: "none" },
                        bars: "horizontal",
                        hAxis: { // Configuração do eixo horizontal
                          format: "currency", // Formato de moeda padrão da localização
                          gridlines: { count: 0 }, // Remove as linhas de grade para um visual mais limpo
                          textStyle: { color: '#555', fontName: 'Inter' }, // Estilo do texto
                          minValue: 0, // Garante que o eixo comece em 0
                          formatOptions: { // Opções de formatação específicas para o formato monetário
                            prefix: 'R$',
                            decimalPlaces: 2,
                            groupingSymbol: '.',
                            decimalSymbol: ',',
                          }
                        },
                        vAxis: { // Configuração do eixo vertical
                          textStyle: { fontSize: 12 } // Ajusta o tamanho da fonte do eixo Y
                        },
                        tooltip: { isHtml: true, trigger: 'focus' }, // Tooltip HTML ativado
                        backgroundColor: 'transparent',
                        chartArea: { left: "15%", top: "10%", width: "70%", height: "70%" },
                        colors: ['#dc3545'] // Cor das barras (vermelho para risco)
                      }}
                      loaders={chartLoaders} // Aplica opções de loader globais
                    />
                  </div>
                  {/* Lista de detalhes dos riscos */}
                  <div className="list-wrapper">
                    <h3>Detalhes dos Riscos:</h3>
                    <ul>
                      {dadosPlano.riscos.map((item, index) => (
                        <li key={index}>
                          <strong>{categoriaMapeada[item.categoria] || item.categoria}:</strong> {item.subcategoria} - {formatarValor(item.valor)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Mensagem se não houver ajustes ou riscos */}
            {!dadosPlano?.ajustes?.length && !dadosPlano?.riscos?.length && (
              <div className="planos-message no-data-found-message">
                <p>O plano foi gerado, mas não foram encontrados ajustes ou riscos para o seu perfil financeiro atual. Parece que suas finanças estão em ordem!</p>
              </div>
            )}

            {/* Exibe a data da última atualização do plano */}
            {dadosPlano.dataAlteracao && (
              <p className="data-alteracao">
                Última atualização do plano: {dadosPlano.dataAlteracao}
              </p>
            )}

            {/* Navegação entre planos (se houver múltiplos) */}
            {hasMultiplePlans && (
              <div className="plan-navigation-pills">
                <button
                  onClick={handleNextPlan}
                  disabled={currentPlanIndex === 0 || loading} // Desabilita se for o primeiro plano ou estiver carregando
                  className={`nav-pill-button ${currentPlanIndex === 0 ? 'disabled-pill' : ''}`}
                >
                  Anterior
                </button>
                <span className="plan-index-display">
                  Plano {currentPlanIndex + 1} de {todosOsPlanos.length}
                </span>
                <button
                  onClick={handlePreviousPlan}
                  disabled={currentPlanIndex === todosOsPlanos.length - 1 || loading} // Desabilita se for o último plano ou estiver carregando
                  className={`nav-pill-button ${currentPlanIndex === todosOsPlanos.length - 1 ? 'disabled-pill' : ''}`}
                >
                  Proximo
                </button>
              </div>
            )}
          </>
        )}

        {/* Mensagem inicial quando não há planos ou eles estão vazios */}
        {!loading && !error && !dadosPlano && (
          <div className="planos-message initial-message">
            <p>
              Você ainda não possui um plano financeiro salvo ou ele está vazio.
              <br />
              Clique em "Gerar Novo Plano" para analisar seus gastos e obter recomendações personalizadas.
            </p>
          </div>
        )}

        {/* Popup para entrada de valor de economia mensal */}
        <VEcononoPopup
          isOpen={showValueInputPopup}
          onClose={() => setShowValueInputPopup(false)}
          onSubmit={gerarNovoPlanoComValor}
          isLoading={loading}
        />
      </div>
    </Layout>
  );
};

export default Planos;