import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import * as reportesService from '../services/reportes.service';

// Página con los 4 reportes del sistema: pendientes, por producto, por sucursal y tiempo de resolución
// Solo para administradores: son datos de gestión, no del día a día del vendedor
export default function ReportesPage() {
  const { usuario } = useAuth();
  const [porProducto, setPorProducto] = useState([]);
  const [porSucursal, setPorSucursal] = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [tiempoResolucion, setTiempoResolucion] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Descarga el PDF combinado de los 4 reportes; si falla (ej. token vencido), muestro el mismo mensaje de error de la página
  async function descargarPdf() {
    setError('');
    try {
      await reportesService.descargarReportesPdf();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo generar el PDF');
    }
  }

  // Cargo los 4 reportes en paralelo apenas se monta la página, para que sea más rápido que uno por uno
  useEffect(() => {
    async function cargar() {
      setError('');
      try {
        const [productoData, sucursalData, pendientesData, tiempoData] = await Promise.all([
          reportesService.reportePorProducto(),
          reportesService.reportePorSucursal(),
          reportesService.reportePendientes(),
          reportesService.reporteTiempoResolucion(),
        ]);
        setPorProducto(productoData);
        setPorSucursal(sucursalData);
        setPendientes(pendientesData);
        setTiempoResolucion(tiempoData);
      } catch (err) {
        setError(err.response?.data?.mensaje || 'No se pudieron cargar los reportes');
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  // Si el usuario logueado no es admin, lo saco de esta página y lo mando al inicio
  if (usuario?.rol !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Navbar />
      <main className="app-content">
        <div className="page-header">
          <h1>Reportes</h1>
          <button type="button" className="btn-primary btn-sm" onClick={descargarPdf}>
            Descargar PDF
          </button>
        </div>
        {error && <p className="error-text">{error}</p>}
        {cargando ? (
          <p className="empty-state">Cargando reportes...</p>
        ) : (
          <>
            {/* Reporte 1: faltantes que siguen sin resolver */}
            <section className="card">
              <h2>Faltantes pendientes</h2>
              {pendientes.length === 0 ? (
                <p className="empty-state">No hay faltantes pendientes.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Sucursal</th>
                      <th>Cant.</th>
                      <th>Cliente</th>
                      <th>Reportado el</th>
                      <th>Días esperando</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendientes.map((f) => (
                      <tr key={f.faltante_id}>
                        <td>{f.producto_nombre}</td>
                        <td>{f.sucursal}</td>
                        <td>{f.cantidad_solicitada}</td>
                        <td>{f.cliente_nombre || '—'}</td>
                        <td>{new Date(f.fecha_registro).toLocaleString()}</td>
                        <td>{f.dias_transcurridos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            {/* Reporte 2: cuántas veces se ha reportado cada producto y cuántos quedan pendientes */}
            <section className="card">
              <h2>Faltantes por producto</h2>
              {porProducto.length === 0 ? (
                <p className="empty-state">Todavía no hay datos.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Veces reportado</th>
                      <th>Unidades solicitadas</th>
                      <th>Pendientes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {porProducto.map((p) => (
                      <tr key={p.producto_id}>
                        <td>{p.codigo}</td>
                        <td>{p.producto}</td>
                        <td>{p.categoria}</td>
                        <td>{p.veces_reportado}</td>
                        <td>{p.unidades_solicitadas}</td>
                        <td>{p.pendientes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            {/* Reporte 3: total de faltantes agrupados por sucursal, separando pendientes de resueltos */}
            <section className="card">
              <h2>Faltantes por sucursal</h2>
              {porSucursal.length === 0 ? (
                <p className="empty-state">Todavía no hay datos.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Sucursal</th>
                      <th>Total</th>
                      <th>Pendientes</th>
                      <th>Resueltos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {porSucursal.map((s) => (
                      <tr key={s.sucursal_id}>
                        <td>{s.sucursal}</td>
                        <td>{s.total_faltantes}</td>
                        <td>{s.pendientes}</td>
                        <td>{s.resueltos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            {/* Reporte 4: qué tan rápido se resuelven los faltantes, en promedio de días, por producto */}
            <section className="card">
              <h2>Tiempo promedio de resolución</h2>
              {tiempoResolucion.length === 0 ? (
                <p className="empty-state">Todavía no hay faltantes resueltos.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Faltantes resueltos</th>
                      <th>Promedio de días</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tiempoResolucion.map((t) => (
                      <tr key={t.producto_id}>
                        <td>{t.producto}</td>
                        <td>{t.faltantes_resueltos}</td>
                        <td>{t.promedio_dias_resolucion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}
