// src/pages/Home.js
import React, { useState } from "react";
import Layout from "../components/Layout";

const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className={`page-container ${isSidebarOpen ? "sidebar-open" : ""}`}>
      <Layout isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>
        <div className="main-content">
          <h2>Página de Relatórios</h2>
          <p>Bem-vindo à sua central financeira.</p>
        </div>
      </Layout>
    </div>
  );
};

export default Home;
