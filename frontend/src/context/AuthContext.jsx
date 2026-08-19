import { createContext, useContext, useState } from 'react';
import * as authService from '../services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // sessionStorage a propósito, no localStorage: se pierde al cerrar el navegador
  const [usuario, setUsuario] = useState(() => {
    const stored = sessionStorage.getItem('usuario');
    return stored ? JSON.parse(stored) : null;
  });

  async function iniciarSesion(email, password) {
    const { token, usuario: datosUsuario } = await authService.login(email, password);
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('usuario', JSON.stringify(datosUsuario));
    setUsuario(datosUsuario);
  }

  function cerrarSesion() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
