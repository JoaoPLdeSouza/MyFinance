// src/pages/Home.js
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import "../assets/Home.css";
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
    const total = filtrado.reduce((acc, g) => acc + g.valor, 0);

    const agrupado = {};
    filtrado.forEach(g => {
      agrupado[g.subcategoria] = (agrupado[g.subcategoria] || 0) + g.valor;
    });

    return Object.entries(agrupado).map(([nome, valor]) => [
      nome,
      valor,
      `${((valor / total) * 100).toFixed(1)}%`
    ]);
  };

  return (
    <Layout>
      <div className="home-container">
        <h1 className="home-header">Relatórios Financeiros</h1>

        <div className="top-cards">
          <div className="stat-card">
            Rendimento Total<br />
            {renda.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </div>
          <div className="stat-card">
            Gastos Totais<br />
            {totalGasto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </div>
          <div className="stat-card">
            Valor Investido<br />
            {totalInvestimento.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </div>
        </div>


        <div className="dashboard-grid">
          {/* Gráfico 1: Pizza geral */}
          <div className="chart-card">
            <Chart
              chartType="PieChart"
              width="100%"
              height="100%"
              data={dadosGrafico}
              options={{
                title: "Distribuição de Gastos por Categoria",
                pieHole: 0.4,
                slices: {
                  0: { color: "#28a745" }, // Investimento
                  1: { color: "#dc3545" }, // Necessidades
                  2: { color: "#007bff" }, // Desejos
                },
              }}
            />
          </div>

          {/* Gráfico 2: Necessidades */}
          <div className="chart-card">
            <Chart
              chartType="BarChart"
              width="100%"
              height="100%"
              data={[
                ["Subcategoria", "Valor", { role: "annotation" }],
                ...agruparSubcategorias(gastos, "NECESSIDADES")
              ]}
              options={{
                title: "Necessidades por Subcategoria",
                legend: { position: "none" },
                bars: "horizontal",
                hAxis: { format: "currency" },
                colors: ["#007bff"],
              }}
            />
          </div>

          {/* Gráfico 3: Desejos */}
          <div className="chart-card">
            <Chart
              chartType="BarChart"
              width="100%"
              height="100%"
              data={[
                ["Subcategoria", "Valor", { role: "annotation" }],
                ...agruparSubcategorias(gastos, "DESEJOS")
              ]}
              options={{
                title: "Desejos por Subcategoria",
                legend: { position: "none" },
                bars: "horizontal",
                hAxis: { format: "currency" },
                colors: ["#dc3545"],
              }}
            />
          </div>

          {/* Gráfico 4: Investimentos */}
          <div className="chart-card">
            <Chart
              chartType="BarChart"
              width="100%"
              height="100%"
              data={[
                ["Subcategoria", "Valor", { role: "annotation" }],
                ...agruparSubcategorias(gastos, "INVESTIMENTO_E_POUPANCA")
              ]}
              options={{
                title: "Investimentos/Poupança por Subcategoria",
                legend: { position: "none" },
                bars: "horizontal",
                hAxis: { format: "currency" },
                colors: ["#28a745"],
              }}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;