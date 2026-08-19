import { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import FaltanteForm from '../components/FaltanteForm.jsx';
import FaltanteTable from '../components/FaltanteTable.jsx';
import * as faltantesService from '../services/faltantes.service';

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

  useEffect(() => {
    cargarDatos();
  }, []);

  async function handleCrear(payload) {
    await faltantesService.crearFaltante(payload);
    await cargarDatos();
  }

  async function handleEditar(id, payload) {
    await faltantesService.actualizarFaltante(id, payload);
    await cargarDatos();
  }

  async function handleResolver(id) {
    await faltantesService.resolverFaltante(id);
    await cargarDatos();
  }

  // Elimina (borrado lógico), no borra el registro de la base de datos
  async function handleEliminar(id) {
    await faltantesService.eliminarFaltante(id);
    await cargarDatos();
  }

  return (
    <Layout>
        <FaltanteForm
          productos={productos}
          sucursales={sucursales}
          faltantes={faltantes}
          onCrear={handleCrear}
          onEditar={handleEditar}
          faltanteEditando={editando}
          onCancelarEdicion={() => setEditando(null)}
        />

        <section className="card">
          <h2>Faltantes registrados</h2>
          {error && <p className="error-text">{error}</p>}
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
    </Layout>
  );
}
