import api from './api';

// Igual que faltantes.service.js, cada función solo envuelve una llamada a un endpoint de reportes

// Reporte de faltantes agrupados por producto
export async function reportePorProducto() {
  const { data } = await api.get('/reportes/por-producto');
  return data;
}

// Reporte de faltantes agrupados por sucursal
export async function reportePorSucursal() {
  const { data } = await api.get('/reportes/por-sucursal');
  return data;
}

// Reporte de los faltantes que siguen pendientes
export async function reportePendientes() {
  const { data } = await api.get('/reportes/pendientes');
  return data;
}

// Reporte del tiempo promedio de resolución
export async function reporteTiempoResolucion() {
  const { data } = await api.get('/reportes/tiempo-resolucion');
  return data;
}

// Descarga un solo PDF con los 4 reportes y dispara el guardado en el navegador.
// Pido la respuesta como blob porque el PDF va protegido por el token JWT (no puede ser un <a href> simple).
export async function descargarReportesPdf() {
  const { data } = await api.get('/reportes/pdf', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'reportes-faltantes.pdf';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
