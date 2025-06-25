// src/pages/Registro.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../assets/Registro.css";
import authService from "../services/authService";
import PUPRegistro from "../components/PUPRegistro";

const Registro = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [erro, setErro] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setPopupMessage("");

    if (senha !== confirmSenha) {
      setErro("As senhas não coincidem!");
      setPopupMessage("As senhas não coincidem!");
      setPopupType("error");
      return;
    }

    try {
      await authService.register({ nome, email, senha });
      setPopupMessage("Usuário registrado com sucesso!");
      setPopupType("success");
    } catch (err) {
      console.error("Erro ao registrar:", err);
      setErro("Erro ao registrar. Verifique os dados ou tente novamente.");
      setPopupMessage("Erro ao registrar. Verifique os dados ou tente novamente.");
      setPopupType("error");
    }
  };

  const handleClosePopup = () => {
    setPopupMessage("");
    if (popupType === "success") {
      navigate("/login");
    }
  };

  return (
    <div className="register-container">
      <h2>Registro</h2>

      <form className="register-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nome">Nome:</label>
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">E-mail:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="senha">Senha:</label>
          <input
            type="password"
            id="senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmSenha">Confirme sua senha:</label>
          <input
            type="password"
            id="confirmSenha"
            value={confirmSenha}
            onChange={(e) => setConfirmSenha(e.target.value)}
            required
          />
        </div>

        {erro && <p className="error">{erro}</p>}

        <button type="submit">Registrar</button>
      </form>

      <p>
        Já tem uma conta? <Link to="/login">Faça login aqui</Link>
      </p>

      {/* Carrega o componente do PUPRegistro */}
      <PUPRegistro message={popupMessage} type={popupType} onClose={handleClosePopup} /> {/* Troca para PUPRegistro */}
    </div>
  );
};

export default Registro;