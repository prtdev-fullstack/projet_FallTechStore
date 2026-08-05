import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { initTheme } from './store/ui.store';
import './index.css';

// Aligne le store sur le thème déjà posé par le script anti-FOUC de index.html.
initTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
