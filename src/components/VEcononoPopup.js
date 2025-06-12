import React, { useState, useEffect } from 'react';
import '../assets/Popup.css'; // Certifique-se de que este CSS existe e está correto

const VEcononoPopup = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [value, setValue] = useState('0,00'); // Estado para o valor do input, inicializado com "0,00"
  const [message, setMessage] = useState(''); // Mensagem de erro/validação interna do popup
  const [erroValor, setErroValor] = useState(''); // Novo estado para a mensagem de erro do valor

  // Efeito para limpar a mensagem de validação interna do popup e o valor quando ele é aberto ou fechado
  useEffect(() => {
    if (isOpen) {
      setMessage(''); // Limpa a mensagem ao abrir o popup
      setErroValor(''); // Limpa a mensagem de erro do valor
      setValue('0,00'); // Limpa o input
    }
  }, [isOpen]);

  // Se o popup não estiver aberto, não renderiza nada
  if (!isOpen) return null;

  const handleValorChange = (e) => {
    let raw = e.target.value.replace(/\D/g, ""); // Remove tudo que não for dígito
    if (raw === "") raw = "000"; // Garante pelo menos "000" para evitar erros de slice
    while (raw.length < 3) {
      raw = "0" + raw; // Adiciona zeros à esquerda até ter pelo menos 3 dígitos
    }
    const inteiro = raw.slice(0, -2); // Separa a parte inteira
    const decimal = raw.slice(-2); // Separa os centavos
    const formatado = `${parseInt(inteiro, 10)},${decimal}`; // Formata como "X,YY"
    setValue(formatado);
    setErroValor(""); // Limpa o erro ao digitar
  };

  // Lida com a submissão do formulário no popup
  const handleSubmit = (e) => {
    e.preventDefault(); // Previne o comportamento padrão de recarregar a página

    const numericValue = parseFloat(value.replace(",", ".")); // Converte o valor do input para número, trocando a vírgula por ponto

    // Validação básica no front-end: verifica se é um número válido e positivo
    if (isNaN(numericValue) || numericValue <= 0) {
      setErroValor('Por favor, insira um valor numérico válido e positivo (maior que 0,00).');
      return; // Interrompe a submissão se a validação falhar
    }

    // Se a validação passar, chama a função onSubmit passada como prop
    onSubmit(numericValue);
  };

  // Lida com o fechamento do popup (botão Cancelar ou clique fora)
  const handleClose = () => {
    setMessage(''); // Limpa a mensagem de validação
    setErroValor(''); // Limpa a mensagem de erro do valor
    setValue('0,00'); // Limpa o input
    onClose(); // Chama a função onClose passada como prop para fechar o popup
  };

  return (
    <div className="modal-overlay"> {/* Camada escura por cima da tela */}
      <div className="popup"> {/* Conteúdo do popup */}
        <h3>Gerar Novo Plano com Valor para Economia Mensal</h3>
        <p className="popup-description">
          <span className="bold-popup-text">Explicação:</span> Este valor representa a quantia que você deseja economizar mensalmente.
          Ao inseri-lo, o sistema tentará ajustar as recomendações do seu plano
          para te ajudar a alcançar essa meta de economia, realocando despesas
          ou sugerindo onde cortar gastos para liberar esse valor.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text" // Alterado para 'text'
            inputMode="numeric" // Habilita teclado numérico em dispositivos móveis
            step="0.01" // Permite valores com duas casas decimais (embora a formatação manual já cuide disso)
            placeholder="Valor para economizar por mês (Ex: 100,00)"
            value={value}
            onChange={handleValorChange} // Usa a nova função de formatação
            onKeyDown={(e) => { // Impede setas de mover o cursor
              const invalidKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
              if (invalidKeys.includes(e.key)) {
                e.preventDefault();
              }
            }}
            onClick={(e) => e.preventDefault()} // Impede seleção ao clicar
            onSelect={(e) => { // Mantém o cursor no final
              const len = e.target.value.length;
              setTimeout(() => e.target.setSelectionRange(len, len), 0);
            }}
            onPaste={(e) => e.preventDefault()} // Impede colar
            disabled={isLoading} // Desabilita o input enquanto está carregando
          />
          {/* Exibe a mensagem de validação interna do popup, se houver */}
          {message && <p className="popup-message error-message">{message}</p>}
          {erroValor && <p className="popup-message error-message">{erroValor}</p>} {/* Exibe a mensagem de erro do valor */}

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Gerando...' : 'Gerar Plano'} {/* Texto dinâmico do botão */}
          </button>
          <button type="button" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
};

export default VEcononoPopup;