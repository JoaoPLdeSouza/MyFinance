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

  const formatarDataIsoParaDDMMYYYY = (isoString) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) {
        // Se já for DD/MM/AAAA (ex: "25/05/2025") e não ISO, retorne como está
        return isoString.includes('/') ? isoString : "Data Inválida";
      }
      const dia = String(date.getDate()).padStart(2, '0');
      const mes = String(date.getMonth() + 1).padStart(2, '0');
      const ano = date.getFullYear();
      return `${dia}/${mes}/${ano}`; // Retorna DD/MM/AAAA
    } catch (e) {
      return "Data Inválida";
    }
  };

  const [valor, setValor] = useState("0,00");
  const [categoria, setCategoria] = useState(lancamento.categoria);
  const [subcategoria, setSubcategoria] = useState(lancamento.subcategoria);
  const [dataParaBackend, setDataParaBackend] = useState(""); // Novo estado para armazenar a data no formato DD/MM/AAAA para o backend
  const [erroValor, setErroValor] = useState(""); // Novo estado para a mensagem de erro do valor

  useEffect(() => {
    setValor(formatarValor(lancamento.valor));
    // Converte a data ISO original para DD/MM/AAAA para armazenar no estado e enviar ao backend
    setDataParaBackend(formatarDataIsoParaDDMMYYYY(lancamento.dataHora));
  }, [lancamento.valor, lancamento.dataHora]);

  useEffect(() => {
    const primeiraSub = categorias[categoria]?.[0] || "";
    setSubcategoria(primeiraSub);
  }, [categoria]);

  const handleValorChange = (e) => {
    let raw = e.target.value.replace(/\D/g, "");
    if (raw === "") raw = "000";
    while (raw.length < 3) {
      raw = "0" + raw;
    }
    const inteiro = raw.slice(0, -2);
    const decimal = raw.slice(-2);
    const formatado = `${parseInt(inteiro, 10)},${decimal}`;
    setValor(formatado);
    setErroValor(""); // Limpa o erro ao digitar
  };

  const handleSalvar = () => {
    const valorNumerico = parseFloat(valor.replace(",", "."));
    if (valorNumerico <= 0) { // Verifica se o valor é 0 ou menor
      setErroValor("O valor não pode ser 0,00. Por favor, insira um valor válido.");
      return; // Impede que a função continue
    }

    if (valor && categoria && subcategoria) {
      const gastoEditado = {
        id: lancamento.id,
        dataHora: dataParaBackend, // Envia a data que já está no formato DD/MM/AAAA
        valor: valorNumerico,
        categoria,
        subcategoria
      };
      onSave(gastoEditado);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Editar Lançamento</h3>

        {/* Aqui exibe a data formatada para o usuário */}
        <p><strong>Data:</strong> {dataParaBackend}</p> 

        <label><br></br>Valor:</label>
        <input
          type="text"
          inputMode="numeric"
          value={valor}
          onChange={handleValorChange}
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
          onPaste={(e) => e.preventDefault()}
        />
        {erroValor && <p className="error-message">{erroValor}</p>} {/* Exibe a mensagem de erro */}

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