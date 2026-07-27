import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Envuelvo cualquier página que necesite sesión iniciada con este componente
export default function ProtectedRoute({ children }) {
  const { usuario } = useAuth();

  // Si no hay usuario logueado, lo mando directo al login en vez de mostrar la página
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // Si sí hay sesión, dejo pasar y muestro la página que está protegiendo
  return children;
}
