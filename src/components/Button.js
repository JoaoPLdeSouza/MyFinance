import React from "react";

// Componente de botão que recebe texto e uma função para ser executada quando clicado
const Button = ({ text, onClick }) => {
  return <button onClick={onClick}>{text}</button>;
};

export default Button;