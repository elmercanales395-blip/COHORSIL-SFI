import { Routes, Route, Navigate } from 'react-router-dom';
// Traigo el proveedor de autenticación para envolver toda la app y que cualquier componente sepa quién inició sesión
import { AuthProvider } from './context/AuthContext.jsx';
// Componente que revisa si hay sesión activa antes de mostrar una página protegida
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import FaltantesPage from './pages/FaltantesPage.jsx';
import ReportesPage from './pages/ReportesPage.jsx';
import FaltantesEliminadosPage from './pages/FaltantesEliminadosPage.jsx';
import HojaPedidoPage from './pages/HojaPedidoPage.jsx';
import HojasPedidoPage from './pages/HojasPedidoPage.jsx';
import UsuariosPage from './pages/UsuariosPage.jsx';

// Componente raíz de mi aplicación: aquí defino todas las rutas
export default function App() {
  return (
    // Envuelvo todo en AuthProvider para que el estado de sesión esté disponible en cualquier página
    <AuthProvider>
      <Routes>
        {/* El login queda libre, no necesita estar autenticado para entrar aquí */}
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            // La página principal (listado de faltantes) solo se puede ver con sesión iniciada
            <ProtectedRoute>
              <FaltantesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reportes"
          element={
            <ProtectedRoute>
              <ReportesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/eliminados"
          element={
            <ProtectedRoute>
              <FaltantesEliminadosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hojas-pedido"
          element={
            <ProtectedRoute>
              <HojasPedidoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hoja-pedido"
          element={
            <ProtectedRoute>
              <HojaPedidoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            // UsuariosPage además valida adentro que el rol sea admin, igual que FaltantesEliminadosPage
            <ProtectedRoute>
              <UsuariosPage />
            </ProtectedRoute>
          }
        />
        {/* Cualquier ruta que no exista, la mando de vuelta al inicio */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
