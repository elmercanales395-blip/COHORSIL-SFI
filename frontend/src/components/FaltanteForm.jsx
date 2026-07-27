import { useEffect, useMemo, useState } from 'react';

const FORM_VACIO = {
  categoria: '',
  producto_id: '',
  zona: '',
  sucursal_id: '',
  cantidad_solicitada: 1,
  cliente_nombre: '',
  observaciones: '',
};

// Formulario para registrar un faltante nuevo, o editar uno existente
// Recibo productos y sucursales ya cargados desde la página padre, onCrear/onEditar para avisar cuando se envía,
// y faltanteEditando (o null) para saber si el formulario debe comportarse como edición
export default function FaltanteForm({ productos, sucursales, onCrear, onEditar, faltanteEditando, onCancelarEdicion }) {
  // Guardo todos los campos del formulario en un solo estado
  const [form, setForm] = useState(FORM_VACIO);
  // Controla el estado de "enviando" para deshabilitar el botón mientras se procesa
  const [enviando, setEnviando] = useState(false);

  // Texto que uso quiero mostrar cuando una sucursal no tiene zona asignada
  const SIN_ZONA = 'Sin zona';

  // Líneas de producto oficiales de COHORSIL (mismas que el ERP), fijas para que estén
  // disponibles desde el día uno aunque todavía no haya productos cargados en esa categoría
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

  // Filtro los productos según la categoría elegida, así el select de producto se actualiza en cascada
  const productosFiltrados = useMemo(
    () => productos.filter((p) => p.categoria === form.categoria),
    [productos, form.categoria],
  );

  // Igual que categorías, pero para las zonas de las sucursales
  const zonas = useMemo(
    () => [...new Set(sucursales.map((s) => s.zona || SIN_ZONA))].sort(),
    [sucursales],
  );

  // Filtro las sucursales según la zona elegida
  const sucursalesFiltradas = useMemo(
    () => sucursales.filter((s) => (s.zona || SIN_ZONA) === form.zona),
    [sucursales, form.zona],
  );

  // Cuando eligen "Editar" un faltante en la tabla, relleno el formulario con sus datos.
  // La vista de faltantes solo trae el código de producto y el nombre de sucursal (no sus ids),
  // así que los busco en las listas de productos/sucursales que ya tengo cargadas
  useEffect(() => {
    if (!faltanteEditando) {
      setForm(FORM_VACIO);
      return;
    }
    const producto = productos.find((p) => p.codigo === faltanteEditando.producto_codigo);
    const sucursal = sucursales.find((s) => s.nombre === faltanteEditando.sucursal);
    setForm({
      categoria: producto?.categoria || '',
      producto_id: producto ? String(producto.id) : '',
      zona: sucursal?.zona || SIN_ZONA,
      sucursal_id: sucursal ? String(sucursal.id) : '',
      cantidad_solicitada: faltanteEditando.cantidad_solicitada,
      cliente_nombre: faltanteEditando.cliente_nombre || '',
      observaciones: faltanteEditando.observaciones || '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faltanteEditando]);

  // Manejador genérico para todos los inputs/selects del formulario
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      // Si cambio la categoría, limpio el producto seleccionado porque ya no aplica
      ...(name === 'categoria' ? { producto_id: '' } : {}),
      // Si cambio la zona, limpio la sucursal seleccionada por la misma razón
      ...(name === 'zona' ? { sucursal_id: '' } : {}),
    }));
  }

  // Se ejecuta cuando envío el formulario, ya sea para crear un faltante nuevo o guardar la edición de uno existente
  async function handleSubmit(e) {
    // Evito que el navegador recargue la página, como hace por defecto en un submit
    e.preventDefault();
    setEnviando(true);
    try {
      // Convierto a número los ids y la cantidad antes de mandarlos al backend
      const payload = {
        producto_id: Number(form.producto_id),
        sucursal_id: Number(form.sucursal_id),
        cantidad_solicitada: Number(form.cantidad_solicitada),
        cliente_nombre: form.cliente_nombre,
        observaciones: form.observaciones,
      };

      if (faltanteEditando) {
        await onEditar(faltanteEditando.faltante_id, payload);
        // Salgo del modo edición; el useEffect de arriba se encarga de vaciar el formulario
        onCancelarEdicion();
      } else {
        await onCrear(payload);
        // Si se creó bien, limpio el formulario para que quede listo para un registro nuevo
        setForm(FORM_VACIO);
      }
    } finally {
      // Pase lo que pase, quito el estado de "enviando" al terminar
      setEnviando(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>{faltanteEditando ? 'Editar faltante' : 'Registrar producto no disponible'}</h2>
      <div className="form-grid">
        {/* Primer select: categoría. Al elegirla se habilita el select de producto */}
        <div className="field">
          <label htmlFor="categoria">Categoría</label>
          <select id="categoria" name="categoria" value={form.categoria} onChange={handleChange} required>
            <option value="" disabled>
              Selecciona una categoría
            </option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Select de producto, deshabilitado hasta que se elija una categoría, y filtrado según esa categoría */}
        <div className="field">
          <label htmlFor="producto_id">Producto</label>
          <select
            id="producto_id"
            name="producto_id"
            value={form.producto_id}
            onChange={handleChange}
            disabled={!form.categoria}
            required
          >
            <option value="" disabled>
              {form.categoria ? 'Selecciona un producto' : 'Primero elige una categoría'}
            </option>
            {productosFiltrados.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Mismo patrón en cascada, pero para zona -> sucursal */}
        <div className="field">
          <label htmlFor="zona">Zona</label>
          <select id="zona" name="zona" value={form.zona} onChange={handleChange} required>
            <option value="" disabled>
              Selecciona una zona
            </option>
            {zonas.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="sucursal_id">Sucursal</label>
          <select
            id="sucursal_id"
            name="sucursal_id"
            value={form.sucursal_id}
            onChange={handleChange}
            disabled={!form.zona}
            required
          >
            <option value="" disabled>
              {form.zona ? 'Selecciona una sucursal' : 'Primero elige una zona'}
            </option>
            {sucursalesFiltradas.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Cantidad solicitada, obligatoria y mínimo 1 */}
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

        {/* Nombre del cliente, este campo es opcional */}
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

        {/* Observaciones libres, ocupa todo el ancho de la fila con gridColumn: '1 / -1' */}
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

        {/* Botones de enviar (y cancelar si estoy editando), se deshabilita mientras se procesa para evitar doble clic */}
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
