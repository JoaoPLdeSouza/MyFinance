// src/pages/Home.js
// Importa as dependências necessárias do React e bibliotecas externas.
import React, { useEffect, useState } from "react"; // useState para gerenciar o estado, useEffect para efeitos colaterais (como buscar dados).
import Layout from "../components/Layout"; // Componente de layout que estrutura a página.
import "../assets/Home.css";
import { Chart } from "react-google-charts"; // Componente para renderizar gráficos do Google Charts.
import authService from "../services/authService";

// Componente funcional principal da página Home.
const Home = () => {
  // --- Estados do Componente ---
  // useState para armazenar a renda do usuário. Inicializa com 0.
  const [renda, setRenda] = useState(0);
  // useState para armazenar a lista completa de lançamentos (gastos/receitas). Inicializa com array vazio.
  const [gastos, setGastos] = useState([]);
  // useState para armazenar o total de gastos (excluindo investimentos). Inicializa com 0.
  const [totalGasto, setTotalGasto] = useState(0);
  // useState para armazenar o total investido. Inicializa com 0.
  const [totalInvestimento, setTotalInvestimento] = useState(0);
  // useState para controlar qual gráfico está ativo (visível). Inicializa com 'geral'.
  const [activeChart, setActiveChart] = useState('geral'); // Valores possíveis: 'geral', 'necessidades', 'desejos', 'investimentos'

  // --- Efeito Colateral (useEffect) ---
  // Executado uma vez após a montagem inicial do componente, e sempre que as dependências mudarem (array vazio = apenas uma vez).
  useEffect(() => {
    // Busca os dados do usuário logado no localStorage.
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    // Verifica se o ID do usuário existe antes de fazer chamadas à API.
    if (usuario?.id) {
      // Busca os dados do usuário pelo ID para obter a renda.
      authService.getUserById(usuario.id)
        .then(res => setRenda(res.data.renda || 0)) // Atualiza o estado 'renda'. Se não houver, assume 0.
        .catch(err => console.error("Erro ao buscar usuário:", err)); // Loga erros.

      // Busca todos os lançamentos financeiros do usuário.
      // O segundo argumento '{}' é passado para que 'dataInicio' e 'dataFinal' sejam strings vazias por padrão no serviço, buscando todos.
      authService.buscarLancamentosPorUsuario(usuario.id, {})
        .then(res => { // 'res' é o objeto de resposta do Axios.
          const todos = res.data; // Extrai a lista de lançamentos de 'res.data'.
          setGastos(todos); // Atualiza o estado 'gastos' com todos os lançamentos.

          // Calcula o total de gastos, filtrando o que NÃO é 'INVESTIMENTO_E_POUPANCA'.
          const totalGastoCalculado = todos
            .filter(g => g.categoria !== "INVESTIMENTO_E_POUPANCA")
            .reduce((acc, g) => acc + g.valor, 0); // Soma os valores.

          // Calcula o total de investimentos, filtrando apenas 'INVESTIMENTO_E_POUPANCA'.
          const totalInvestCalculado = todos
            .filter(g => g.categoria === "INVESTIMENTO_E_POUPANCA")
            .reduce((acc, g) => acc + g.valor, 0); // Soma os valores.

          setTotalGasto(totalGastoCalculado); // Atualiza o estado 'totalGasto'.
          setTotalInvestimento(totalInvestCalculado); // Atualiza o estado 'totalInvestimento'.
        })
        .catch(err => {
          console.error("Erro ao buscar lançamentos:", err); // Loga erros.
          // Em caso de erro, reinicia os estados para valores padrão.
          setGastos([]);
          setTotalGasto(0);
          setTotalInvestimento(0);
        });
    }
  }, []); // Array de dependências vazio significa que este efeito só roda uma vez, ao montar o componente.

  // --- Dados e Lógica para Gráficos ---

  // Objeto para mapear categorias a cores específicas nos gráficos.
  const categoryColors = {
    "investimento e poupanca": "#28a745", // Verde para investimento.
    "necessidades": "#007bff",           // Azul para necessidades.
    "desejos": "#dc3545",                 // Vermelho para desejos.
  };

  // Processa os dados de gastos para o Gráfico de Pizza (Visão Geral).
  // Agrupa os gastos por categoria e soma seus valores.
  const dadosGraficoBrutos = gastos.reduce((acc, item) => {
    // Formata o nome da categoria para exibição (ex: "INVESTIMENTO_E_POUPANCA" -> "investimento e poupanca").
    const nome = item.categoria
      .replace("_E_", " e ")
      .replace(/_/g, " ")
      .toLowerCase();
    // Procura se a categoria já existe no acumulador.
    const existente = acc.find(i => i[0] === nome);
    if (existente) {
      existente[1] += item.valor; // Se existe, adiciona o valor.
    } else {
      acc.push([nome, item.valor]); // Se não existe, adiciona uma nova entrada.
    }
    return acc;
  }, []); // Inicia o acumulador como um array vazio.

  // Prepara os dados para o Gráfico de Pizza, incluindo formatação para o tooltip.
  // O Google Charts pode receber um objeto {v: valor, f: valor_formatado} para o tooltip.
  const dadosGrafico = [
    ["Categoria", "Valor"], // Cabeçalho do gráfico.
    ...(dadosGraficoBrutos.length > 0 // Se houver dados...
      ? dadosGraficoBrutos.map(item => [
          item[0], // Nome da categoria.
          // Objeto com valor numérico (v) e string formatada (f) para exibição no tooltip.
          { v: item[1], f: item[1].toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) }
        ])
      : [["Nenhuma Categoria", { v: 0, f: "R$ 0,00" }]]) // Caso não haja dados, exibe "Nenhuma Categoria".
  ];

  // Função auxiliar para agrupar lançamentos por subcategoria dentro de uma categoria específica.
  // Usado para os gráficos de barras (Necessidades, Desejos, Investimentos).
  const agruparSubcategorias = (lista, categoria) => {
    // Filtra os lançamentos pela categoria desejada.
    const filtrado = lista.filter(g => g.categoria === categoria);

    // Objeto para acumular os valores por subcategoria.
    const agrupado = {};
    filtrado.forEach(g => {
      agrupado[g.subcategoria] = (agrupado[g.subcategoria] || 0) + g.valor;
    });

    // Mapeia o objeto agrupado para o formato de dados do Google Charts.
    const resultados = Object.entries(agrupado).map(([nome, valor]) => {
      // Calcula o total da categoria para o cálculo percentual (usado na anotação).
      const total = filtrado.reduce((acc, g) => acc + Math.abs(g.valor), 0);
      return [
        nome, // Nome da subcategoria.
        // Objeto com valor numérico (v) e string formatada (f) para exibição no tooltip.
        { v: valor, f: valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) },
        // Anotação percentual.
        total > 0 ? `${((Math.abs(valor) / total) * 100).toFixed(1)}%` : '0%'
      ];
    });

    // Se não houver dados para a categoria, retorna um placeholder.
    if (resultados.length === 0) {
      return [["Sem dados", { v: 0, f: "R$ 0,00" }, "0%"]]; // Inclui formatação para "Sem dados"
    }
    return resultados;
  };

  // --- Componente de Botões de Navegação ---
  // Componente funcional separado para os botões de troca de gráfico, para melhor organização.
  const ChartNavigationButtons = ({ activeChart, setActiveChart }) => (
    <div className="chart-navigation-buttons">
      {/* Botão "Visão Geral" */}
      <button
        className={`nav-button ${activeChart === 'geral' ? 'active' : ''}`} // Adiciona classe 'active' se for o gráfico atual.
        onClick={() => setActiveChart('geral')} // Atualiza o estado 'activeChart' ao clicar.
      >
        Visão Geral
      </button>
      {/* Botão "Necessidades" */}
      <button
        className={`nav-button ${activeChart === 'necessidades' ? 'active' : ''}`}
        onClick={() => setActiveChart('necessidades')}
      >
        Necessidades
      </button>
      {/* Botão "Desejos" */}
      <button
        className={`nav-button ${activeChart === 'desejos' ? 'active' : ''}`}
        onClick={() => setActiveChart('desejos')}
      >
        Desejos
      </button>
      {/* Botão "Investimentos" */}
      <button
        className={`nav-button ${activeChart === 'investimentos' ? 'active' : ''}`}
        onClick={() => setActiveChart('investimentos')}
      >
        Investimentos
      </button>
    </div>
  );

  // --- Renderização do Componente ---
  return (
    // Usa o componente Layout para manter a estrutura padrão da página.
    <Layout>
      <div className="home-container">
        <h1 className="home-header">Relatórios Financeiros</h1>

        {/* Cartões de estatísticas principais */}
        <div className="top-cards">
          {/* Cartão de Rendimento Total */}
          <div className="stat-card">
            <span className="card-label">Rendimento Total</span>
            <span className="card-value">
              {/* Formata a renda para moeda brasileira */}
              {renda.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </div>
          {/* Cartão de Gastos Totais */}
          <div className="stat-card">
            <span className="card-label">Gastos Totais</span>
            <span className="card-value">
              {/* Formata os gastos para moeda brasileira */}
              {totalGasto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </div>
          {/* Cartão de Valor Investido */}
          <div className="stat-card">
            <span className="card-label">Valor Investido</span>
            <span className="card-value">
              {/* Formata o investimento para moeda brasileira */}
              {totalInvestimento.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </div>
        </div>

        {/* Contêiner para os gráficos, agora com apenas um chart-card visível por vez */}
        <div className="dashboard-grid">
          {/* Renderiza o Gráfico de Pizza (Visão Geral) se 'activeChart' for 'geral' */}
          {activeChart === 'geral' && (
            <div className="chart-card full-width">
              {/* Botões de navegação, posicionados DENTRO do card do gráfico */}
              <ChartNavigationButtons activeChart={activeChart} setActiveChart={setActiveChart} />
              <h2 className="chart-title">Distribuição de Gastos por Categoria</h2>
              <p className="chart-description">Entenda para onde seu dinheiro está indo, dividido em necessidades, desejos e investimentos.</p>
              {/* Wrapper para garantir que o gráfico preencha o espaço disponível */}
              <div className="chart-container-wrapper">
                <Chart
                  chartType="PieChart"
                  width="100%"
                  height="100%"
                  data={dadosGrafico} // Dados já formatados para o tooltip.
                  options={{
                    pieHole: 0.4, // Cria o efeito de "donut".
                    colors: dadosGrafico.slice(1).map(item => categoryColors[item[0]] || '#CCCCCC'), // Aplica cores por categoria.
                    legend: { position: "bottom", textStyle: { color: '#555', fontName: 'Inter', fontSize: 13 } }, // Posição e estilo da legenda.
                    chartArea: { left: 15, top: 15, right: 15, bottom: 50, width: '90%', height: '80%' }, // Ajusta a área do gráfico.
                    fontName: 'Inter, sans-serif', // Fonte global do gráfico.
                    titleTextStyle: { fontSize: 0 }, // Título do gráfico (definido externamente).
                    tooltip: {
                      textStyle: { fontName: 'Inter', fontSize: 13 },
                      trigger: 'focus' // Exibe tooltip ao focar/clicar, melhor para telas touch.
                    },
                    // Ajuste para exibir uma cor cinza se não houver dados, para "Nenhuma Categoria".
                    slices: dadosGrafico.length === 2 && dadosGrafico[1][0] === "Nenhuma Categoria" ? {
                        0: { color: '#CCCCCC' }
                    } : {}
                  }}
                />
              </div>
            </div>
          )}

          {/* Renderiza o Gráfico de Barras de Necessidades se 'activeChart' for 'necessidades' */}
          {activeChart === 'necessidades' && (
            <div className="chart-card full-width">
              <ChartNavigationButtons activeChart={activeChart} setActiveChart={setActiveChart} />
              <h2 className="chart-title">Necessidades: Onde seu dinheiro é essencial</h2>
              <p className="chart-description">Detalhes dos seus gastos fixos e indispensáveis.</p>
              <div className="chart-container-wrapper">
                <Chart
                  chartType="BarChart"
                  width="100%"
                  height="100%"
                  data={[
                    ["Subcategoria", "Valor", { role: "annotation" }], // Cabeçalho com coluna para anotações.
                    ...agruparSubcategorias(gastos, "NECESSIDADES") // Dados agrupados por subcategoria.
                  ]}
                  options={{
                    title: "", // Título definido externamente.
                    legend: { position: "none" }, // Sem legenda.
                    bars: "horizontal", // Barras horizontais.
                    hAxis: { // Eixo horizontal (valores).
                      format: "currency", // Formata como moeda.
                      textStyle: { color: '#555', fontName: 'Inter' },
                      minValue: 0,
                      // Opções de formatação para moeda brasileira (R$ X.XXX,XX).
                      formatOptions: {
                        prefix: 'R$',
                        decimalPlaces: 2,
                        groupingSymbol: '.', // Ponto como separador de milhares.
                        decimalSymbol: ',', // Vírgula como separador decimal.
                      }
                    },
                    vAxis: { textStyle: { color: '#555', fontName: 'Inter' } }, // Eixo vertical (subcategorias).
                    colors: ["#007bff"], // Cor das barras.
                    chartArea: { left: 100, top: 30, right: 30, bottom: 30 }, // Ajusta a área do gráfico.
                    fontName: 'Inter, sans-serif',
                    titleTextStyle: { fontSize: 0 },
                    tooltip: { textStyle: { fontName: 'Inter', fontSize: 13 } },
                    annotations: { // Configurações para as anotações (percentuais nas barras).
                      alwaysOutside: true,
                      textStyle: {
                        fontSize: 12,
                        color: '#000',
                        fontName: 'Inter',
                        auraColor: 'none'
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Renderiza o Gráfico de Barras de Desejos se 'activeChart' for 'desejos' */}
          {activeChart === 'desejos' && (
            <div className="chart-card full-width">
              <ChartNavigationButtons activeChart={activeChart} setActiveChart={setActiveChart} />
              <h2 className="chart-title">Desejos: Gastos para o seu lazer e prazer</h2>
              <p className="chart-description">Visão detalhada dos seus gastos não essenciais e de lazer.</p>
              <div className="chart-container-wrapper">
                <Chart
                  chartType="BarChart"
                  width="100%"
                  height="100%"
                  data={[
                    ["Subcategoria", "Valor", { role: "annotation" }],
                    ...agruparSubcategorias(gastos, "DESEJOS")
                  ]}
                  options={{
                    title: "",
                    legend: { position: "none" },
                    bars: "horizontal",
                    hAxis: {
                      format: "currency",
                      textStyle: { color: '#555', fontName: 'Inter' },
                      minValue: 0,
                      formatOptions: {
                        prefix: 'R$',
                        decimalPlaces: 2,
                        groupingSymbol: '.',
                        decimalSymbol: ',',
                      }
                    },
                    vAxis: { textStyle: { color: '#555', fontName: 'Inter' } },
                    colors: ["#dc3545"],
                    chartArea: { left: 100, top: 30, right: 30, bottom: 30 },
                    fontName: 'Inter, sans-serif',
                    titleTextStyle: { fontSize: 0 },
                    tooltip: { textStyle: { fontName: 'Inter', fontSize: 13 } },
                    annotations: {
                      alwaysOutside: true,
                      textStyle: {
                        fontSize: 12,
                        color: '#000',
                        fontName: 'Inter',
                        auraColor: 'none'
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Renderiza o Gráfico de Barras de Investimentos se 'activeChart' for 'investimentos' */}
          {activeChart === 'investimentos' && (
            <div className="chart-card full-width">
              <ChartNavigationButtons activeChart={activeChart} setActiveChart={setActiveChart} />
              <h2 className="chart-title">Investimentos/Poupança: Construindo seu futuro</h2>
              <p className="chart-description">Acompanhe seu progresso em direção aos seus objetivos financeiros.</p>
              <div className="chart-container-wrapper">
                <Chart
                  chartType="BarChart"
                  width="100%"
                  height="100%"
                  data={[
                    ["Subcategoria", "Valor", { role: "annotation" }],
                    ...agruparSubcategorias(gastos, "INVESTIMENTO_E_POUPANCA")
                  ]}
                  options={{
                    title: "",
                    legend: { position: "none" },
                    bars: "horizontal",
                    hAxis: {
                      format: "currency",
                      textStyle: { color: '#555', fontName: 'Inter' },
                      minValue: 0,
                      formatOptions: {
                        prefix: 'R$',
                        decimalPlaces: 2,
                        groupingSymbol: '.',
                        decimalSymbol: ',',
                      }
                    },
                    vAxis: { textStyle: { color: '#555', fontName: 'Inter' } },
                    colors: ["#28a745"],
                    chartArea: { left: 100, top: 30, right: 30, bottom: 30 },
                    fontName: 'Inter, sans-serif',
                    titleTextStyle: { fontSize: 0 },
                    tooltip: { textStyle: { fontName: 'Inter', fontSize: 13 } },
                    annotations: {
                      alwaysOutside: true,
                      textStyle: {
                        fontSize: 12,
                        color: '#000',
                        fontName: 'Inter',
                        auraColor: 'none'
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Home; // Exporta o componente Home para ser usado em outras partes da aplicação.