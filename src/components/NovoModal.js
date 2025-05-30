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
  const [valor, setValor] = useState("0,00"); // Inicializa com "0,00" para formatação
  const [categoria, setCategoria] = useState("NECESSIDADES");
  const [subcategoria, setSubcategoria] = useState(categorias.NECESSIDADES[0]);

  useEffect(() => {
    // Garante que a subcategoria seja a primeira da nova categoria selecionada
    setSubcategoria(categorias[categoria][0]);
  }, [categoria]);

  const handleValorChange = (e) => {
    let raw = e.target.value.replace(/\D/g, ""); // Remove tudo que não é dígito
    if (raw === "") raw = "000"; // Garante que sempre haja pelo menos "000" para evitar erros de slice
    while (raw.length < 3) {
      raw = "0" + raw; // Adiciona zeros à esquerda até ter pelo menos 3 dígitos (para centavos)
    }
    const inteiro = raw.slice(0, -2); // Separa a parte inteira
    const decimal = raw.slice(-2);    // Separa a parte decimal (centavos)
    const formatado = `${parseInt(inteiro, 10)},${decimal}`; // Formata para X,XX
    setValor(formatado);
  };

  const handleSalvar = () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const idUsuario = usuario?.id || usuario?.idUsuario;

    // Validação dos campos do formulário
    if (!valor || valor === "0,00" || !categoria || !subcategoria) {
      alert("Por favor, preencha todos os campos e o valor deve ser maior que zero.");
      return;
    }

    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = hoje.getFullYear();
    const hojeFormatadaParaBackend = `${dia}/${mes}/${ano}`;

    const novoGasto = {
      valor: parseFloat(valor.replace(",", ".")), // Converte o valor formatado para número
      categoria,
      subcategoria,
      dataHora: hojeFormatadaParaBackend
    };

    onSalvarNovo(idUsuario, novoGasto);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Novo Lançamento</h3>

        <label>Valor:</label>
        <input
          type="text" // Alterado para text para controlar a formatação
          inputMode="numeric" // Sugere teclado numérico em dispositivos móveis
          value={valor}
          onChange={handleValorChange}
          // Previne a movimentação do cursor e seleção
          onKeyDown={(e) => {
            const invalidKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
            if (invalidKeys.includes(e.key)) {
              e.preventDefault();
            }
          }}
          onClick={(e) => e.preventDefault()}
          onSelect={(e) => {
            const len = e.target.value.length;
            setTimeout(() => e.target.setSelectionRange(len, len), 0);
          }}
          onPaste={(e) => e.preventDefault()} // Previne colagem
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