import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Barra de navegación superior que se muestra en todas las páginas protegidas
export default function Navbar() {
  // Saco el usuario logueado y la función de cerrar sesión del contexto de auth
  const { usuario, cerrarSesion } = useAuth();
  // Uso la ruta actual para saber qué link marcar como activo
  const { pathname } = useLocation();

  return (
    <header className="app-header">
      <div className="app-brand">
        <span className="app-brand-mark">CH</span>
        <div className="app-brand-text">
          <span className="app-brand-name">COHORSIL</span>
          <span className="app-brand-sub">¡Somos Innovación Agropecuaria!</span>
          <span className="app-brand-sub">Registro de Faltantes "No Hay"</span>
        </div>
      </div>
      <nav className="app-nav">
        {/* Le pongo la clase "active" al link que coincide con la ruta actual */}
        <Link to="/" className={pathname === '/' ? 'active' : ''}>
          Faltantes
        </Link>
        <Link to="/hojas-pedido" className={pathname === '/hojas-pedido' ? 'active' : ''}>
          Hojas de Pedido
        </Link>
        {/* Solo muestro estos links si el usuario logueado es admin */}
        {usuario?.rol === 'admin' && (
          <>
            <Link to="/reportes" className={pathname === '/reportes' ? 'active' : ''}>
              Reportes
            </Link>
            <Link to="/eliminados" className={pathname === '/eliminados' ? 'active' : ''}>
              Historial
            </Link>
            <Link to="/usuarios" className={pathname === '/usuarios' ? 'active' : ''}>
              Usuarios
            </Link>
          </>
        )}
      </nav>
      <div className="app-user">
        <span>
          {usuario?.nombre} · {usuario?.rol}
        </span>
        <button className="btn-logout" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
