const cron = require('node-cron');
const reporteService = require('../services/reporte.service');
const emailService = require('../services/email.service');

// el job corre el día 1, así que "mes anterior" es siempre el que se acaba de cerrar
function calcularMesAnterior() {
  const hoy = new Date();
  const primerDia = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1).toISOString().slice(0, 10);
  const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth(), 0).toISOString().slice(0, 10);
  return { primerDia, ultimoDia };
}

// se exporta aparte del cron para poder probarla a mano si hace falta
async function enviarReporteMensual() {
  const { primerDia, ultimoDia } = calcularMesAnterior();
  try {
    const [pdfBuffer, excelBuffer] = await Promise.all([
      reporteService.generarReportePdfBuffer({ tipo: 'detalle', desde: primerDia, hasta: ultimoDia }),
      reporteService.generarReporteExcelBuffer({ desde: primerDia, hasta: ultimoDia }),
    ]);
    await emailService.enviarReporteMensual({ pdfBuffer, excelBuffer, desde: primerDia, hasta: ultimoDia });
    console.log(`Reporte mensual (${primerDia} a ${ultimoDia}) generado y enviado por correo.`);
  } catch (err) {
    console.error('Error al generar/enviar el reporte mensual automático:', err.message);
  }
}

// 6am le da margen a que el último día del mes anterior ya tenga todo registrado
function iniciarJobReporteMensual() {
  cron.schedule('0 6 1 * *', enviarReporteMensual, { timezone: 'America/Tegucigalpa' });
  console.log('Job de reporte mensual programado: día 1 de cada mes, 6:00am (America/Tegucigalpa).');
}

module.exports = { iniciarJobReporteMensual, enviarReporteMensual };
