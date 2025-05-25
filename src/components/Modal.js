// src/components/Modal.js
import React from "react";
import EditEmailPopup from "./EditEmailPopup";
import EditSenhaPopup from "./EditSenhaPopup";
import EditRendaPopup from "./EditRendaPopup";

const Modal = ({ tipo, isOpen, onClose, usuario }) => {
  if (!isOpen) return null;

  const renderPopup = () => {
    switch (tipo) {
      case "email":
        return <EditEmailPopup usuario={usuario} onClose={onClose} />;
      case "senha":
        return <EditSenhaPopup usuario={usuario} onClose={onClose} />;
      case "renda":
        return <EditRendaPopup usuario={usuario} onClose={onClose} />;
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {renderPopup()}
      </div>
    </div>
  );
};

export default Modal;
