import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import ResumenNegocio from '../components/ResumenNegocio.jsx';
import ReporteDocumentos from '../components/ReporteDocumentos.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import * as faltantesService from '../services/faltantes.service';

// muestra todo lo registrado, sin filtros de fecha ni sucursal - solo admin
export default function ReportesPage() {
  const { usuario } = useAuth();
  const [faltantesTodos, setFaltantesTodos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargar() {
      setError('');
      try {
        const faltantesData = await faltantesService.listarFaltantes();
        setFaltantesTodos(faltantesData);
      } catch (err) {
        setError(err.response?.data?.mensaje || 'No se pudieron cargar los reportes');
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  if (usuario?.rol !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
        <div className="page-header">
          <div>
            <h1>Inteligencia de negocio</h1>
            <p style={{ margin: '2px 0 0', color: 'var(--color-text-muted)', fontSize: 13.5 }}>
              Indicadores operativos por sucursal.
            </p>
          </div>
        </div>
        {error && <p className="error-text">{error}</p>}
        {cargando ? (
          <p className="empty-state">Cargando reportes...</p>
        ) : (
          <>
            <ResumenNegocio faltantes={faltantesTodos} />
            <ReporteDocumentos onError={setError} />
          </>
        )}
    </Layout>
  );
}
