// src/pages/Home.js
import React from "react";
import Layout from "../components/Layout";
import "../assets/Home.css";
import { Chart } from "react-google-charts";

const Home = () => {
  const data = [
    ["Categoria", "Valor"],
    ["Alimentação", 500],
    ["Transporte", 200],
    ["Saúde", 150],
    ["Educação", 300],
  ];

  const options = {
    title: "Distribuição de Gastos",
    pieHole: 0.4,
    is3D: false,
  };

  return (
    <Layout>
      <div className="home-container">
        <h1 className="home-header">Relatórios Financeiros</h1>

        {/* Top 3 cards de valores */}
        <div className="top-cards">
          <div className="stat-card">Rendimento Total<br/>R$ 0,00</div>
          <div className="stat-card">Gastos Totais<br/>R$ 0,00</div>
          <div className="stat-card">Valor Investido<br/>R$ 0,00</div>
        </div>

        {/* Título da seção de gráficos */}
        <div className="dashboard-title">Gráficos</div>

        {/* Grid dos gráficos */}
        <div className="dashboard-grid">
          <div className="chart-card">
            <Chart
              chartType="PieChart"
              width="100%"
              height="300px"
              data={data}
              options={options}
            />
          </div>
          <div className="chart-card">Gráfico 2</div>
          <div className="chart-card">Gráfico 3</div>
          <div className="chart-card">Gráfico 4</div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
