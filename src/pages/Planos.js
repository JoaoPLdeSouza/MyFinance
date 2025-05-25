import React, { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import { Chart } from "react-google-charts";
import authService from "../services/authService";
import "../assets/Planos.css";

const Planos = () => {
  const [dadosPlano, setDadosPlano] = useState(null);
  const [loading, setLoading] = useState(true); // Começa como true para carregar o plano existente na montagem
  const [error, setError] = useState(null);

  const formatarValor = (valor) => {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const categoriaMapeada = {
    NECESSIDADES: "Necessidades",
    DESEJOS: "Desejos",
    INVESTIMENTO_E_POUPANCA: "Investimento/Poupança"
  };

  const prepararDadosParaGrafico = (dataArray, titulo) => {
    const categoriasAgrupadas = dataArray.reduce((acc, item) => {
      acc[item.categoria] = (acc[item.categoria] || 0) + item.valor;
      return acc;
    }, {});

    const dados = [["Categoria", titulo]];
    for (const categoria in categoriasAgrupadas) {
      dados.push([categoriaMapeada[categoria] || categoria, categoriasAgrupadas[categoria]]);
    }
    return dados;
  };

  // Função para carregar o plano mais recente do usuário específico
  const carregarPlanoMaisRecente = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      if (!usuario || !usuario.id) {
        throw new Error("ID do usuário não encontrado. Faça login novamente.");
      }

      // Chama a função que busca a lista de planos para o idUsuario
      // O backend deve retornar uma LISTA de planos onde cada plano tem um idUsuario
      const response = await authService.buscarPlanosPorUsuario(usuario.id); //

      // Verifica se a resposta é um array e se não está vazio
      if (Array.isArray(response.data) && response.data.length > 0) {
        // Filtra os planos que realmente pertencem ao usuário logado
        const planosDoUsuario = response.data.filter(
          (plano) => plano.idUsuario === usuario.id
        );

        if (planosDoUsuario.length > 0) {
          // Encontra o plano com o maior ID entre os planos DO USUÁRIO
          const planoMaisRecente = planosDoUsuario.reduce((prev, current) =>
            (prev.id > current.id) ? prev : current
          );

          // Verifica se o plano mais recente tem ID e conteúdo relevante
          if (planoMaisRecente.id &&
              (planoMaisRecente.ajustes?.length > 0 || planoMaisRecente.riscos?.length > 0)) {
            setDadosPlano(planoMaisRecente);
          } else {
            setDadosPlano(null); // Plano mais recente encontrado, mas sem conteúdo significativo
          }
        } else {
          setDadosPlano(null); // Nenhuma plano encontrado para este usuário específico
        }
      } else {
        setDadosPlano(null); // Nenhuma lista de planos ou lista vazia
      }
    } catch (err) {
      console.error("Erro ao carregar o plano mais recente:", err);
      if (err.response && err.response.status === 404) {
        setDadosPlano(null); // Nenhum plano encontrado para o usuário
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(`Erro ao carregar plano: ${err.response.data.message}`);
      } else {
        setError("Não foi possível carregar o plano financeiro. Verifique sua conexão.");
      }
      setDadosPlano(null); // Limpa dados antigos em caso de erro
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para gerar um NOVO plano (POST /plano)
  const gerarNovoPlano = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      if (!usuario || !usuario.id) {
        throw new Error("ID do usuário não encontrado. Faça login novamente.");
      }

      // Chama a função para gerar um novo plano.
      // Assume-se que o backend irá persistir este plano e ele poderá ser recuperado
      // pelo GET /plano/usuario
      const response = await authService.gerarPlano(usuario.id); //
      
      // Após gerar um novo plano, re-carrega o plano mais recente para garantir que o recém-gerado seja exibido
      // Isso é importante porque o ID global pode ter incrementado e o novo plano é o mais recente para este usuário
      if (response.data && response.data.id) { // Assume que o POST retorna o ID do novo plano
        carregarPlanoMaisRecente(); // Recarrega o plano mais recente para o usuário
      } else {
        setDadosPlano(null); // Se o POST não retornou um plano válido
        setError("O plano foi gerado, mas não pudemos exibi-lo. Tente recarregar a página.");
      }
    } catch (err) {
      console.error("Erro ao gerar novo plano:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(`Erro ao gerar plano: ${err.response.data.message}`);
      } else {
        setError("Não foi possível gerar um novo plano financeiro. Verifique sua conexão ou tente novamente.");
      }
      setDadosPlano(null); // Limpa dados em caso de erro na geração
    } finally {
      setLoading(false);
    }
  }, [carregarPlanoMaisRecente]); // Dependência adicionada

  // Efeito para carregar o plano mais recente ao montar a página
  useEffect(() => {
    carregarPlanoMaisRecente();
  }, [carregarPlanoMaisRecente]);


  return (
    <Layout>
      <div className="planos-container">
        <h1 className="planos-header">Seu Plano Financeiro</h1>
        <p className="planos-description">
          Aqui você pode visualizar seu plano financeiro atual. Ele é gerado com base nos seus lançamentos
          e oferece recomendações de ajustes e identifica áreas de risco em suas despesas.
        </p>

        <div className="planos-actions">
          <button
            className="gerar-plano-button"
            onClick={gerarNovoPlano} // Chama a função para gerar novo plano
            disabled={loading} // Desabilita o botão enquanto carrega
          >
            {loading ? "Gerando Plano..." : "Gerar Novo Plano"}
          </button>
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

        {/* Exibe o plano se ele existir e não estiver carregando/houver erro */}
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
                      data={prepararDadosParaGrafico(dadosPlano.ajustes, "Valor Ajustado")}
                      options={{
                        title: "Distribuição dos Ajustes Recomendados",
                        pieHole: 0.4,
                        is3D: false,
                        legend: { position: "bottom", alignment: "center" },
                        colors: ['#28a745', '#007bff', '#ffc107', '#6f42c1', '#17a2b8'],
                        tooltip: { trigger: 'focus' },
                        backgroundColor: 'transparent'
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
                      data={prepararDadosParaGrafico(dadosPlano.riscos, "Valor Detectado")}
                      options={{
                        title: "Valores por Categoria de Risco",
                        legend: { position: "none" },
                        bars: "horizontal",
                        hAxis: { format: "currency" },
                        colors: ['#dc3545'], // Cores para riscos
                        tooltip: { trigger: 'focus' },
                        backgroundColor: 'transparent'
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

            {/* Mensagem quando o plano existe, mas não tem ajustes ou riscos */}
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
          </>
        )}

        {/* Mensagem quando não há plano para exibir (nem carregando, nem erro) */}
        {!loading && !error && !dadosPlano && (
          <div className="planos-message initial-message">
            <p>
              Você ainda não possui um plano financeiro salvo ou ele está vazio.
              <br />
              Clique em "Gerar Novo Plano" para analisar seus gastos e obter recomendações personalizadas.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Planos;