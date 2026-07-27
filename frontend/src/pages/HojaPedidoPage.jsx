import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import * as faltantesService from '../services/faltantes.service';

// Hoja imprimible con los faltantes de una sucursal: pendientes (solicitud de pedido) o resueltos (entrega)
export default function HojaPedidoPage() {
  const [searchParams] = useSearchParams();
  const sucursalId = Number(searchParams.get('sucursal'));
  // Cualquier valor que no sea "resuelto" lo tomo como hoja de pedido (pendientes)
  const tipo = searchParams.get('tipo') === 'resuelto' ? 'resuelto' : 'pendiente';

  const [faltantes, setFaltantes] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Traigo los datos una sola vez al entrar a la hoja
  useEffect(() => {
    async function cargar() {
      const [faltantesData, sucursalesData] = await Promise.all([
        faltantesService.listarFaltantes(),
        faltantesService.listarSucursales(),
      ]);
      setFaltantes(faltantesData);
      setSucursales(sucursalesData);
      setCargando(false);
    }
    cargar();
  }, []);

  // Comparo convirtiendo ambos lados a número: el backend a veces devuelve el id como texto (ej. "3")
  // según el driver de SQL Server, así que una comparación estricta (===) podía fallar
  const sucursal = useMemo(() => sucursales.find((s) => Number(s.id) === sucursalId), [sucursales, sucursalId]);

  // Filtro los faltantes de esa sucursal según el estado que corresponda a esta hoja
  const filas = useMemo(
    () => faltantes.filter((f) => f.sucursal === sucursal?.nombre && f.estado === tipo),
    [faltantes, sucursal, tipo],
  );

  const totalUnidades = filas.reduce((acc, f) => acc + f.cantidad_solicitada, 0);
  const titulo = tipo === 'pendiente' ? 'Hoja de Solicitud de Pedido' : 'Hoja de Entrega';
  const fecha = new Date().toLocaleDateString();

  if (cargando) {
    return <p className="empty-state">Cargando...</p>;
  }

  return (
    <main className="app-content">
      {/* Estos controles no deben salir en la hoja impresa */}
      <div className="no-imprimir hoja-acciones">
        <Link to="/" className="btn-link">
          ← Volver
        </Link>
        <button type="button" className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }} onClick={() => window.print()}>
          Imprimir
        </button>
      </div>

      <section className="card hoja-card">
        <header className="hoja-header">
          <div>
            <h1>COHORSIL</h1>
            <p>¡Somos Innovación Agropecuaria!</p>
          </div>
          <div className="hoja-titulo">
            <h2>{titulo}</h2>
            <p>
              <strong>Sucursal:</strong> {sucursal?.nombre || '—'}
            </p>
            <p>
              <strong>Fecha:</strong> {fecha}
            </p>
          </div>
        </header>

        {filas.length === 0 ? (
          <p className="empty-state">
            No hay productos {tipo === 'pendiente' ? 'pendientes' : 'entregados'} para esta sucursal.
          </p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Cantidad</th>
                  <th>Cliente</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((f) => (
                  <tr key={f.faltante_id}>
                    <td>{f.producto_codigo}</td>
                    <td>{f.producto_nombre}</td>
                    <td>{f.categoria}</td>
                    <td>{f.cantidad_solicitada}</td>
                    <td>{f.cliente_nombre || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="hoja-totales">
              <strong>Total de productos:</strong> {filas.length} · <strong>Total de unidades:</strong> {totalUnidades}
            </p>

            {/* Firmas para dejar constancia física de quién entrega y quién recibe */}
            <div className="hoja-firmas">
              <div className="hoja-firma">
                <span className="hoja-firma-linea"></span>
                <p>Entregado por</p>
              </div>
              <div className="hoja-firma">
                <span className="hoja-firma-linea"></span>
                <p>Recibido por</p>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
