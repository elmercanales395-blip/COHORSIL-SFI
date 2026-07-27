import { createContext, useContext, useState } from 'react';
import * as authService from '../services/auth.service';

// Creo el contexto donde voy a guardar el usuario logueado y las funciones para entrar/salir
const AuthContext = createContext(null);

// Este provider envuelve toda la app para que cualquier componente pueda leer la sesión actual
export function AuthProvider({ children }) {
  // Inicializo el estado leyendo del sessionStorage, así si recargo la página no pierdo la sesión,
  // pero al cerrar el navegador (o abrir el programa de nuevo) sí se pierde y pide login otra vez
  const [usuario, setUsuario] = useState(() => {
    const stored = sessionStorage.getItem('usuario');
    return stored ? JSON.parse(stored) : null;
  });

  // Hace login contra el backend y guarda el token y los datos del usuario
  async function iniciarSesion(email, password) {
    const { token, usuario: datosUsuario } = await authService.login(email, password);
    // Guardo el token en sessionStorage para mandarlo en cada petición al backend
    sessionStorage.setItem('token', token);
    // Guardo también los datos del usuario para no perderlos si recargo la página
    sessionStorage.setItem('usuario', JSON.stringify(datosUsuario));
    // Actualizo el estado para que toda la app se entere que ya hay sesión iniciada
    setUsuario(datosUsuario);
  }

  // Cierra sesión: limpio todo lo guardado y el estado
  function cerrarSesion() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    setUsuario(null);
  }

  return (
    // Expongo el usuario actual y las dos funciones a todos los componentes hijos
    <AuthContext.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para consumir el contexto de auth fácilmente desde cualquier componente
export function useAuth() {
  return useContext(AuthContext);
}
