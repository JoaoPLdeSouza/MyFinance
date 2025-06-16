import React, { useState, useEffect } from "react";
import authService from "../services/authService";
import "../assets/Popup.css";

const EditRendaPopup = ({ usuario, onClose }) => {
  const formatarValor = (valorNumerico) => {
    let centavos = Math.round(valorNumerico * 100).toString().padStart(3, "0");
    const inteiro = centavos.slice(0, -2);
    const decimal = centavos.slice(-2);
    return `${parseInt(inteiro, 10)},${decimal}`;
  };

  const [novaRendaFormatada, setNovaRendaFormatada] = useState(formatarValor(usuario.renda || 0));
  const [mensagem, setMensagem] = useState("");
  const [erroValor, setErroValor] = useState("");

  useEffect(() => {
    console.log("EditRendaPopup - Prop 'usuario' recebida:", usuario);
    if (usuario && !usuario.nome) {
      console.warn("EditRendaPopup - 'usuario.nome' está ausente:", usuario.nome);
    }
    // Atualiza o valor formatado quando o usuário muda
    setNovaRendaFormatada(formatarValor(usuario.renda || 0));
  }, [usuario]);

  const handleValorChange = (e) => {
    let raw = e.target.value.replace(/\D/g, "");
    if (raw === "") raw = "000";
    while (raw.length < 3) {
      raw = "0" + raw;
    }
    const inteiro = raw.slice(0, -2);
    const decimal = raw.slice(-2);
    const formatado = `${parseInt(inteiro, 10)},${decimal}`;
    setNovaRendaFormatada(formatado);
    setErroValor(""); // Limpa o erro ao digitar
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nomeDoUsuario = usuario?.nome ? String(usuario.nome).trim() : "";
    if (!nomeDoUsuario) {
      setMensagem("Erro: O nome do usuário está ausente. Não é possível atualizar o rendimento.");
      return;
    }

    const novaRendaNumerica = parseFloat(novaRendaFormatada.replace(",", "."));

    if (isNaN(novaRendaNumerica) || novaRendaNumerica <= 0) {
      setErroValor("O rendimento não pode ser 0,00. Por favor, insira um valor válido.");
      return;
    }

    const dadosParaAtualizar = {
      nome: nomeDoUsuario,
      renda: novaRendaNumerica,
    };

    authService.alterarDadosUsuario(usuario.id, dadosParaAtualizar)
      .then(() => {
        setMensagem("Rendimento atualizado com sucesso!");
        setTimeout(() => {
          setMensagem("");
          onClose();
        }, 1500);
      })
      .catch((error) => {
        console.error("Erro ao atualizar rendimento:", error.response || error.message);
        let errorMessage = "Erro ao atualizar rendimento. Tente novamente.";
        if (error.response && error.response.data) {
          const backendData = error.response.data;
          if (backendData.message) {
            if (Array.isArray(backendData.message)) {
              errorMessage = backendData.message.join(" | ");
            } else if (typeof backendData.message === 'string') {
              errorMessage = backendData.message;
            }
          } else if (backendData.error) {
            errorMessage = backendData.error;
          }
        }

        if (errorMessage.includes("Nome") &&
          (errorMessage.includes("vazio") || errorMessage.includes("nulo") || errorMessage.includes("preenchido incorretamente"))) {
          setMensagem(`Erro no nome: ${errorMessage}. Verifique o nome em seu perfil ou contate o suporte.`);
        } else {
          setMensagem(errorMessage);
        }
      });
  };

  return (
    <div className="popup">
      <h3>Editar Rendimento</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          inputMode="numeric"
          value={novaRendaFormatada}
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
          required
        />
        {erroValor && <p className="error-message">{erroValor}</p>}
        <button type="submit">Salvar</button>
        <button type="button" onClick={onClose}>Cancelar</button>
        {mensagem && <p className="popup-message">{mensagem}</p>}
      </form>
    </div>
  );
};

export default EditRendaPopup;