import { useEffect, useMemo, useState } from 'react';
import SearchableSelect from './SearchableSelect.jsx';
import TextAutocomplete from './TextAutocomplete.jsx';

const FORM_VACIO = {
  tipoConsulta: 'propio', // 'propio' o 'competencia'
  categoria: '',
  producto_id: '',
  producto_solicitado: '',
  casa_comercial: '',
  producto_sustituto_id: '',
  resultado_venta: '', // '' = sin decidir, 'convertida', 'perdida'
  sucursal_id: '',
  cantidad_solicitada: 1,
  cliente_nombre: '',
  observaciones: '',
};

export default function FaltanteForm({ productos, sucursales, faltantes, onCrear, onEditar, faltanteEditando, onCancelarEdicion }) {
  const [form, setForm] = useState(FORM_VACIO);
  const [enviando, setEnviando] = useState(false);

  const SIN_ZONA = 'Sin zona';

  // mismas líneas que el ERP, hardcodeadas para que existan aunque todavía no haya productos cargados
  const CATEGORIAS = [
    'FERTILIZANTES',
    'ABONOS FOLIARES',
    'ADHERENTES',
    'FUNGICIDAS',
    'INSECTICIDAS',
    'HERBICIDAS',
    'SEMILLAS',
    'VETERINARIA',
    'INSECTICIDAS CACEROS',
    'ESPECIALIDADES',
    'EQUIPO DE HERRAMIENTAS',
    'REP. EQUIPO AGRICOLA',
    'VARIOS',
    'CONCENTRADOS',
    'PRODUCTO EN CONSIGNACION',
    'PLANTULAS',
  ];

  // categoría es opcional, solo acota la búsqueda si está elegida
  const productosFiltrados = useMemo(
    () => (form.categoria ? productos.filter((p) => p.categoria === form.categoria) : productos),
    [productos, form.categoria],
  );

  // no tiene sentido sugerir el mismo producto como su propio sustituto
  const sustitutosCandidatos = useMemo(
    () => productosFiltrados.filter((p) => String(p.id) !== form.producto_id),
    [productosFiltrados, form.producto_id],
  );

  const marcasCompetencia = useMemo(
    () => [...new Set((faltantes || []).map((f) => f.producto_solicitado).filter(Boolean))].sort(),
    [faltantes],
  );

  const casasComerciales = useMemo(
    () => [...new Set((faltantes || []).map((f) => f.casa_comercial).filter(Boolean))].sort(),
    [faltantes],
  );

  // la vista de faltantes trae nombres, no ids, así que hay que buscarlos en las listas cargadas
  useEffect(() => {
    if (!faltanteEditando) {
      setForm(FORM_VACIO);
      return;
    }
    const producto = productos.find((p) => p.codigo === faltanteEditando.producto_codigo);
    const sustituto = productos.find((p) => p.nombre === faltanteEditando.producto_sustituto);
    const sucursal = sucursales.find((s) => s.nombre === faltanteEditando.sucursal);
    setForm({
      tipoConsulta: faltanteEditando.producto_codigo ? 'propio' : 'competencia',
      categoria: producto?.categoria || sustituto?.categoria || '',
      producto_id: producto ? String(producto.id) : '',
      producto_solicitado: faltanteEditando.producto_solicitado || '',
      casa_comercial: faltanteEditando.casa_comercial || '',
      producto_sustituto_id: sustituto ? String(sustituto.id) : '',
      resultado_venta: faltanteEditando.resultado_venta || '',
      sucursal_id: sucursal ? String(sucursal.id) : '',
      cantidad_solicitada: faltanteEditando.cantidad_solicitada,
      cliente_nombre: faltanteEditando.cliente_nombre || '',
      observaciones: faltanteEditando.observaciones || '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faltanteEditando]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      // limpia los campos del modo que se deja al cambiar tipoConsulta
      ...(name === 'tipoConsulta'
        ? value === 'competencia'
          ? { producto_id: '' }
          : { producto_solicitado: '', casa_comercial: '' }
        : {}),
    }));
  }

  function handleCategoriaChange(value) {
    setForm((prev) => ({ ...prev, categoria: value, producto_id: '', producto_sustituto_id: '' }));
  }

  // si eligen producto sin haber elegido categoría antes, se rellena sola con la del producto;
  // y si eso cambia de categoría, se invalida el sustituto que ya estaba elegido
  function handleProductoChange(id) {
    const producto = productos.find((p) => String(p.id) === String(id));
    setForm((prev) => ({
      ...prev,
      producto_id: id,
      categoria: producto?.categoria || prev.categoria,
      producto_sustituto_id: producto && producto.categoria !== prev.categoria ? '' : prev.producto_sustituto_id,
    }));
  }

  function handleSucursalChange(id) {
    setForm((prev) => ({ ...prev, sucursal_id: id }));
  }

  // las dos opciones son excluyentes; tocar la que ya estaba marcada la deja "sin decidir" otra vez
  function handleResultadoVenta(valor) {
    setForm((prev) => ({ ...prev, resultado_venta: prev.resultado_venta === valor ? '' : valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setEnviando(true);
    try {
      // en modo competencia se manda el texto libre en vez de producto_id
      const payload = {
        ...(form.tipoConsulta === 'competencia'
          ? { producto_solicitado: form.producto_solicitado, casa_comercial: form.casa_comercial || null }
          : { producto_id: Number(form.producto_id) }),
        producto_sustituto_id: form.producto_sustituto_id ? Number(form.producto_sustituto_id) : null,
        resultado_venta: form.resultado_venta || null,
        sucursal_id: Number(form.sucursal_id),
        cantidad_solicitada: Number(form.cantidad_solicitada),
        cliente_nombre: form.cliente_nombre,
        observaciones: form.observaciones,
      };

      if (faltanteEditando) {
        await onEditar(faltanteEditando.faltante_id, payload);
        onCancelarEdicion(); // el useEffect de arriba vacía el form solo
      } else {
        await onCrear(payload);
        setForm(FORM_VACIO);
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <h2>{faltanteEditando ? 'Editar faltante' : 'Registrar producto no disponible'}</h2>
      <div className="form-grid">
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Tipo de consulta</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="tipoConsulta"
                value="propio"
                checked={form.tipoConsulta === 'propio'}
                onChange={handleChange}
              />
              Producto COHORSIL agotado
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="tipoConsulta"
                value="competencia"
                checked={form.tipoConsulta === 'competencia'}
                onChange={handleChange}
              />
              Marca / casa comercial externa (competencia)
            </label>
          </div>
        </div>

        <div className="field">
          <label htmlFor="categoria">Categoría (opcional, para acotar la búsqueda)</label>
          <SearchableSelect
            id="categoria"
            options={CATEGORIAS.map((c) => ({ value: c, label: c }))}
            value={form.categoria}
            onChange={handleCategoriaChange}
            placeholder="Buscar categoría..."
            emptyText="Ninguna categoría coincide con la búsqueda"
          />
        </div>

        {form.tipoConsulta === 'competencia' && (
          // no depende de la categoría de arriba, esa es solo para sugerir el sustituto
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="producto_solicitado">Producto/marca buscada por el cliente (competencia)</label>
            <TextAutocomplete
              id="producto_solicitado"
              value={form.producto_solicitado}
              onChange={(v) => setForm((prev) => ({ ...prev, producto_solicitado: v }))}
              sugerencias={marcasCompetencia}
              placeholder="Ej. Opera"
              required
            />
          </div>
        )}

        {form.tipoConsulta === 'competencia' && (
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="casa_comercial">Casa comercial a la que pertenece</label>
            <TextAutocomplete
              id="casa_comercial"
              value={form.casa_comercial}
              onChange={(v) => setForm((prev) => ({ ...prev, casa_comercial: v }))}
              sugerencias={casasComerciales}
              placeholder="Ej. Syngenta"
            />
          </div>
        )}

        {form.tipoConsulta !== 'competencia' && (
          <div className="field">
            <label htmlFor="producto_id">Producto agotado</label>
            <SearchableSelect
              id="producto_id"
              options={productosFiltrados.map((p) => ({ value: String(p.id), label: p.nombre }))}
              value={form.producto_id}
              onChange={handleProductoChange}
              placeholder="Buscar producto por nombre..."
              required
              emptyText="Ningún producto coincide con la búsqueda"
            />
          </div>
        )}

        <div className="field">
          <label htmlFor="sucursal_id">Sucursal</label>
          <SearchableSelect
            id="sucursal_id"
            options={sucursales.map((s) => ({ value: String(s.id), label: s.nombre, sublabel: s.zona || SIN_ZONA }))}
            value={form.sucursal_id}
            onChange={handleSucursalChange}
            placeholder="Buscar sucursal por nombre..."
            required
            emptyText="Ninguna sucursal coincide con la búsqueda"
          />
        </div>

        <div className="field">
          <label htmlFor="cantidad_solicitada">Cantidad solicitada</label>
          <input
            id="cantidad_solicitada"
            name="cantidad_solicitada"
            type="number"
            min="1"
            value={form.cantidad_solicitada}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="cliente_nombre">Cliente (opcional)</label>
          <input
            id="cliente_nombre"
            name="cliente_nombre"
            type="text"
            value={form.cliente_nombre}
            onChange={handleChange}
          />
        </div>

        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="observaciones">Observaciones</label>
          <input
            id="observaciones"
            name="observaciones"
            type="text"
            value={form.observaciones}
            onChange={handleChange}
          />
        </div>

        {form.categoria && (
          <div className="dss-card" style={{ gridColumn: '1 / -1' }}>
            <span className="bi-kicker">Sustitución sugerida</span>

            <div className="field">
              <label htmlFor="producto_sustituto_id">Producto COHORSIL sustituto</label>
              <SearchableSelect
                id="producto_sustituto_id"
                options={[
                  { value: '', label: 'Ninguno / no aplica' },
                  ...sustitutosCandidatos.map((p) => ({ value: String(p.id), label: p.nombre, sublabel: p.categoria })),
                ]}
                value={form.producto_sustituto_id}
                onChange={(id) => setForm((prev) => ({ ...prev, producto_sustituto_id: id }))}
                placeholder="Buscar producto sustituto..."
                emptyText="Ningún producto coincide con la búsqueda"
              />
            </div>

            <div className="dss-check-row">
              <label className="dss-check dss-check-convertida">
                <input
                  type="checkbox"
                  checked={form.resultado_venta === 'convertida'}
                  onChange={() => handleResultadoVenta('convertida')}
                />
                Venta concretada con producto sustituto
              </label>
              <label className="dss-check dss-check-perdida">
                <input
                  type="checkbox"
                  checked={form.resultado_venta === 'perdida'}
                  onChange={() => handleResultadoVenta('perdida')}
                />
                Cliente no aceptó alternativa (venta perdida)
              </label>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-primary" type="submit" disabled={enviando}>
            {enviando ? 'Guardando...' : faltanteEditando ? 'Guardar cambios' : 'Registrar faltante'}
          </button>
          {faltanteEditando && (
            <button className="btn-action" type="button" onClick={onCancelarEdicion}>
              Cancelar
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
