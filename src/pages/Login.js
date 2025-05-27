import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// Importar FaEye e FaEyeSlash
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import "../assets/Login.css";
import authService from "../services/authService";
import myFinanceLogo from "../assets/MyFinance_logo.png"; // Certifique-se de que o caminho está correto!

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Novo estado para controlar a visibilidade da senha
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-image-container">
        <img src={myFinanceLogo} alt="MyFinance Logo" className="logo-image" />
      </div>
      <h2 className="login-title">Login</h2>
      <form onSubmit={handleSubmit}>
        <div id="email-group" className="input-group">
          <label htmlFor="email">E-mail</label> {/* Label movida para fora do input-wrapper */}
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
          <label htmlFor="senha">Senha</label> {/* Label movida para fora do input-wrapper */}
          <div className="input-wrapper">
            <FaLock className="icon" />
            <input
              type={showPassword ? "text" : "password"} // Tipo de input dinâmico
              id="senha"
              className="input-field"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            {/* Ícone de olho para alternar a visibilidade da senha */}
            {showPassword ? (
              <FaEyeSlash className="toggle-password" onClick={togglePasswordVisibility} />
            ) : (
              <FaEye className="toggle-password" onClick={togglePasswordVisibility} />
            )}
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