import React from 'react';
import ReactDOM from 'react-dom/client';
// BrowserRouter habilita el enrutamiento por URL usando el historial del navegador
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/global.css';

// Punto de entrada: monto mi app React dentro del div#root del index.html
ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode me ayuda a detectar errores y prácticas obsoletas en desarrollo
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
