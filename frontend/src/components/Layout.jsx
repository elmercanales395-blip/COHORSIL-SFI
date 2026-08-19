import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// iconos inline estilo feather, para no meter una librería solo por esto
const ICONOS = {
  menu: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  cerrar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  faltantes: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  hojasPedido: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  ),
  reportes: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  historial: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  ),
  usuarios: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  salir: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

export default function Layout({ children }) {
  const { usuario, cerrarSesion } = useAuth();
  const { pathname } = useLocation();
  const [abierto, setAbierto] = useState(false);

  const items = [
    { to: '/', label: 'Faltantes', icono: ICONOS.faltantes },
    { to: '/hojas-pedido', label: 'Hojas de Pedido', icono: ICONOS.hojasPedido },
    ...(usuario?.rol === 'admin'
      ? [
          { to: '/reportes', label: 'Reportes', icono: ICONOS.reportes },
          { to: '/eliminados', label: 'Historial', icono: ICONOS.historial },
          { to: '/usuarios', label: 'Usuarios', icono: ICONOS.usuarios },
        ]
      : []),
  ];

  function Menu() {
    return (
      <>
        <nav className="sidebar-nav">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`sidebar-link ${pathname === item.to ? 'active' : ''}`}
              onClick={() => setAbierto(false)}
            >
              <span className="sidebar-icon">{item.icono}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            {usuario?.nombre} · {usuario?.rol}
          </div>
          <button className="sidebar-link sidebar-logout" onClick={cerrarSesion}>
            <span className="sidebar-icon">{ICONOS.salir}</span>
            Cerrar sesión
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="app-shell">
      {/* queda debajo de la topbar para que el botón de hamburguesa siga clickeable */}
      {abierto && <div className="sidebar-backdrop" onClick={() => setAbierto(false)} />}

      <aside className={`app-sidebar ${abierto ? 'is-open' : ''}`}>
        <div className="sidebar-brand">
          <span className="app-brand-mark">CH</span>
          <span className="sidebar-brand-name">COHORSIL</span>
        </div>
        <Menu />
      </aside>

      <div className="app-main">
        <header className="mobile-topbar">
          <button className="menu-toggle" onClick={() => setAbierto((v) => !v)} aria-label="Abrir/cerrar menú">
            {abierto ? ICONOS.cerrar : ICONOS.menu}
          </button>
          <span className="mobile-topbar-title">COHORSIL</span>
        </header>

        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
