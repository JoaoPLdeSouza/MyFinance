// src/pages/Config.js
import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import authService from "../services/authService";
import "../assets/Config.css";
import { useNavigate } from "react-router-dom";

const Config = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("usuario"));
    if (storedUser) {
      authService.getUserById(storedUser.id)
        .then((res) => {
          setUsuario(res.data);
          setNome(res.data.nome);
          setEmail(res.data.email);
        })
        .catch((err) => {
          console.error("Erro ao carregar dados:", err);
        });
    }
  }, []);

  const handleSalvar = async (e) => {
    e.preventDefault();
    try {
      const dados = {
        id: usuario.id,
        nome,
        email,
        senha: novaSenha
      };
      await authService.updateUser(dados);
      alert("Dados atualizados com sucesso!");
    } catch (error) {
      alert("Erro ao atualizar dados.");
      console.error(error);
    }
  };

  const handleConfirmarExclusao = async () => {
    try {
      await authService.delet(usuario.id);
      localStorage.removeItem("usuario");
      navigate("/login");
    } catch (err) {
      alert("Erro ao deletar conta.");
      console.error(err);
    }
  };

  const abrirModalConfirmacao = () => setMostrarConfirmacao(true);
  const fecharModalConfirmacao = () => setMostrarConfirmacao(false);

  return (
    <Layout>
      <div className="config-container">
        <h2>Alterar Dados</h2>
        <form className="config-form" onSubmit={handleSalvar}>
          <div className="form-group">
            <label>Nome:</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>E-mail:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Nova senha:</label>
            <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} />
          </div>

          <button type="submit" className="salvar-btn">Salvar Alterações</button>
        </form>

        <button onClick={abrirModalConfirmacao} className="deletar-btn">Deletar Conta</button>

        {mostrarConfirmacao && (
          <div className="modal-confirmacao">
            <div className="modal-conteudo">
              <p>Tem certeza que deseja excluir sua conta?</p>
              <button onClick={handleConfirmarExclusao} className="confirmar-btn">Sim, excluir</button>
              <button onClick={fecharModalConfirmacao} className="cancelar-btn">Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Config;
