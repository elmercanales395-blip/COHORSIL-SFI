import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchableSelect from './SearchableSelect.jsx';

// Selector para generar la hoja de pedido (pendientes) o de entrega (resueltos) de una sucursal
export default function HojaPedidoSelector({ sucursales }) {
  const navigate = useNavigate();
  const [sucursalHoja, setSucursalHoja] = useState('');

  return (
    <section className="card">
      <h2>Productos Faltantes en Tienda</h2>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="sucursal_hoja">Sucursal</label>
          <SearchableSelect
            id="sucursal_hoja"
            options={sucursales.map((s) => ({ value: String(s.id), label: s.nombre, sublabel: s.zona || 'Sin zona' }))}
            value={sucursalHoja}
            onChange={setSucursalHoja}
            placeholder="Buscar sucursal por nombre..."
            emptyText="Ninguna sucursal coincide con la búsqueda"
          />
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
