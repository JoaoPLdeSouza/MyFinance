import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../assets/Login.css"; // Importando o CSS com o estilo da página de login

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica para login
    console.log("E-mail:", email, "Senha:", password);
  };

  return (
    <div className="login-container">
      <div className="login-image-container"></div> {/* Imagem do rosto anônimo */}
      <h2 className="login-title">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">Entrar</button>
      </form>
      <p className="signup-link">
        Não tem uma conta? <Link to="/registro">Criar uma conta</Link>
      </p>
    </div>
  );
};

export default Login;
