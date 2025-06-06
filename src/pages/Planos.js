import React, { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import { Chart } from "react-google-charts";
import authService from "../services/authService";
import "../assets/Planos.css";
import VEcononoPopup from "../components/VEcononoPopup";

const Planos = () => {
  const [dadosPlano, setDadosPlano] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showValueInputPopup, setShowValueInputPopup] = useState(false);
  const [todosOsPlanos, setTodosOsPlanos] = useState([]);
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0);

  const categoriaCores = {
    NECESSIDADES: '#007bff',        // Azul
    DESEJOS: '#dc3545',             // Vermelho
    INVESTIMENTO_E_POUPANCA: '#28a745', // Verde
    ECONOMIA_PLANEJADA: '#8A2BE2'    // Roxo
  };

  const formatarValor = (valor) => {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const categoriaMapeada = {
    NECESSIDADES: "Necessidades",
    DESEJOS: "Desejos",
    INVESTIMENTO_E_POUPANCA: "Investimento/Poupança",
    ECONOMIA_PLANEJADA: "Economia Planejada"
  };

  const prepararDadosParaGrafico = (dataArray, titulo) => {
    const categoriasAgrupadas = dataArray.reduce((acc, item) => {
      acc[item.categoria] = (acc[item.categoria] || 0) + item.valor;
      return acc;
    }, {});

    const dados = [["Categoria", titulo]];
    const coresOrdenadas = [];
    const seriesOptions = {};

    const orderedCategories = Object.keys(categoriaCores);
    let seriesIndex = 0;

    orderedCategories.forEach(categoriaKey => {
      if (categoriasAgrupadas.hasOwnProperty(categoriaKey)) {
        dados.push([categoriaMapeada[categoriaKey], categoriasAgrupadas[categoriaKey]]);
        coresOrdenadas.push(categoriaCores[categoriaKey]);
        seriesOptions[seriesIndex] = { color: categoriaCores[categoriaKey] };
        seriesIndex++;
      }
    });

    for (const categoriaKey in categoriasAgrupadas) {
      if (!orderedCategories.includes(categoriaKey)) {
        dados.push([categoriaMapeada[categoriaKey] || categoriaKey, categoriasAgrupadas[categoriaKey]]);
        coresOrdenadas.push('#cccccc');
        seriesOptions[seriesIndex] = { color: '#cccccc' };
        seriesIndex++;
      }
    }
    
    return { data: dados, colors: coresOrdenadas, series: seriesOptions };
  };

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
        const planosDoUsuario = response.data
          .filter((plano) => plano.idUsuario === usuario.id)
          .sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));

        const ultimos3Planos = planosDoUsuario.slice(0, 3);
        setTodosOsPlanos(ultimos3Planos);

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
  }, []);

  const gerarNovoPlano = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      if (!usuario || !usuario.id) {
        throw new Error("ID do usuário não encontrado. Faça login novamente.");
      }

      const response = await authService.gerarPlano(usuario.id);

      if (response.data && response.data.id) {
        carregarPlanosDoUsuario();
      } else {
        setError("O plano foi gerado, mas não pudemos exibi-lo. Tente recarregar a página.");
      }
    } catch (err) {
      console.error("Erro ao gerar novo plano padrão:", err);
      let errorMessage = "Não foi possível gerar um novo plano financeiro. Tente novamente.";
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
  }, [carregarPlanosDoUsuario]);

  const gerarNovoPlanoComValor = useCallback(async (valor) => {
    setLoading(true);
    setError(null);
    setShowValueInputPopup(false);
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      if (!usuario || !usuario.id) {
        throw new Error("ID do usuário não encontrado. Faça login novamente.");
      }

      const response = await authService.gerarPlano(usuario.id, valor);

      if (response.data && response.data.id) {
        carregarPlanosDoUsuario();
      } else {
        setError("O plano foi gerado, mas não pudemos exibi-lo. Tente recarregar a página.");
      }
    } catch (err) {
      console.error("Erro ao gerar novo plano com valor:", err);
      let errorMessage = "Ocorreu um erro ao gerar o plano com valor. Tente novamente.";
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
  }, [carregarPlanosDoUsuario]);

  const handlePreviousPlan = () => {
    const newIndex = currentPlanIndex + 1;
    if (newIndex < todosOsPlanos.length) {
      setCurrentPlanIndex(newIndex);
      setDadosPlano(todosOsPlanos[newIndex]);
    }
  };

  const handleNextPlan = () => {
    const newIndex = currentPlanIndex - 1;
    if (newIndex >= 0) {
      setCurrentPlanIndex(newIndex);
      setDadosPlano(todosOsPlanos[newIndex]);
    }
  };

  useEffect(() => {
    carregarPlanosDoUsuario();
  }, [carregarPlanosDoUsuario]);

  const hasMultiplePlans = todosOsPlanos.length > 1;

  return (
    <Layout>
      <div className="planos-container">
        <h1 className="planos-header">Seu Plano Financeiro</h1>
        <p className="planos-description">
          Aqui você pode visualizar seu plano financeiro atual. Ele é gerado com base nos seus lançamentos
          e oferece recomendações de ajustes e identifica áreas de risco em suas despesas.
        </p>

        <div className="planos-actions-group">
          <div className="plan-action-card">
            <p className="action-description">
              Gere um plano com base nos seus gastos atuais para identificar áreas de risco e oportunidades de ajuste,
              ajudando você a sair do vermelho e melhorar sua saúde financeira geral.
            </p>
            <button
              className="gerar-plano-button"
              onClick={gerarNovoPlano}
              disabled={loading}
            >
              {loading ? "Gerando Plano..." : "Gerar Plano Padrão"}
            </button>
          </div>

          <div className="plan-action-card">
            <p className="action-description">
              Quer planejar sua economia mensal? Clique no botão abaixo e informe
              o valor que você deseja economizar por mês. A ferramenta irá te ajudar a visualizar
              como alcançar essa meta!
            </p>
            <button
              className="gerar-plano-button"
              onClick={() => setShowValueInputPopup(true)}
              disabled={loading}
            >
              Gerar Plano com Valor de Economia Mensal
            </button>
          </div>
        </div>

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

        {!loading && !error && dadosPlano && (
          <>
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

            {dadosPlano.ajustes && dadosPlano.ajustes.length > 0 && (
              <div className="planos-section">
                <h2>Ajustes Recomendados</h2>
                <p>
                  Estes são os valores e categorias onde você pode ajustar seus gastos para melhorar sua saúde financeira.
                  Ao reduzir esses gastos, você pode direcionar mais recursos para suas metas financeiras.
                </p>
                <div className="planos-content-grid">
                  <div className="chart-wrapper">
                    <Chart
                      chartType="PieChart"
                      width="100%"
                      height="100%"
                      data={prepararDadosParaGrafico(dadosPlano.ajustes, "Valor Ajustado").data}
                      options={{
                        title: "Distribuição dos Ajustes Recomendados",
                        pieHole: 0.4,
                        is3D: false,
                        legend: { position: "bottom", alignment: "center" },
                        tooltip: { trigger: 'focus' },
                        backgroundColor: 'transparent',
                        chartArea: { left: "5%", top: "10%", width: "90%", height: "70%" },
                        colors: prepararDadosParaGrafico(dadosPlano.ajustes, "Valor Ajustado").colors
                      }}
                    />
                  </div>
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

            {dadosPlano.riscos && dadosPlano.riscos.length > 0 && (
              <div className="planos-section">
                <h2>Áreas de Risco</h2>
                <p>
                  Estes gastos foram identificados como potencialmente altos. Recomendamos que
                  você os revise para encontrar oportunidades de economia e evitar desequilíbrios em suas finanças.
                </p>
                <div className="planos-content-grid">
                  <div className="chart-wrapper">
                    <Chart
                      chartType="BarChart"
                      width="100%"
                      height="100%"
                      data={prepararDadosParaGrafico(dadosPlano.riscos, "Valor Detectado").data}
                      options={{
                        title: "Valores por Categoria de Risco",
                        legend: { position: "none" },
                        bars: "horizontal",
                        hAxis: { format: "currency" },
                        tooltip: { trigger: 'focus' },
                        backgroundColor: 'transparent',
                        chartArea: { left: "15%", top: "10%", width: "70%", height: "70%" },
                        // ******* MUDANÇA AQUI: FORÇANDO A COR PARA VERMELHO *******
                        colors: ['#dc3545'] // Usa apenas o vermelho
                      }}
                    />
                  </div>
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

            {!dadosPlano?.ajustes?.length && !dadosPlano?.riscos?.length && (
              <div className="planos-message no-data-found-message">
                <p>O plano foi gerado, mas não foram encontrados ajustes ou riscos para o seu perfil financeiro atual. Parece que suas finanças estão em ordem!</p>
              </div>
            )}

            {dadosPlano.dataAlteracao && (
              <p className="data-alteracao">
                Última atualização do plano: {dadosPlano.dataAlteracao}
              </p>
            )}

            {hasMultiplePlans && (
              <div className="plan-navigation-pills">
                <button
                  onClick={handlePreviousPlan}
                  disabled={currentPlanIndex === todosOsPlanos.length - 1 || loading}
                  className={`nav-pill-button ${currentPlanIndex === todosOsPlanos.length - 1 ? 'disabled-pill' : ''}`}
                >
                  Plano Anterior
                </button>
                <span className="plan-index-display">
                  Plano {todosOsPlanos.length - currentPlanIndex} de {todosOsPlanos.length}
                </span>
                <button
                  onClick={handleNextPlan}
                  disabled={currentPlanIndex === 0 || loading}
                  className={`nav-pill-button ${currentPlanIndex === 0 ? 'disabled-pill' : ''}`}
                >
                  Próximo Plano
                </button>
              </div>
            )}
          </>
        )}

        {!loading && !error && !dadosPlano && (
          <div className="planos-message initial-message">
            <p>
              Você ainda não possui um plano financeiro salvo ou ele está vazio.
              <br />
              Clique em "Gerar Novo Plano" para analisar seus gastos e obter recomendações personalizadas.
            </p>
          </div>
        )}

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