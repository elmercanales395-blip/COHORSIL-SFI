import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import HojaPedidoSelector from '../components/HojaPedidoSelector.jsx';
import * as faltantesService from '../services/faltantes.service';

// Página propia para generar la hoja de pedido/entrega de una sucursal
export default function HojasPedidoPage() {
  const [sucursales, setSucursales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargar() {
      try {
        const data = await faltantesService.listarSucursales();
        setSucursales(data);
      } catch (err) {
        setError(err.response?.data?.mensaje || 'No se pudieron cargar las sucursales');
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  return (
    <>
      <Navbar />
      <main className="app-content">
        {error && <p className="error-text">{error}</p>}
        {cargando ? <p className="empty-state">Cargando...</p> : <HojaPedidoSelector sucursales={sucursales} />}
      </main>
    </>
  );
}
