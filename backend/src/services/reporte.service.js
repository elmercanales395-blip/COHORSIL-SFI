const PDFDocument = require('pdfkit');
const faltanteModel = require('../models/faltante.model');
const negocio = require('../utils/negocio.util');
const {
  dibujarTabla,
  dibujarKpis,
  dibujarBarraApilada,
  dibujarBarrasHorizontales,
  dibujarEncabezadoMarca,
  dibujarPiePagina,
} = require('../utils/pdf.util');
const { generarExcelReportes, generarExcelBuffer } = require('../utils/excel.util');

// compartidas entre el PDF y el Excel, para no repetir la definición
const COLUMNAS_COMPETENCIA = [
  { key: 'producto_solicitado', label: 'Producto solicitado' },
  { key: 'casa_comercial', label: 'Casa comercial' },
  { key: 'veces_solicitado', label: 'Veces solicitado' },
  { key: 'unidades_solicitadas', label: 'Unidades solicitadas' },
  { key: 'convertidas', label: 'Ventas convertidas' },
  { key: 'perdidas', label: 'Ventas perdidas' },
];

// punto de partida común del PDF y el Excel, sea desde el endpoint HTTP o el job mensual
async function construirDatosReporte(desde, hasta) {
  const todos = await faltanteModel.listar();
  const filtrados = negocio.filtrarPorRango(todos, desde, hasta);
  const resumen = negocio.calcularResumen(filtrados);
  return { filtrados, resumen };
}

function crearDocumentoPdf() {
  // bufferPages para poder recorrer las páginas al final y ponerles "Página X de Y"
  return new PDFDocument({ margin: { top: 40, bottom: 60, left: 40, right: 40 }, size: 'A4', layout: 'landscape', bufferPages: true });
}

// no hace doc.end(), eso lo decide quien llama según si es streaming HTTP o buffer para el correo
function dibujarReportePdf(doc, { tipo, desde, hasta, filtrados, resumen }) {
  const rangoTexto = `Del ${new Date(`${desde}T00:00:00`).toLocaleDateString('es-GT')} al ${new Date(`${hasta}T00:00:00`).toLocaleDateString('es-GT')} · Generado el ${new Date().toLocaleString('es-GT')}`;
  dibujarEncabezadoMarca(doc, { titulo: 'Inteligencia de negocio', subtitulo: rangoTexto });

  let y = doc.y;

  y = dibujarKpis(doc, y, [
    { label: 'Total en el rango', valor: resumen.total, color: '#0f4c81' },
    { label: 'Pendientes', valor: resumen.pendientes, color: '#b8860b' },
    { label: 'Resueltos', valor: resumen.resueltos, color: '#2e7d32' },
  ]);

  y = dibujarBarraApilada(doc, y, 'Distribución por estado', [
    { label: 'Pendiente', value: resumen.pendientes, color: '#c0392b' },
    { label: 'Resuelto', value: resumen.resueltos, color: '#2e7d32' },
  ]);

  // Máximo 12 meses para que la lista de barras no se salga de la página
  dibujarBarrasHorizontales(
    doc,
    y,
    'Tendencia por mes',
    resumen.tendencia.slice(-12).map(([mes, cantidad]) => ({ label: mes, value: cantidad })),
  );

  // esto va siempre, aunque sea "resumen" -- es lo primero que preguntan al cierre de mes
  const porCompetenciaFiltrado = negocio.agruparPorCompetencia(filtrados);
  const ventasDecididas = filtrados.filter((f) => f.resultado_venta).length;
  const perdidas = filtrados.filter((f) => f.resultado_venta === 'perdida').length;
  const pctPerdidas = ventasDecididas > 0 ? Math.round((perdidas / ventasDecididas) * 100) : 0;

  doc.addPage();
  const yCompetencia = dibujarKpis(doc, doc.page.margins.top, [
    { label: 'Consultas de competencia', valor: porCompetenciaFiltrado.reduce((acc, c) => acc + c.veces_solicitado, 0), color: '#0f4c81' },
    { label: 'Marcas distintas pedidas', valor: porCompetenciaFiltrado.length, color: '#0f4c81' },
    { label: 'Ventas perdidas', valor: `${pctPerdidas}%`, color: '#c0392b' },
  ]);
  dibujarBarrasHorizontales(
    doc,
    yCompetencia,
    'Marcas de la competencia más buscadas',
    porCompetenciaFiltrado.slice(0, 10).map((c) => ({
      label: c.casa_comercial ? `${c.producto_solicitado} (${c.casa_comercial})` : c.producto_solicitado,
      value: c.veces_solicitado,
    })),
  );

  if (tipo === 'detalle') {
    const pendientesFiltrados = negocio.listarPendientes(filtrados);
    const porProductoFiltrado = negocio.agruparPorProducto(filtrados);
    const porSucursalFiltrado = negocio.agruparPorSucursal(filtrados);
    const tiempoResolucionFiltrado = negocio.calcularTiempoResolucion(filtrados);

    doc.addPage();
    dibujarTabla(doc, {
      titulo: 'Faltantes pendientes',
      filas: pendientesFiltrados,
      columnas: [
        { key: 'producto_nombre', label: 'Producto' },
        { key: 'sucursal', label: 'Sucursal' },
        { key: 'cantidad_solicitada', label: 'Cant.' },
        { key: 'cliente_nombre', label: 'Cliente' },
        { key: 'fecha_registro', label: 'Reportado el', format: (v) => new Date(v).toLocaleString('es-GT') },
        { key: 'dias_transcurridos', label: 'Días esperando' },
      ],
    });

    doc.addPage();
    dibujarTabla(doc, {
      titulo: 'Faltantes por producto',
      filas: porProductoFiltrado,
      columnas: [
        { key: 'codigo', label: 'Código' },
        { key: 'producto', label: 'Producto' },
        { key: 'categoria', label: 'Categoría' },
        { key: 'veces_reportado', label: 'Veces reportado' },
        { key: 'unidades_solicitadas', label: 'Unidades solicitadas' },
        { key: 'pendientes', label: 'Pendientes' },
      ],
    });

    doc.addPage();
    dibujarTabla(doc, {
      titulo: 'Faltantes por sucursal',
      filas: porSucursalFiltrado,
      columnas: [
        { key: 'sucursal', label: 'Sucursal' },
        { key: 'total_faltantes', label: 'Total' },
        { key: 'pendientes', label: 'Pendientes' },
        { key: 'resueltos', label: 'Resueltos' },
      ],
    });

    doc.addPage();
    dibujarTabla(doc, {
      titulo: 'Tiempo promedio de resolución',
      filas: tiempoResolucionFiltrado,
      columnas: [
        { key: 'producto', label: 'Producto' },
        { key: 'faltantes_resueltos', label: 'Faltantes resueltos' },
        { key: 'promedio_dias_resolucion', label: 'Promedio de días' },
      ],
    });

    doc.addPage();
    dibujarTabla(doc, {
      titulo: 'Faltantes por competencia (marcas externas más buscadas)',
      filas: porCompetenciaFiltrado,
      columnas: COLUMNAS_COMPETENCIA,
    });
  }

  // ya con todas las páginas dibujadas se sabe el total, ahora sí se les pone el pie numerado
  const rango = doc.bufferedPageRange();
  for (let i = rango.start; i < rango.start + rango.count; i += 1) {
    doc.switchToPage(i);
    dibujarPiePagina(doc, i - rango.start + 1, rango.count);
  }
}

function construirHojasExcel({ filtrados, resumen }) {
  const formatoFecha = (v) => new Date(v).toLocaleString('es-GT');

  return [
    {
      nombre: 'Resumen',
      columnas: [
        { key: 'mes', label: 'Mes' },
        { key: 'cantidad', label: 'Cantidad' },
      ],
      filas: [
        { mes: 'Total en el rango', cantidad: resumen.total },
        { mes: 'Pendientes', cantidad: resumen.pendientes },
        { mes: 'Resueltos', cantidad: resumen.resueltos },
        ...resumen.tendencia.map(([mes, cantidad]) => ({ mes, cantidad })),
      ],
    },
    {
      nombre: 'Competencia',
      columnas: COLUMNAS_COMPETENCIA,
      filas: negocio.agruparPorCompetencia(filtrados),
      barras: ['veces_solicitado'],
    },
    {
      nombre: 'Pendientes',
      columnas: [
        { key: 'producto_nombre', label: 'Producto' },
        { key: 'sucursal', label: 'Sucursal' },
        { key: 'cantidad_solicitada', label: 'Cant.' },
        { key: 'cliente_nombre', label: 'Cliente' },
        { key: 'fecha_registro', label: 'Reportado el', format: formatoFecha },
        { key: 'dias_transcurridos', label: 'Días esperando' },
      ],
      filas: negocio.listarPendientes(filtrados),
    },
    {
      nombre: 'Por producto',
      columnas: [
        { key: 'codigo', label: 'Código' },
        { key: 'producto', label: 'Producto' },
        { key: 'categoria', label: 'Categoría' },
        { key: 'veces_reportado', label: 'Veces reportado' },
        { key: 'unidades_solicitadas', label: 'Unidades solicitadas' },
        { key: 'pendientes', label: 'Pendientes' },
      ],
      filas: negocio.agruparPorProducto(filtrados),
      barras: ['veces_reportado'],
    },
    {
      nombre: 'Por sucursal',
      columnas: [
        { key: 'sucursal', label: 'Sucursal' },
        { key: 'total_faltantes', label: 'Total' },
        { key: 'pendientes', label: 'Pendientes' },
        { key: 'resueltos', label: 'Resueltos' },
      ],
      barras: ['total_faltantes'],
      filas: negocio.agruparPorSucursal(filtrados),
    },
    {
      nombre: 'Tiempo de resolución',
      columnas: [
        { key: 'producto', label: 'Producto' },
        { key: 'faltantes_resueltos', label: 'Faltantes resueltos' },
        { key: 'promedio_dias_resolucion', label: 'Promedio de días' },
      ],
      filas: negocio.calcularTiempoResolucion(filtrados),
    },
  ];
}

// streaming directo a la respuesta, no espera a tener todo el PDF en memoria
async function enviarReportePdf(res, { tipo, desde, hasta }) {
  const { filtrados, resumen } = await construirDatosReporte(desde, hasta);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="reporte-negocio.pdf"');

  const doc = crearDocumentoPdf();
  doc.pipe(res);
  dibujarReportePdf(doc, { tipo, desde, hasta, filtrados, resumen });
  doc.end();
}

// este sí junta todo en un Buffer, para el adjunto del correo del job mensual
async function generarReportePdfBuffer({ tipo, desde, hasta }) {
  const { filtrados, resumen } = await construirDatosReporte(desde, hasta);

  const doc = crearDocumentoPdf();
  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));
  const finalizado = new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  dibujarReportePdf(doc, { tipo, desde, hasta, filtrados, resumen });
  doc.end();

  return finalizado;
}

async function enviarReporteExcel(res, { desde, hasta }) {
  const { filtrados, resumen } = await construirDatosReporte(desde, hasta);
  await generarExcelReportes(res, {
    nombreArchivo: `reporte-negocio_${desde}_a_${hasta}.xlsx`,
    hojas: construirHojasExcel({ filtrados, resumen }),
  });
}

async function generarReporteExcelBuffer({ desde, hasta }) {
  const { filtrados, resumen } = await construirDatosReporte(desde, hasta);
  return generarExcelBuffer({ hojas: construirHojasExcel({ filtrados, resumen }) });
}

module.exports = {
  enviarReportePdf,
  enviarReporteExcel,
  generarReportePdfBuffer,
  generarReporteExcelBuffer,
};
