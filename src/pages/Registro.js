import React, { useState } from "react";
import { Link } from "react-router-dom"; // Importa Link para navegação entre páginas
import "../assets/Registro.css"; // Importa o CSS específico da página de registro

const Registro = () => {
  // Estados para armazenar os valores dos campos do formulário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Função chamada ao enviar o formulário de registro
  const handleSubmit = (e) => {
    e.preventDefault(); // Impede o recarregamento da página
    if (password !== confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }
    console.log("Nome:", nome, "E-mail:", email, "Senha:", password);
  };

  return (
    <div className="register-container">
      <h2>Registro</h2>
      {/* Formulário de registro */}
      <form className="register-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nome">Nome:</label>
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)} // Atualiza o estado ao digitar
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">E-mail:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Atualiza o estado ao digitar
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Atualiza o estado ao digitar
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirme sua senha:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} // Atualiza o estado ao digitar
            required
          />
        </div>

        <button type="submit">Registrar</button>
      </form>

      {/* Link para a página de login */}
      <p>
        Já tem uma conta? <Link to="/login">Faça login aqui</Link>
      </p>
    </div>
  );
};

export default Registro;
