import React, { useState, useEffect } from 'react';
import '../assets/Popup.css'; // Certifique-se de que este CSS existe e está correto

const VEcononoPopup = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [value, setValue] = useState(''); // Estado para o valor do input
  const [message, setMessage] = useState(''); // Mensagem de erro/validação interna do popup

  // Efeito para limpar a mensagem de validação interna do popup quando ele é aberto ou fechado
  useEffect(() => {
    if (isOpen) {
      setMessage(''); // Limpa a mensagem ao abrir o popup
    }
  }, [isOpen]);

  // Se o popup não estiver aberto, não renderiza nada
  if (!isOpen) return null;

  // Lida com a submissão do formulário no popup
  const handleSubmit = (e) => {
    e.preventDefault(); // Previne o comportamento padrão de recarregar a página
    const numericValue = parseFloat(value); // Converte o valor do input para número

    // Validação básica no front-end: verifica se é um número válido e positivo
    if (isNaN(numericValue) || numericValue <= 0) {
      setMessage('Por favor, insira um valor numérico válido e positivo.');
      return; // Interrompe a submissão se a validação falhar
    }

    // Se a validação passar, chama a função onSubmit passada como prop
    onSubmit(numericValue);
    // Não limpa o `value` aqui. Ele será limpo no `handleClose` ou quando o plano for gerado com sucesso
    // (o que fará com que o popup seja fechado ou recarregue a página, limpando o estado).
  };

  // Lida com o fechamento do popup (botão Cancelar ou clique fora)
  const handleClose = () => {
    setMessage(''); // Limpa a mensagem de validação
    setValue(''); // Limpa o input
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
            type="number" // Tipo numérico para teclado numérico em celulares e validação do navegador
            step="0.01" // Permite valores com duas casas decimais
            placeholder="Valor para economizar por mês (Ex: 100.00)"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isLoading} // Desabilita o input enquanto está carregando
          />
          {/* Exibe a mensagem de validação interna do popup, se houver */}
          {message && <p className="popup-message error-message">{message}</p>}
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