import api from './api';

// Llama al endpoint de login y devuelve el token junto con los datos del usuario
export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

// Llama al endpoint de registro para crear una cuenta nueva (solo un admin logueado puede hacerlo)
export async function registrar(nombre, email, password, rol) {
  const { data } = await api.post('/auth/registro', { nombre, email, password, rol });
  return data;
}

// Trae la lista de usuarios registrados, para la pantalla de gestión de usuarios del admin
export async function listarUsuarios() {
  const { data } = await api.get('/usuarios');
  return data;
}

// Edita un usuario existente (nombre, email, rol y opcionalmente contraseña)
export async function actualizarUsuario(id, { nombre, email, rol, password }) {
  const { data } = await api.put(`/usuarios/${id}`, { nombre, email, rol, password });
  return data;
}

// Elimina un usuario
export async function eliminarUsuario(id) {
  await api.delete(`/usuarios/${id}`);
}
