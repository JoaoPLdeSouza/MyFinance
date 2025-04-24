import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Registro from "../pages/Registro";
import Home from "../pages/Home";
import Lancamentos from "../pages/Lancamentos";
import Metas from "../pages/Metas";
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
        <Route path="/metas" element={<Metas />} />
        <Route path="/ia" element={<IA />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
