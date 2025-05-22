// src/components/NovoModal.js
import React, { useEffect, useState } from "react";
import "../assets/EditarModal.css";

const categorias = {
  NECESSIDADES: [
    "aluguel", "condominio", "conta de agua", "conta de luz", "gás", "plano de saude", "remedios",
    "transporte", "combustivel", "parcela de carro", "seguro de carro", "seguro de vida",
    "supermercado", "faculdade", "internet"
  ],
  DESEJOS: [
    "assinaturas", "cinema", "delivery", "eletronicos", "massagem", "presentes",
    "restaurante", "roupa", "salão de beleza", "shows", "streaming", "cursos livres",
    "transporte por aplicativo", "servicos", "academia", "hobby"
  ],
  INVESTIMENTO_E_POUPANCA: [
    "fundo de emergência", "investimento", "poupança", "previdência"
  ]
};

const categoriaFormatada = {
  NECESSIDADES: "Necessidade",
  DESEJOS: "Desejo",
  INVESTIMENTO_E_POUPANCA: "Investimento/Poupança"
};

const NovoModal = ({ onClose, onSalvarNovo }) => {
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("NECESSIDADES");
  const [subcategoria, setSubcategoria] = useState(categorias.NECESSIDADES[0]);

  useEffect(() => {
    setSubcategoria(categorias[categoria][0]);
  }, [categoria]);

  const handleSalvar = () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const idUsuario = usuario?.id || usuario?.idUsuario;

    if (!idUsuario || !valor || !categoria || !subcategoria) return;

    const hojeFormatada = new Date().toLocaleDateString("pt-BR"); // "21/05/2025"

    const novoGasto = {
      valor: parseFloat(valor),
      categoria,
      subcategoria,
      dataHora: hojeFormatada
    };

    onSalvarNovo(idUsuario, novoGasto);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Novo Lançamento</h3>

        <label>Valor:</label>
        <input
          type="number"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />

        <label>Categoria:</label>
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          {Object.keys(categorias).map((cat) => (
            <option key={cat} value={cat}>
              {categoriaFormatada[cat]}
            </option>
          ))}
        </select>

        <label>Subcategoria:</label>
        <select value={subcategoria} onChange={(e) => setSubcategoria(e.target.value)}>
          {categorias[categoria].map((sub) => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>

        <div className="modal-buttons">
          <button className="salvar" onClick={handleSalvar}>Salvar</button>
          <button className="cancelar" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default NovoModal;
