import api from './api';

// Cada función de este archivo es solo un envoltorio de una llamada a la API de faltantes
// Así en los componentes/páginas no tengo que escribir la URL ni el método HTTP a cada rato

// Trae todos los faltantes activos
export async function listarFaltantes() {
  const { data } = await api.get('/faltantes');
  return data;
}

// Crea un faltante nuevo
export async function crearFaltante(payload) {
  const { data } = await api.post('/faltantes', payload);
  return data;
}

// Edita un faltante existente
export async function actualizarFaltante(id, payload) {
  const { data } = await api.put(`/faltantes/${id}`, payload);
  return data;
}

// Marca un faltante como resuelto
export async function resolverFaltante(id) {
  const { data } = await api.patch(`/faltantes/${id}/resolver`);
  return data;
}

// Elimina un faltante (borrado lógico), no necesito devolver nada, solo confirmar que se hizo
export async function eliminarFaltante(id) {
  await api.delete(`/faltantes/${id}`);
}

// Trae los faltantes eliminados (solo lo puede usar un admin, el backend valida el rol)
export async function listarFaltantesEliminados() {
  const { data } = await api.get('/faltantes/eliminados');
  return data;
}

// Restaura un faltante que había sido eliminado
export async function restaurarFaltante(id) {
  const { data } = await api.patch(`/faltantes/${id}/restaurar`);
  return data;
}

// Elimina un faltante de forma permanente
export async function eliminarFaltanteDefinitivo(id) {
  await api.delete(`/faltantes/${id}/definitivo`);
}

// Trae los productos activos, los uso para el select del formulario
export async function listarProductos() {
  const { data } = await api.get('/productos');
  return data;
}

// Trae las sucursales activas, también para el select del formulario
export async function listarSucursales() {
  const { data } = await api.get('/sucursales');
  return data;
}
