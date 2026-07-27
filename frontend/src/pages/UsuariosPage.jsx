import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import * as authService from '../services/auth.service';

// Página solo para administradores: ver quién tiene cuenta, buscar, crear, editar y eliminar cuentas
export default function UsuariosPage() {
  const { usuario } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [enviando, setEnviando] = useState(false);
  // Texto de búsqueda por nombre
  const [busqueda, setBusqueda] = useState('');
  // Id del usuario que se está editando (null cuando el formulario es para crear uno nuevo)
  const [editandoId, setEditandoId] = useState(null);

  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'vendedor' });

  // Filtro en el frontend según el nombre que escribió el admin en la barra de búsqueda
  const usuariosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return usuarios;
    return usuarios.filter((u) => u.nombre?.toLowerCase().includes(texto));
  }, [usuarios, busqueda]);

  async function cargarUsuarios() {
    setError('');
    try {
      const data = await authService.listarUsuarios();
      setUsuarios(data);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudieron cargar los usuarios');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarUsuarios();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setExito('');
    setEnviando(true);
    try {
      if (editandoId) {
        await authService.actualizarUsuario(editandoId, form);
        setExito(`Usuario ${form.nombre} actualizado.`);
        cancelarEdicion();
      } else {
        await authService.registrar(form.nombre, form.email, form.password, form.rol);
        setExito(`Cuenta creada para ${form.nombre}.`);
        setForm({ nombre: '', email: '', password: '', rol: 'vendedor' });
      }
      await cargarUsuarios();
    } catch (err) {
      setError(err.response?.data?.mensaje || (editandoId ? 'No se pudo actualizar el usuario' : 'No se pudo crear el usuario'));
    } finally {
      setEnviando(false);
    }
  }

  // Pone los datos del usuario elegido en el formulario para editarlo (la contraseña queda vacía: solo se cambia si escriben una nueva)
  function handleEditar(u) {
    setError('');
    setExito('');
    setEditandoId(u.id);
    setForm({ nombre: u.nombre, email: u.email, password: '', rol: u.rol });
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setForm({ nombre: '', email: '', password: '', rol: 'vendedor' });
  }

  async function handleEliminar(u) {
    if (!window.confirm(`¿Eliminar la cuenta de "${u.nombre}"?`)) return;
    setError('');
    setExito('');
    try {
      await authService.eliminarUsuario(u.id);
      setExito(`Cuenta de ${u.nombre} eliminada.`);
      if (editandoId === u.id) cancelarEdicion();
      await cargarUsuarios();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo eliminar el usuario');
    }
  }

  // Si el usuario logueado no es admin, lo saco de esta página y lo mando al inicio
  if (usuario?.rol !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Navbar />
      <main className="app-content">
        <form className="card" onSubmit={handleSubmit}>
          <h2>{editandoId ? 'Editar usuario' : 'Crear usuario'}</h2>
          {error && <p className="error-text">{error}</p>}
          {exito && <p className="success-text">{exito}</p>}
          <div className="form-grid">
            <div className="field">
              <label htmlFor="nombre">Nombre</label>
              <input id="nombre" name="nombre" type="text" value={form.nombre} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="email">Correo</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="password">Contraseña{editandoId && ' (dejar en blanco para no cambiarla)'}</label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                minLength={6}
                required={!editandoId}
              />
            </div>
            <div className="field">
              <label htmlFor="rol">Rol</label>
              <select id="rol" name="rol" value={form.rol} onChange={handleChange} required>
                <option value="vendedor">Vendedor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-primary" type="submit" disabled={enviando}>
                {enviando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear usuario'}
              </button>
              {editandoId && (
                <button className="btn-action" type="button" onClick={cancelarEdicion}>
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </form>

        <section className="card">
          <h2>Usuarios registrados</h2>
          <div className="form-grid" style={{ marginBottom: '1rem' }}>
            <div className="field">
              <label htmlFor="busqueda">Buscar por nombre</label>
              <input
                id="busqueda"
                type="text"
                placeholder="Ej. Vendedor Prueba"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          {cargando ? (
            <p className="empty-state">Cargando...</p>
          ) : usuarios.length === 0 ? (
            <p className="empty-state">No hay usuarios registrados.</p>
          ) : usuariosFiltrados.length === 0 ? (
            <p className="empty-state">Ningún usuario coincide con la búsqueda.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((u) => (
                  <tr key={u.id}>
                    <td>{u.nombre}</td>
                    <td>{u.email}</td>
                    <td>{u.rol}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-action info" onClick={() => handleEditar(u)}>
                          Editar
                        </button>
                        <button
                          className="btn-action eliminar"
                          disabled={String(u.id) === String(usuario.id)}
                          title={String(u.id) === String(usuario.id) ? 'No puedes eliminar tu propia cuenta' : undefined}
                          onClick={() => handleEliminar(u)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </>
  );
}
