import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/Login.css"; // Importa o CSS externo

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Usuário:", email, "Senha:", password);
    navigate("/dashboard");
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            className="input"
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="button" type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
