import api from './api';

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

// Solo un admin logueado puede registrar cuentas nuevas (el backend valida el rol)
export async function registrar(nombre, email, password, rol) {
  const { data } = await api.post('/auth/registro', { nombre, email, password, rol });
  return data;
}

export async function listarUsuarios() {
  const { data } = await api.get('/usuarios');
  return data;
}

export async function actualizarUsuario(id, { nombre, email, rol, password }) {
  const { data } = await api.put(`/usuarios/${id}`, { nombre, email, rol, password });
  return data;
}

export async function eliminarUsuario(id) {
  await api.delete(`/usuarios/${id}`);
}
