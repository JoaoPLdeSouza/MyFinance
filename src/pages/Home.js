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
        .catch(err => console.error("Erro ao buscar lançamentos:", err));
    }
  }, []);

  // Mapeamento de categorias para cores
  const categoryColors = {
    "investimento e poupanca": "#28a745", // Verde
    "necessidades": "#007bff",          // Azul
    "desejos": "#dc3545",              // Vermelho
  };

  const dadosGrafico = [
    ["Categoria", "Valor"],
    ...gastos.reduce((acc, item) => {
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
    }, [])
  ];

  const agruparSubcategorias = (lista, categoria) => {
    const filtrado = lista.filter(g => g.categoria === categoria);
    // Para gráficos de barra de despesas, usamos o valor absoluto para garantir que as barras sejam positivas e representem a magnitude do gasto
    const total = filtrado.reduce((acc, g) => acc + Math.abs(g.valor), 0);

    const agrupado = {};
    filtrado.forEach(g => {
      agrupado[g.subcategoria] = (agrupado[g.subcategoria] || 0) + g.valor; // Mantém o valor original aqui
    });

    // Retorna os dados formatados com anotação de porcentagem usando Math.abs para o percentual de exibição
    return Object.entries(agrupado).map(([nome, valor]) => [
      nome,
      valor, // O valor original será usado para o tamanho da barra
      total > 0 ? `${((Math.abs(valor) / total) * 100).toFixed(1)}%` : '0%' // Calcula percentual com valor absoluto
    ]);
  };

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

        <div className="dashboard-grid">
          {/* Gráfico 1: Pizza geral */}
          <div className="chart-card">
            <h2 className="chart-title">Distribuição de Gastos por Categoria</h2>
            <p className="chart-description">Entenda para onde seu dinheiro está indo, dividido em necessidades, desejos e investimentos.</p>
            <Chart
              chartType="PieChart"
              width="100%"
              height="calc(100% - 100px)"
              data={dadosGrafico}
              options={{
                pieHole: 0.4,
                colors: dadosGrafico.slice(1).map(item => categoryColors[item[0]]),
                legend: { position: "bottom", textStyle: { color: '#555', fontName: 'Inter', fontSize: 13 } },
                chartArea: { left: 15, top: 15, right: 15, bottom: 50 },
                fontName: 'Inter, sans-serif',
                titleTextStyle: {
                  fontSize: 0,
                },
                tooltip: { textStyle: { fontName: 'Inter', fontSize: 13 } }
              }}
            />
          </div>

          {/* Gráfico 2: Necessidades */}
          <div className="chart-card">
            <h2 className="chart-title">Necessidades: Onde seu dinheiro é essencial</h2>
            <p className="chart-description">Detalhes dos seus gastos fixos e indispensáveis.</p>
            <Chart
              chartType="BarChart"
              width="100%"
              height="calc(100% - 100px)"
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
                  minValue: 0 // Garante que o eixo horizontal comece em 0
                },
                vAxis: { textStyle: { color: '#555', fontName: 'Inter' } },
                colors: ["#007bff"], // Azul para Necessidades
                chartArea: { left: 100, top: 30, right: 30, bottom: 30 },
                fontName: 'Inter, sans-serif',
                titleTextStyle: {
                  fontSize: 0,
                },
                tooltip: { textStyle: { fontName: 'Inter', fontSize: 13 } },
                annotations: { // Melhoria das anotações
                  alwaysOutside: true,
                  textStyle: {
                    fontSize: 12,
                    color: '#000',
                    fontName: 'Inter',
                    auraColor: 'none' // Remove o halo para texto mais limpo
                  }
                }
              }}
            />
          </div>

          {/* Gráfico 3: Desejos */}
          <div className="chart-card">
            <h2 className="chart-title">Desejos: Gastos para o seu lazer e prazer</h2>
            <p className="chart-description">Visão detalhada dos seus gastos não essenciais e de lazer.</p>
            <Chart
              chartType="BarChart"
              width="100%"
              height="calc(100% - 100px)"
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
                  minValue: 0 // Garante que o eixo horizontal comece em 0
                },
                vAxis: { textStyle: { color: '#555', fontName: 'Inter' } },
                colors: ["#dc3545"], // Vermelho para Desejos
                chartArea: { left: 100, top: 30, right: 30, bottom: 30 },
                fontName: 'Inter, sans-serif',
                titleTextStyle: {
                  fontSize: 0,
                },
                tooltip: { textStyle: { fontName: 'Inter', fontSize: 13 } },
                annotations: { // Melhoria das anotações
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

          {/* Gráfico 4: Investimentos */}
          <div className="chart-card">
            <h2 className="chart-title">Investimentos/Poupança: Construindo seu futuro</h2>
            <p className="chart-description">Acompanhe seu progresso em direção aos seus objetivos financeiros.</p>
            <Chart
              chartType="BarChart"
              width="100%"
              height="calc(100% - 100px)"
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
                  minValue: 0 // Garante que o eixo horizontal comece em 0
                },
                vAxis: { textStyle: { color: '#555', fontName: 'Inter' } },
                colors: ["#28a745"], // Verde para Investimentos
                chartArea: { left: 100, top: 30, right: 30, bottom: 30 },
                fontName: 'Inter, sans-serif',
                titleTextStyle: {
                  fontSize: 0,
                },
                tooltip: { textStyle: { fontName: 'Inter', fontSize: 13 } },
                annotations: { // Melhoria das anotações
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
      </div>
    </Layout>
  );
};

export default Home;