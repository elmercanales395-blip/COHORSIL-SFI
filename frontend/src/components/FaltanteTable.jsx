// mapea resultado_venta (o pendiente) a la etiqueta/color que pide el DSS
function estadoVenta(f) {
  if (f.resultado_venta === 'convertida') return { texto: 'Convertida', clase: 'badge-convertida' };
  if (f.resultado_venta === 'perdida') return { texto: 'Venta perdida', clase: 'badge-perdida' };
  return { texto: 'Pendiente de reabastecer', clase: 'badge-espera' };
}

export default function FaltanteTable({ faltantes, onEditar, onResolver, onEliminar }) {
  if (faltantes.length === 0) {
    return <p className="empty-state">Todavía no hay faltantes registrados.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Producto solicitado</th>
          <th>Sustituto sugerido</th>
          <th>Estado de venta</th>
          <th>Sucursal</th>
          <th>Cant.</th>
          <th>Cliente</th>
          <th>Registrado por</th>
          <th>Fecha</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {faltantes.map((f) => {
          const venta = estadoVenta(f);
          return (
            <tr key={f.faltante_id}>
              <td>
                {f.producto_nombre || f.producto_solicitado}
                {!f.producto_nombre && (
                  <>
                    {' '}
                    <span className="badge badge-competencia">competencia</span>
                    {f.casa_comercial && ` (${f.casa_comercial})`}
                  </>
                )}
              </td>
              <td>{f.producto_sustituto || '—'}</td>
              <td>
                <span className={`badge ${venta.clase}`}>{venta.texto}</span>
              </td>
              <td>{f.sucursal}</td>
              <td>{f.cantidad_solicitada}</td>
              <td>{f.cliente_nombre || '—'}</td>
              <td>{f.registrado_por}</td>
              <td>{new Date(f.fecha_registro).toLocaleDateString()}</td>
              <td>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn-action info" onClick={() => onEditar(f)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path
                        d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Editar
                  </button>
                  {f.estado === 'pendiente' && (
                    <button className="btn-action resolver" onClick={() => onResolver(f.faltante_id)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M4 12l6 6L20 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Resolver
                    </button>
                  )}
                  <button
                    className="btn-action eliminar"
                    onClick={() => {
                      const nombre = f.producto_nombre || f.producto_solicitado;
                      if (window.confirm(`¿Eliminar el faltante de "${nombre}" (${f.sucursal})?`)) {
                        onEliminar(f.faltante_id);
                      }
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path
                        d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0v13a1 1 0 01-1 1H8a1 1 0 01-1-1V7h10z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
