import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Registro from "../pages/Registro";
import Home from "../pages/Home";
import Lancamentos from "../pages/Lancamentos";
import ConfigAll from "../pages/ConfigAll";
import Planos from "../pages/Planos";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/home" element={<Home />} />
        <Route path="/lancamentos" element={<Lancamentos />} />
        <Route path="/config" element={<ConfigAll />} />
        <Route path="/planos" element={<Planos />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
