import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import * as faltantesService from '../services/faltantes.service';

// solo admin, se valida el rol más abajo
export default function FaltantesEliminadosPage() {
  const { usuario } = useAuth();
  const [faltantes, setFaltantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  // Filtros de búsqueda: por texto (código/nombre) y por fecha de eliminación
  const [busqueda, setBusqueda] = useState('');
  const [fecha, setFecha] = useState('');

  async function cargarDatos() {
    setError('');
    try {
      const data = await faltantesService.listarFaltantesEliminados();
      setFaltantes(data);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudieron cargar los faltantes eliminados');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  // Filtro en el frontend (sin volver a llamar al backend) según el texto y la fecha que escribió el usuario
  const faltantesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return faltantes.filter((f) => {
      const coincideTexto =
        !texto ||
        f.producto_codigo?.toLowerCase().includes(texto) ||
        f.producto_nombre?.toLowerCase().includes(texto);
      // Comparo solo la parte de la fecha (los primeros 10 caracteres tipo YYYY-MM-DD)
      const coincideFecha = !fecha || f.fecha_eliminacion?.slice(0, 10) === fecha;
      return coincideTexto && coincideFecha;
    });
  }, [faltantes, busqueda, fecha]);

  if (usuario?.rol !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
        <section className="card">
          <h2>Historial de faltantes eliminados</h2>
          {error && <p className="error-text">{error}</p>}

          <div className="form-grid" style={{ marginBottom: '1rem' }}>
            <div className="field">
              <label htmlFor="busqueda">Buscar por código o nombre</label>
              <input
                id="busqueda"
                type="text"
                placeholder="Ej. FUNG-001 o Alto LT"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="fecha">Fecha de eliminación</label>
              <input id="fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </div>
          </div>

          {cargando ? (
            <p className="empty-state">Cargando...</p>
          ) : faltantes.length === 0 ? (
            <p className="empty-state">No hay faltantes eliminados.</p>
          ) : faltantesFiltrados.length === 0 ? (
            <p className="empty-state">Ningún faltante eliminado coincide con la búsqueda.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Sucursal</th>
                  <th>Cant.</th>
                  <th>Cliente</th>
                  <th>Registrado por</th>
                  <th>Reportado el</th>
                  <th>Eliminado el</th>
                </tr>
              </thead>
              <tbody>
                {faltantesFiltrados.map((f) => (
                  <tr key={f.faltante_id}>
                    <td>{f.producto_nombre}</td>
                    <td>{f.sucursal}</td>
                    <td>{f.cantidad_solicitada}</td>
                    <td>{f.cliente_nombre || '—'}</td>
                    <td>{f.registrado_por}</td>
                    <td>{new Date(f.fecha_registro).toLocaleString()}</td>
                    <td>{new Date(f.fecha_eliminacion).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
    </Layout>
  );
}
