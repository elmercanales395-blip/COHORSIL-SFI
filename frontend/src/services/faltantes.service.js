import api from './api';

export async function listarFaltantes() {
  const { data } = await api.get('/faltantes');
  return data;
}

export async function crearFaltante(payload) {
  const { data } = await api.post('/faltantes', payload);
  return data;
}

export async function actualizarFaltante(id, payload) {
  const { data } = await api.put(`/faltantes/${id}`, payload);
  return data;
}

export async function resolverFaltante(id) {
  const { data } = await api.patch(`/faltantes/${id}/resolver`);
  return data;
}

// Borrado lógico: no elimina el registro de la base de datos
export async function eliminarFaltante(id) {
  await api.delete(`/faltantes/${id}`);
}

// Solo lo puede usar un admin, el backend valida el rol
export async function listarFaltantesEliminados() {
  const { data } = await api.get('/faltantes/eliminados');
  return data;
}

export async function restaurarFaltante(id) {
  const { data } = await api.patch(`/faltantes/${id}/restaurar`);
  return data;
}

export async function eliminarFaltanteDefinitivo(id) {
  await api.delete(`/faltantes/${id}/definitivo`);
}

export async function listarProductos() {
  const { data } = await api.get('/productos');
  return data;
}

export async function listarSucursales() {
  const { data } = await api.get('/sucursales');
  return data;
}
