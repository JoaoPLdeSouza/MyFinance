import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import "../assets/Login.css";
import authService from "../services/authService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState(""); // precisa ser 'senha', como no backend
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await authService.login({ email, senha });

      localStorage.setItem("usuario", JSON.stringify(response.data));

      navigate("/home");
    } catch (err) {
      setError("E-mail ou senha inválidos.");
      console.error("Erro ao fazer login:", err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-image-container"></div>
      <h2 className="login-title">Login</h2>
      <form onSubmit={handleSubmit}>
        <div id="email-group" className="input-group">
          <label htmlFor="email">E-mail</label>
          <div className="input-wrapper">
            <FaUser className="icon" />
            <input
              type="email"
              id="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        <div id="senha-group" className="input-group">
          <label htmlFor="senha">Senha</label>
          <div className="input-wrapper">
            <FaLock className="icon" />
            <input
              type="password"
              id="senha"
              className="input-field"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" className="login-button">Entrar</button>
      </form>
      <p className="signup-link">
        Não tem uma conta? <Link to="/registro">Criar uma conta</Link>
      </p>
    </div>
  );
};

export default Login;
