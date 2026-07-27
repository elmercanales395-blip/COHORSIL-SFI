import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Selector para generar la hoja de pedido (pendientes) o de entrega (resueltos) de una sucursal
export default function HojaPedidoSelector({ sucursales }) {
  const navigate = useNavigate();
  // Sucursal elegida para generar su hoja
  const [sucursalHoja, setSucursalHoja] = useState('');

  return (
    <section className="card">
      <h2>Productos Faltantes en Tienda</h2>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="sucursal_hoja">Sucursal</label>
          <select id="sucursal_hoja" value={sucursalHoja} onChange={(e) => setSucursalHoja(e.target.value)}>
            <option value="" disabled>
              Selecciona una sucursal
            </option>
            {sucursales.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="btn-action resolver"
          disabled={!sucursalHoja}
          onClick={() => navigate(`/hoja-pedido?sucursal=${sucursalHoja}&tipo=pendiente`)}
        >
          Ver hoja de solicitud de pedido
        </button>

        <button
          type="button"
          className="btn-action info"
          disabled={!sucursalHoja}
          onClick={() => navigate(`/hoja-pedido?sucursal=${sucursalHoja}&tipo=resuelto`)}
        >
          Ver hoja de entrega
        </button>
      </div>
    </section>
  );
}
