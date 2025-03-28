import React from "react";
import Sidebar from "../components/Sidebar";
import "../assets/Home.css";

const Home = () => {
  return (
    <div className="home-container">
      <Sidebar /> {/* Menu lateral */}
      <div className="content">
        <h1>Relatórios</h1>
        <p>Bem-vindo à página principal! Aqui você poderá visualizar os relatórios financeiros.</p>
      </div>
    </div>
  );
};

export default Home;
