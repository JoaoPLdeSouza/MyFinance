// src/components/PUPRegistro.js
import React, { useEffect } from 'react';
import '../assets/Popup.css';

const PUPRegistro = ({ message, type, onClose }) => {
  useEffect(() => {
    let timer;
    if (message) { // Seta o timer so se a mensagem existir
      timer = setTimeout(() => {
        onClose(); // Delay 4 segundos
      }, 4000);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [message, onClose]);

  // Renderização condicional se for JSX
  if (!message) {
    return null; // Não renderiza se nã tiver mensagem
  }

  const popupClass = `popup-message ${type === 'error' ? 'error-message' : ''}`;

  return (
    <div className="modal-overlay">
      <div className="popup">
        <h3>Aviso</h3>
        <p className={popupClass}>{message}</p>
      </div>
    </div>
  );
};

export default PUPRegistro;