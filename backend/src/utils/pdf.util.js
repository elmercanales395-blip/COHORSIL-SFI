const PDFDocument = require('pdfkit');

// Dibuja una sección de tabla (título + encabezados + filas) dentro de un doc ya abierto,
// con salto de página automático si las filas no caben. Cada reporte del PDF combinado
// es una de estas secciones, una tras otra.
function dibujarTabla(doc, { titulo, columnas, filas }) {
  doc.fontSize(16).fillColor('#000').text(titulo);
  doc.moveDown(0.3);
  doc.fontSize(9).fillColor('#555').text(`Generado el ${new Date().toLocaleString('es-GT')}`);
  doc.moveDown(0.8);
  doc.fillColor('#000');

  const startX = doc.page.margins.left;
  const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const colWidth = usableWidth / columnas.length;
  const rowHeight = 20;

  function dibujarFila(y, valores, esEncabezado) {
    doc.font(esEncabezado ? 'Helvetica-Bold' : 'Helvetica').fontSize(9);
    valores.forEach((valor, i) => {
      doc.text(String(valor ?? '—'), startX + i * colWidth, y, {
        width: colWidth - 5,
        ellipsis: true,
      });
    });
  }

  let y = doc.y;
  dibujarFila(y, columnas.map((c) => c.label), true);
  y += rowHeight;
  doc.moveTo(startX, y - 5).lineTo(startX + usableWidth, y - 5).strokeColor('#ccc').stroke();

  if (filas.length === 0) {
    doc.font('Helvetica').fontSize(9).text('No hay datos para este reporte.', startX, y);
  }

  filas.forEach((fila) => {
    if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      y = doc.page.margins.top;
      dibujarFila(y, columnas.map((c) => c.label), true);
      y += rowHeight;
    }
    const valores = columnas.map((c) => (c.format ? c.format(fila[c.key]) : fila[c.key]));
    dibujarFila(y, valores, false);
    y += rowHeight;
  });
}

// Genera un solo PDF con los 4 reportes juntos, cada uno en su propia página, y lo escribe
// directo en la respuesta HTTP
function generarPdfReportes(res, { secciones, nombreArchivo }) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);

  const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
  doc.pipe(res);

  secciones.forEach((seccion, i) => {
    if (i > 0) doc.addPage();
    dibujarTabla(doc, seccion);
  });

  doc.end();
}

module.exports = { generarPdfReportes };
