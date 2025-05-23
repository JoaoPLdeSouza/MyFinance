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

const EditarModal = ({ lancamento, onClose, onSave }) => {
  const formatarValor = (valorNumerico) => {
    let centavos = Math.round(valorNumerico * 100).toString().padStart(3, "0");
    const inteiro = centavos.slice(0, -2);
    const decimal = centavos.slice(-2);
    return `${parseInt(inteiro, 10)},${decimal}`;
  };

  const [valor, setValor] = useState("0,00");
  const [categoria, setCategoria] = useState(lancamento.categoria);
  const [subcategoria, setSubcategoria] = useState(lancamento.subcategoria);

  useEffect(() => {
    setValor(formatarValor(lancamento.valor));
  }, [lancamento.valor]);

  useEffect(() => {
    const primeiraSub = categorias[categoria]?.[0] || "";
    setSubcategoria(primeiraSub);
  }, [categoria]);

  const handleValorChange = (e) => {
    let raw = e.target.value.replace(/\D/g, "");

    // Impede o campo de ficar vazio
    if (raw === "") raw = "000";

    while (raw.length < 3) {
      raw = "0" + raw;
    }

    const inteiro = raw.slice(0, -2);
    const decimal = raw.slice(-2);
    const formatado = `${parseInt(inteiro, 10)},${decimal}`;

    setValor(formatado);
  };

  const handleSalvar = () => {
    if (valor && categoria && subcategoria) {
      onSave({
        id: lancamento.id,
        dataHora: lancamento.dataHora,
        valor: parseFloat(valor.replace(",", ".")),
        categoria,
        subcategoria
      });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Editar Lançamento</h3>

        <p><strong>Data:</strong> {lancamento.dataHora}</p>

        <label><br></br>Valor:</label>
        <input
          type="text"
          inputMode="numeric"
          value={valor}
          onChange={handleValorChange}
          onKeyDown={(e) => {
            // Bloqueia teclas de movimentação, deletar, setas, etc
            const invalidKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
            if (invalidKeys.includes(e.key)) {
              e.preventDefault();
            }
          }}
          onClick={(e) => e.preventDefault()} // impede mudar posição do cursor com clique
          onSelect={(e) => {
            // força o cursor sempre no fim
            const len = e.target.value.length;
            setTimeout(() => e.target.setSelectionRange(len, len), 0);
          }}
          onPaste={(e) => e.preventDefault()} // bloqueia colar
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
