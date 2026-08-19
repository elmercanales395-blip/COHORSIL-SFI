import { useState } from 'react';
import * as reportesService from '../services/reportes.service';

// formato YYYY-MM-DD, lo que espera un input type="date"
function primerDiaDelMes() {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`;
}
function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function ReporteDocumentos({ onError }) {
  const [tipo, setTipo] = useState('resumen');
  const [desde, setDesde] = useState(primerDiaDelMes());
  const [hasta, setHasta] = useState(hoyISO());
  const [generando, setGenerando] = useState('');

  async function generarReporte() {
    onError('');
    setGenerando('pdf');
    try {
      await reportesService.generarReportePdf({ tipo, desde, hasta });
    } catch (err) {
      onError(err.response?.data?.mensaje || 'No se pudo generar el reporte');
    } finally {
      setGenerando('');
    }
  }

  async function generarExcel() {
    onError('');
    setGenerando('excel');
    try {
      await reportesService.generarReporteExcel({ desde, hasta });
    } catch (err) {
      onError(err.response?.data?.mensaje || 'No se pudo generar el Excel');
    } finally {
      setGenerando('');
    }
  }

  return (
    <div className="bi-panel" style={{ marginBottom: 22 }}>
      <span className="bi-kicker">Documentos</span>
      <h3 className="bi-panel-title">Reportes imprimibles</h3>

      <div className="form-grid">
        <div className="field">
          <label htmlFor="tipo-reporte">Tipo de reporte</label>
          <select id="tipo-reporte" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="resumen">Resumen ejecutivo</option>
            <option value="detalle">Detalle completo</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="reporte-desde">Desde</label>
          <input id="reporte-desde" type="date" value={desde} max={hasta} onChange={(e) => setDesde(e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="reporte-hasta">Hasta</label>
          <input id="reporte-hasta" type="date" value={hasta} min={desde} onChange={(e) => setHasta(e.target.value)} />
        </div>

        <div className="field" style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn-primary" style={{ width: 'auto', flex: 1 }} disabled={!!generando} onClick={generarReporte}>
            {generando === 'pdf' ? 'Generando...' : 'Generar PDF'}
          </button>

          <button type="button" className="btn-primary" style={{ width: 'auto', flex: 1 }} disabled={!!generando} onClick={generarExcel}>
            {generando === 'excel' ? 'Generando...' : 'Generar Excel'}
          </button>
        </div>
      </div>
    </div>
  );
}
