import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // Importa o componente principal da aplicação

// Obtém a referência do elemento "root" no HTML
const root = ReactDOM.createRoot(document.getElementById("root"));

// Renderiza a aplicação corretamente, sem duplicar o BrowserRouter
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
