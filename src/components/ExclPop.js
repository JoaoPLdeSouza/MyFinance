// src/components/ExclPop.jsx
import React from 'react';
import '../assets/Popup.css';

const ExclPop = ({ message, onConfirm, onCancel }) => {
  // Renderiza os botões apenas se ambos onConfirm e onCancel forem fornecidos (para o caso de confirmação)
  const shouldShowButtons = onConfirm && onCancel;

  return (
    <div className="modal-overlay">
      <div className="popup">
        <h3>{shouldShowButtons ? "Confirmação" : "Aviso"}</h3>
        <p className="popup-description">{message}</p>
        {shouldShowButtons && ( // Renderiza os botões apenas se for um pop-up de confirmação
          <div className="popup-actions">
            <button className="confirmar-btn" onClick={onConfirm}>Sim, excluir</button>
            <button className="cancelar-btn" onClick={onCancel}>Cancelar</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExclPop;