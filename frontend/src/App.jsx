import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import FaltantesPage from './pages/FaltantesPage.jsx';
import ReportesPage from './pages/ReportesPage.jsx';
import FaltantesEliminadosPage from './pages/FaltantesEliminadosPage.jsx';
import HojaPedidoPage from './pages/HojaPedidoPage.jsx';
import HojasPedidoPage from './pages/HojasPedidoPage.jsx';
import UsuariosPage from './pages/UsuariosPage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
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
            // el rol admin se valida adentro de UsuariosPage, como en FaltantesEliminadosPage
            <ProtectedRoute>
              <UsuariosPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
