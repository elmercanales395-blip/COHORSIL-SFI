import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuración de Vite para mi proyecto de React
export default defineConfig({
  // Habilito el plugin de React para JSX, fast refresh, etc.
  plugins: [react()],
  server: {
    // Fijo el puerto del servidor de desarrollo en 5173
    port: 5173,
  },
});
