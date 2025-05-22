// src/components/EditarModal.js
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

// ✅ Mapeia categorias para nomes amigáveis
const categoriaFormatada = {
  NECESSIDADES: "Necessidade",
  DESEJOS: "Desejo",
  INVESTIMENTO_E_POUPANCA: "Investimento/Poupança"
};

const EditarModal = ({ lancamento, onClose, onSave }) => {
  const [valor, setValor] = useState(lancamento.valor);
  const [categoria, setCategoria] = useState(lancamento.categoria);
  const [subcategoria, setSubcategoria] = useState(lancamento.subcategoria);

  useEffect(() => {
    const primeiraSub = categorias[categoria]?.[0] || "";
    setSubcategoria(primeiraSub);
  }, [categoria]);

  const handleSalvar = () => {
    if (valor && categoria && subcategoria) {
      onSave({
        id: lancamento.id,
        dataHora: lancamento.dataHora,
        valor: parseFloat(valor),
        categoria,
        subcategoria
      });
    }
  };

  const dataFormatada = lancamento.dataHora;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Editar Lançamento</h3>

        <p><strong>Data:</strong> {dataFormatada}</p>

        <label>Valor:</label>
        <input
          type="text"
          value={parseFloat(valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
          })}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^\d,]/g, "").replace(",", ".");
            setValor(raw);
          }}
        />

        <label>Categoria:</label>
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          {Object.keys(categorias).map((cat) => (
            <option key={cat} value={cat}>
              {categoriaFormatada[cat] || cat}
            </option>
          ))}
        </select>

        <label>Subcategoria:</label>
        <select value={subcategoria} onChange={(e) => setSubcategoria(e.target.value)}>
          {categorias[categoria]?.map((sub) => (
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

export default EditarModal;
