// Tabla que muestra el listado de faltantes, recibe los datos y las funciones de editar/resolver/eliminar por props
export default function FaltanteTable({ faltantes, onEditar, onResolver, onEliminar }) {
  // Si no hay faltantes registrados, muestro un mensaje en vez de una tabla vacía
  if (faltantes.length === 0) {
    return <p className="empty-state">Todavía no hay faltantes registrados.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Producto</th>
          <th>Sucursal</th>
          <th>Cant.</th>
          <th>Cliente</th>
          <th>Registrado por</th>
          <th>Reportado el</th>
          <th>Estado</th>
          <th>Días</th>
          {/* Columna vacía, es donde van los botones de acción */}
          <th></th>
        </tr>
      </thead>
      <tbody>
        {/* Recorro cada faltante y armo una fila, uso faltante_id como key para que React identifique cada fila */}
        {faltantes.map((f) => (
          <tr key={f.faltante_id}>
            <td>{f.producto_nombre}</td>
            <td>{f.sucursal}</td>
            <td>{f.cantidad_solicitada}</td>
            {/* Si no hay nombre de cliente, muestro un guion en vez de dejarlo vacío */}
            <td>{f.cliente_nombre || '—'}</td>
            <td>{f.registrado_por}</td>
            <td>{new Date(f.fecha_registro).toLocaleString()}</td>
            <td>
              {/* Cambio el color del badge según si está pendiente o resuelto */}
              <span className={`badge ${f.estado === 'pendiente' ? 'badge-pendiente' : 'badge-resuelto'}`}>
                {f.estado}
              </span>
            </td>
            <td>{f.dias_transcurridos}</td>
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
                {/* El botón de Resolver solo aparece si el faltante todavía está pendiente */}
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
                    // Pido confirmación antes de borrar, para evitar eliminar algo de un clic sin querer
                    if (window.confirm(`¿Eliminar el faltante de "${f.producto_nombre}" (${f.sucursal})?`)) {
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
        ))}
      </tbody>
    </table>
  );
}
