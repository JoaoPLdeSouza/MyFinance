import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "../assets/Layout.css";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="layout">
      <Sidebar isOpen={isSidebarOpen} />
      <div
        className="main-content"
        style={{ marginLeft: isSidebarOpen ? 220 : 60 }} // espaço da sidebar
      >
        <Header toggleSidebar={toggleSidebar} />
        <div className="page-content">
          {children} {/* Aqui o conteúdo da página será exibido */}
        </div>
      </div>
    </div>
  );
};

export default Layout;
