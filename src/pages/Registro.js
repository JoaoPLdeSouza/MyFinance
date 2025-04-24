import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../assets/Registro.css";
import authService from "../services/authService"; // Serviço para requisições ao back-end

const Registro = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [erro, setErro] = useState("");

  const navigate = useNavigate();

  // Função chamada ao enviar o formulário de registro
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    if (password !== confirmPassword) {
      setErro("As senhas não coincidem!");
      return;
    }

    try {
      // Envia os dados para o back-end
      await authService.register({
        nome,
        email,
        senha: password, // Nome do campo esperado pelo back-end
      });

      // Redireciona para o login após sucesso
      navigate("/login");
    } catch (err) {
      setErro("Erro ao registrar. Verifique os dados ou tente novamente.");
      console.error("Erro ao registrar:", err);
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
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirme sua senha:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {erro && <p style={{ color: "red" }}>{erro}</p>}

        <button type="submit">Registrar</button>
      </form>

      <p>
        Já tem uma conta? <Link to="/login">Faça login aqui</Link>
      </p>
    </div>
  );
};

export default Registro;
