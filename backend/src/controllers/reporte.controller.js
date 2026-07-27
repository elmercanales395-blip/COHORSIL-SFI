const reporteModel = require('../models/reporte.model');
const { generarPdfReportes } = require('../utils/pdf.util');

// Reporte: cuántas veces se ha reportado cada producto como faltante
async function porProducto(req, res) {
  try {
    const data = await reporteModel.porProducto();
    res.json(data);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener reporte por producto', error: err.message });
  }
}

// Reporte: total de faltantes agrupados por sucursal
async function porSucursal(req, res) {
  try {
    const data = await reporteModel.porSucursal();
    res.json(data);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener reporte por sucursal', error: err.message });
  }
}

// Reporte: faltantes que aún no se han resuelto, ordenados por antigüedad
async function pendientes(req, res) {
  try {
    const data = await reporteModel.pendientes();
    res.json(data);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener faltantes pendientes', error: err.message });
  }
}

// Reporte: promedio de días que se tarda en resolver un faltante
async function tiempoResolucion(req, res) {
  try {
    const data = await reporteModel.tiempoResolucion();
    res.json(data);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener tiempo de resolución promedio', error: err.message });
  }
}

// Un solo PDF con los 4 reportes juntos (uno por página), usando las mismas columnas
// que ya se muestran en cada tabla del frontend
async function reportesPdf(req, res) {
  try {
    const [porProductoData, porSucursalData, pendientesData, tiempoResolucionData] = await Promise.all([
      reporteModel.porProducto(),
      reporteModel.porSucursal(),
      reporteModel.pendientes(),
      reporteModel.tiempoResolucion(),
    ]);

    generarPdfReportes(res, {
      nombreArchivo: 'reportes-faltantes.pdf',
      secciones: [
        {
          titulo: 'Faltantes pendientes',
          filas: pendientesData,
          columnas: [
            { key: 'producto_nombre', label: 'Producto' },
            { key: 'sucursal', label: 'Sucursal' },
            { key: 'cantidad_solicitada', label: 'Cant.' },
            { key: 'cliente_nombre', label: 'Cliente' },
            { key: 'fecha_registro', label: 'Reportado el', format: (v) => new Date(v).toLocaleString('es-GT') },
            { key: 'dias_transcurridos', label: 'Días esperando' },
          ],
        },
        {
          titulo: 'Faltantes por producto',
          filas: porProductoData,
          columnas: [
            { key: 'codigo', label: 'Código' },
            { key: 'producto', label: 'Producto' },
            { key: 'categoria', label: 'Categoría' },
            { key: 'veces_reportado', label: 'Veces reportado' },
            { key: 'unidades_solicitadas', label: 'Unidades solicitadas' },
            { key: 'pendientes', label: 'Pendientes' },
          ],
        },
        {
          titulo: 'Faltantes por sucursal',
          filas: porSucursalData,
          columnas: [
            { key: 'sucursal', label: 'Sucursal' },
            { key: 'total_faltantes', label: 'Total' },
            { key: 'pendientes', label: 'Pendientes' },
            { key: 'resueltos', label: 'Resueltos' },
          ],
        },
        {
          titulo: 'Tiempo promedio de resolución',
          filas: tiempoResolucionData,
          columnas: [
            { key: 'producto', label: 'Producto' },
            { key: 'faltantes_resueltos', label: 'Faltantes resueltos' },
            { key: 'promedio_dias_resolucion', label: 'Promedio de días' },
          ],
        },
      ],
    });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al generar el PDF de reportes', error: err.message });
  }
}

module.exports = { porProducto, porSucursal, pendientes, tiempoResolucion, reportesPdf };
