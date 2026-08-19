import api from './api';

export async function reportePorProducto() {
  const { data } = await api.get('/reportes/por-producto');
  return data;
}

export async function reportePorSucursal() {
  const { data } = await api.get('/reportes/por-sucursal');
  return data;
}

export async function reportePendientes() {
  const { data } = await api.get('/reportes/pendientes');
  return data;
}

export async function reporteTiempoResolucion() {
  const { data } = await api.get('/reportes/tiempo-resolucion');
  return data;
}

// blob porque el PDF va protegido por el token JWT, no puede ser un <a href> simple
export async function generarReportePdf({ tipo, desde, hasta }) {
  const { data } = await api.get('/reportes/pdf', { params: { tipo, desde, hasta }, responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'reporte-negocio.pdf';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

// mismo tema del blob que el PDF de arriba
export async function generarReporteExcel({ desde, hasta }) {
  const { data } = await api.get('/reportes/excel', {
    params: { desde, hasta },
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(
    new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = `reporte-negocio_${desde}_a_${hasta}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
