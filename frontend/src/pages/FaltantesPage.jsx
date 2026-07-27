import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import FaltanteForm from '../components/FaltanteForm.jsx';
import FaltanteTable from '../components/FaltanteTable.jsx';
import * as faltantesService from '../services/faltantes.service';

// Página principal del sistema: aquí se registran y se listan los faltantes activos
export default function FaltantesPage() {
  const [faltantes, setFaltantes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  // Faltante que se está editando (o null si el formulario está en modo "crear")
  const [editando, setEditando] = useState(null);

  // Trae de golpe los faltantes, productos y sucursales, todo en paralelo para que cargue más rápido
  async function cargarDatos() {
    setError('');
    try {
      const [faltantesData, productosData, sucursalesData] = await Promise.all([
        faltantesService.listarFaltantes(),
        faltantesService.listarProductos(),
        faltantesService.listarSucursales(),
      ]);
      setFaltantes(faltantesData);
      setProductos(productosData);
      setSucursales(sucursalesData);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudieron cargar los datos');
    } finally {
      setCargando(false);
    }
  }

  // Cargo los datos una sola vez, apenas se monta la página
  useEffect(() => {
    cargarDatos();
  }, []);

  // Cuando se registra un faltante nuevo desde el formulario, lo guardo y refresco la tabla
  async function handleCrear(payload) {
    await faltantesService.crearFaltante(payload);
    await cargarDatos();
  }

  // Guarda los cambios de un faltante editado y refresca la tabla
  async function handleEditar(id, payload) {
    await faltantesService.actualizarFaltante(id, payload);
    await cargarDatos();
  }

  // Marca un faltante como resuelto y refresca la tabla para reflejar el cambio
  async function handleResolver(id) {
    await faltantesService.resolverFaltante(id);
    await cargarDatos();
  }

  // Elimina (borrado lógico) un faltante y refresca la tabla
  async function handleEliminar(id) {
    await faltantesService.eliminarFaltante(id);
    await cargarDatos();
  }

  return (
    <>
      <Navbar />
      <main className="app-content">
        {/* Formulario para registrar un faltante nuevo, o editar uno existente si "editando" tiene un valor */}
        <FaltanteForm
          productos={productos}
          sucursales={sucursales}
          onCrear={handleCrear}
          onEditar={handleEditar}
          faltanteEditando={editando}
          onCancelarEdicion={() => setEditando(null)}
        />

        <section className="card">
          <h2>Faltantes registrados</h2>
          {error && <p className="error-text">{error}</p>}
          {/* Mientras carga muestro un texto simple, cuando termina muestro la tabla */}
          {cargando ? (
            <p className="empty-state">Cargando...</p>
          ) : (
            <FaltanteTable
              faltantes={faltantes}
              onEditar={setEditando}
              onResolver={handleResolver}
              onEliminar={handleEliminar}
            />
          )}
        </section>
      </main>
    </>
  );
}
