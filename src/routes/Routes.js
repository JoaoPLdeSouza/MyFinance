import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Registro from "../pages/Registro";
import Home from "../pages/Home";
import Lancamentos from "../pages/Lancamentos";
import Config from "../pages/Config";
import IA from "../pages/IA";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/home" element={<Home />} />
        <Route path="/lancamentos" element={<Lancamentos />} />
        <Route path="/config" element={<Config />} />
        <Route path="/ia" element={<IA />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
