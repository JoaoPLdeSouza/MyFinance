// src/components/Layout.js
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
        style={{ marginLeft: isSidebarOpen ? 220 : 60 }}
      >
        <Header toggleSidebar={toggleSidebar} />
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
