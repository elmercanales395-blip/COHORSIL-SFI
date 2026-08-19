const reporteModel = require('../models/reporte.model');
const reporteService = require('../services/reporte.service');

async function porProducto(req, res) {
  try {
    const data = await reporteModel.porProducto();
    res.json(data);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener reporte por producto', error: err.message });
  }
}

async function porSucursal(req, res) {
  try {
    const data = await reporteModel.porSucursal();
    res.json(data);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener reporte por sucursal', error: err.message });
  }
}

async function pendientes(req, res) {
  try {
    const data = await reporteModel.pendientes();
    res.json(data);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener faltantes pendientes', error: err.message });
  }
}

async function tiempoResolucion(req, res) {
  try {
    const data = await reporteModel.tiempoResolucion();
    res.json(data);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener tiempo de resolución promedio', error: err.message });
  }
}

// Si no viene desde/hasta en el query string, usa el mes actual por defecto
function rangoDesdeQuery(query) {
  const hoy = new Date();
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().slice(0, 10);
  const hoyStr = hoy.toISOString().slice(0, 10);
  return { desde: query.desde || primerDiaMes, hasta: query.hasta || hoyStr };
}

// ?tipo=resumen|detalle&desde=&hasta= -- detalle agrega las 4 tablas, resumen solo KPIs/gráficas
async function reportesPdf(req, res) {
  try {
    const tipo = req.query.tipo === 'detalle' ? 'detalle' : 'resumen';
    const { desde, hasta } = rangoDesdeQuery(req.query);
    await reporteService.enviarReportePdf(res, { tipo, desde, hasta });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al generar el reporte', error: err.message });
  }
}

// el Excel no tiene modo "resumen" como el PDF, siempre trae todas las hojas (es para analizar, no para imprimir)
async function reportesExcel(req, res) {
  try {
    const { desde, hasta } = rangoDesdeQuery(req.query);
    await reporteService.enviarReporteExcel(res, { desde, hasta });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al generar el reporte en Excel', error: err.message });
  }
}

module.exports = { porProducto, porSucursal, pendientes, tiempoResolucion, reportesPdf, reportesExcel };
