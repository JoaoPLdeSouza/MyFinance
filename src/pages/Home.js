// src/pages/Home.js
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import "../assets/Home.css"; // Certifique-se que o CSS está linkado
import { Chart } from "react-google-charts";
import authService from "../services/authService";

const Home = () => {
  const [renda, setRenda] = useState(0);
  const [gastos, setGastos] = useState([]);
  const [totalGasto, setTotalGasto] = useState(0);
  const [totalInvestimento, setTotalInvestimento] = useState(0);
  const [activeChart, setActiveChart] = useState('geral'); // 'geral', 'necessidades', 'desejos', 'investimentos'

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (usuario?.id) {
      authService.getUserById(usuario.id)
        .then(res => setRenda(res.data.renda || 0))
        .catch(err => console.error("Erro ao buscar usuário:", err));

      authService.buscarLancamentosPorUsuario(usuario.id)
        .then(res => {
          const todos = res.data;
          setGastos(todos);

          const totalGasto = todos
            .filter(g => g.categoria !== "INVESTIMENTO_E_POUPANCA")
            .reduce((acc, g) => acc + g.valor, 0);

          const totalInvest = todos
            .filter(g => g.categoria === "INVESTIMENTO_E_POUPANCA")
            .reduce((acc, g) => acc + g.valor, 0);

          setTotalGasto(totalGasto);
          setTotalInvestimento(totalInvest);
        })
        .catch(err => {
          console.error("Erro ao buscar lançamentos:", err);
          setGastos([]);
          setTotalGasto(0);
          setTotalInvestimento(0);
        });
    }
  }, []);

  const categoryColors = {
    "investimento e poupanca": "#28a745", // Verde
    "necessidades": "#007bff",           // Azul
    "desejos": "#dc3545",                 // Vermelho
  };

  const dadosGraficoBrutos = gastos.reduce((acc, item) => {
    const nome = item.categoria
      .replace("_E_", " e ")
      .replace(/_/g, " ")
      .toLowerCase();
    const existente = acc.find(i => i[0] === nome);
    if (existente) {
      existente[1] += item.valor;
    } else {
      acc.push([nome, item.valor]);
    }
    return acc;
  }, []);

  const dadosGrafico = [
    ["Categoria", "Valor"],
    ...(dadosGraficoBrutos.length > 0 ? dadosGraficoBrutos : [["Nenhuma Categoria", 0]])
  ];

  const agruparSubcategorias = (lista, categoria) => {
    const filtrado = lista.filter(g => g.categoria === categoria);

    const agrupado = {};
    filtrado.forEach(g => {
      agrupado[g.subcategoria] = (agrupado[g.subcategoria] || 0) + g.valor;
    });

    const resultados = Object.entries(agrupado).map(([nome, valor]) => {
        const total = filtrado.reduce((acc, g) => acc + Math.abs(g.valor), 0);
        return [
            nome,
            valor,
            total > 0 ? `${((Math.abs(valor) / total) * 100).toFixed(1)}%` : '0%'
        ];
    });

    if (resultados.length === 0) {
        return [["Sem dados", 0, "0%"]];
    }
    return resultados;
  };

  // Componente de Botões de Navegação (para ser reutilizado)
  const ChartNavigationButtons = ({ activeChart, setActiveChart }) => (
    <div className="chart-navigation-buttons">
      <button
        className={`nav-button ${activeChart === 'geral' ? 'active' : ''}`}
        onClick={() => setActiveChart('geral')}
      >
        Visão Geral
      </button>
      <button
        className={`nav-button ${activeChart === 'necessidades' ? 'active' : ''}`}
        onClick={() => setActiveChart('necessidades')}
      >
        Necessidades
      </button>
      <button
        className={`nav-button ${activeChart === 'desejos' ? 'active' : ''}`}
        onClick={() => setActiveChart('desejos')}
      >
        Desejos
      </button>
      <button
        className={`nav-button ${activeChart === 'investimentos' ? 'active' : ''}`}
        onClick={() => setActiveChart('investimentos')}
      >
        Investimentos
      </button>
    </div>
  );

  return (
    <Layout>
      <div className="home-container">
        <h1 className="home-header">Relatórios Financeiros</h1>

        <div className="top-cards">
          <div className="stat-card">
            <span className="card-label">Rendimento Total</span>
            <span className="card-value">
              {renda.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </div>
          <div className="stat-card">
            <span className="card-label">Gastos Totais</span>
            <span className="card-value">
              {totalGasto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </div>
          <div className="stat-card">
            <span className="card-label">Valor Investido</span>
            <span className="card-value">
              {totalInvestimento.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </div>
        </div>

        {/* O dashboard-grid agora conterá apenas UM chart-card visível por vez */}
        <div className="dashboard-grid">
          {activeChart === 'geral' && (
            <div className="chart-card full-width">
              {/* Botões agora DENTRO do chart-card */}
              <ChartNavigationButtons activeChart={activeChart} setActiveChart={setActiveChart} />
              <h2 className="chart-title">Distribuição de Gastos por Categoria</h2>
              <p className="chart-description">Entenda para onde seu dinheiro está indo, dividido em necessidades, desejos e investimentos.</p>
              {/* Wrapper para o gráfico */}
              <div className="chart-container-wrapper">
                <Chart
                  chartType="PieChart"
                  width="100%"
                  height="100%"
                  data={dadosGrafico}
                  options={{
                    pieHole: 0.4,
                    colors: dadosGrafico.slice(1).map(item => categoryColors[item[0]] || '#CCCCCC'),
                    legend: { position: "bottom", textStyle: { color: '#555', fontName: 'Inter', fontSize: 13 } },
                    chartArea: { left: 15, top: 15, right: 15, bottom: 50, width: '90%', height: '80%' }, // Ajuste a altura do chartArea
                    fontName: 'Inter, sans-serif',
                    titleTextStyle: {
                      fontSize: 0,
                    },
                    tooltip: { textStyle: { fontName: 'Inter', fontSize: 13 } },
                    slices: dadosGrafico.length === 2 && dadosGrafico[1][0] === "Nenhuma Categoria" ? {
                        0: { color: '#CCCCCC' }
                    } : {}
                  }}
                />
              </div>
            </div>
          )}

          {activeChart === 'necessidades' && (
            <div className="chart-card full-width">
              <ChartNavigationButtons activeChart={activeChart} setActiveChart={setActiveChart} />
              <h2 className="chart-title">Necessidades: Onde seu dinheiro é essencial</h2>
              <p className="chart-description">Detalhes dos seus gastos fixos e indispensáveis.</p>
              {/* Wrapper para o gráfico */}
              <div className="chart-container-wrapper">
                <Chart
                  chartType="BarChart"
                  width="100%"
                  height="100%"
                  data={[
                    ["Subcategoria", "Valor", { role: "annotation" }],
                    ...agruparSubcategorias(gastos, "NECESSIDADES")
                  ]}
                  options={{
                    title: "",
                    legend: { position: "none" },
                    bars: "horizontal",
                    hAxis: {
                      format: "currency",
                      textStyle: { color: '#555', fontName: 'Inter' },
                      minValue: 0
                    },
                    vAxis: { textStyle: { color: '#555', fontName: 'Inter' } },
                    colors: ["#007bff"],
                    chartArea: { left: 100, top: 30, right: 30, bottom: 30 },
                    fontName: 'Inter, sans-serif',
                    titleTextStyle: {
                      fontSize: 0,
                    },
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

          {activeChart === 'desejos' && (
            <div className="chart-card full-width">
              <ChartNavigationButtons activeChart={activeChart} setActiveChart={setActiveChart} />
              <h2 className="chart-title">Desejos: Gastos para o seu lazer e prazer</h2>
              <p className="chart-description">Visão detalhada dos seus gastos não essenciais e de lazer.</p>
              {/* Wrapper para o gráfico */}
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
                      minValue: 0
                    },
                    vAxis: { textStyle: { color: '#555', fontName: 'Inter' } },
                    colors: ["#dc3545"],
                    chartArea: { left: 100, top: 30, right: 30, bottom: 30 },
                    fontName: 'Inter, sans-serif',
                    titleTextStyle: {
                      fontSize: 0,
                    },
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

          {activeChart === 'investimentos' && (
            <div className="chart-card full-width">
              <ChartNavigationButtons activeChart={activeChart} setActiveChart={setActiveChart} />
              <h2 className="chart-title">Investimentos/Poupança: Construindo seu futuro</h2>
              <p className="chart-description">Acompanhe seu progresso em direção aos seus objetivos financeiros.</p>
              {/* Wrapper para o gráfico */}
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
                      minValue: 0
                    },
                    vAxis: { textStyle: { color: '#555', fontName: 'Inter' } },
                    colors: ["#28a745"],
                    chartArea: { left: 100, top: 30, right: 30, bottom: 30 },
                    fontName: 'Inter, sans-serif',
                    titleTextStyle: {
                      fontSize: 0,
                    },
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

export default Home;