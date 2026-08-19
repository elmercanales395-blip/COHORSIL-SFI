const PDFDocument = require('pdfkit');

// paleta de marca COHORSIL: azul para encabezados, grises para bandas/bordes/texto secundario
const COLOR_MARCA = '#0f4c81';
const COLOR_BANDA = '#f4f6f8';
const COLOR_BORDE = '#dde3e8';
const COLOR_TEXTO_MUTED = '#6b7280';

// header con el badge "CH", solo se dibuja en la primera página
function dibujarEncabezadoMarca(doc, { titulo, subtitulo }) {
  const startX = doc.page.margins.left;
  const y = doc.page.margins.top;

  doc.roundedRect(startX, y, 34, 34, 6).fill(COLOR_MARCA);
  doc.fillColor('#fff').font('Helvetica-Bold').fontSize(14).text('CH', startX, y + 10, { width: 34, align: 'center' });
  doc.fillColor(COLOR_MARCA).font('Helvetica-Bold').fontSize(9).text('COHORSIL', startX, y + 38, { width: 34, align: 'center' });

  const textX = startX + 48;
  doc.fillColor('#1f2937').font('Helvetica-Bold').fontSize(20).text(titulo, textX, y);
  doc.fillColor(COLOR_TEXTO_MUTED).font('Helvetica').fontSize(10).text(subtitulo, textX, doc.y + 2);

  const lineY = y + 56;
  doc
    .moveTo(startX, lineY)
    .lineTo(doc.page.width - doc.page.margins.right, lineY)
    .strokeColor(COLOR_MARCA)
    .lineWidth(1.5)
    .stroke();

  doc.y = lineY + 16;
  doc.lineWidth(1);
}

function dibujarPiePagina(doc, pagina, totalPaginas) {
  const startX = doc.page.margins.left;
  const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const y = doc.page.height - doc.page.margins.bottom + 18;

  doc.moveTo(startX, y).lineTo(startX + usableWidth, y).strokeColor(COLOR_BORDE).lineWidth(1).stroke();

  doc
    .fillColor(COLOR_TEXTO_MUTED)
    .font('Helvetica')
    .fontSize(8)
    .text('COHORSIL · Sistema de Faltantes', startX, y + 6, { width: usableWidth / 2 })
    .text(`Página ${pagina} de ${totalPaginas}`, startX, y + 6, { width: usableWidth, align: 'right' });
}

// con salto de página automático si las filas no caben
function dibujarTabla(doc, { titulo, columnas, filas }) {
  doc.fillColor(COLOR_MARCA).font('Helvetica-Bold').fontSize(16).text(titulo);
  doc.moveDown(0.3);
  doc.fillColor(COLOR_TEXTO_MUTED).font('Helvetica').fontSize(9).text(`Generado el ${new Date().toLocaleString('es-GT')}`);
  doc.moveDown(0.8);

  const startX = doc.page.margins.left;
  const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const colWidth = usableWidth / columnas.length;
  const rowHeight = 20;

  function dibujarEncabezadoFila(y) {
    doc.rect(startX, y - 4, usableWidth, rowHeight).fill(COLOR_MARCA);
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#fff');
    columnas.forEach((c, i) => {
      doc.text(c.label, startX + i * colWidth + 6, y, { width: colWidth - 10, ellipsis: true });
    });
  }

  function dibujarFilaDatos(y, valores, banda) {
    if (banda) doc.rect(startX, y - 4, usableWidth, rowHeight).fill(COLOR_BANDA);
    doc.font('Helvetica').fontSize(9).fillColor('#1f2937');
    valores.forEach((valor, i) => {
      doc.text(String(valor ?? '—'), startX + i * colWidth + 6, y, { width: colWidth - 10, ellipsis: true });
    });
    doc
      .moveTo(startX, y + rowHeight - 4)
      .lineTo(startX + usableWidth, y + rowHeight - 4)
      .strokeColor(COLOR_BORDE)
      .lineWidth(0.5)
      .stroke();
  }

  let y = doc.y;
  dibujarEncabezadoFila(y);
  y += rowHeight;

  if (filas.length === 0) {
    doc.font('Helvetica').fontSize(9).fillColor(COLOR_TEXTO_MUTED).text('No hay datos para este reporte.', startX + 6, y);
  }

  filas.forEach((fila, i) => {
    if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      y = doc.page.margins.top;
      dibujarEncabezadoFila(y);
      y += rowHeight;
    }
    const valores = columnas.map((c) => (c.format ? c.format(fila[c.key]) : fila[c.key]));
    dibujarFilaDatos(y, valores, i % 2 === 1);
    y += rowHeight;
  });
}

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

function dibujarKpis(doc, y, kpis) {
  const startX = doc.page.margins.left;
  const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const gap = 14;
  const boxW = (usableWidth - gap * (kpis.length - 1)) / kpis.length;
  const boxH = 56;

  kpis.forEach((k, i) => {
    const x = startX + i * (boxW + gap);
    doc.roundedRect(x, y, boxW, boxH, 4).fillAndStroke(COLOR_BANDA, COLOR_BORDE);
    doc.rect(x, y, 4, boxH).fill(k.color || COLOR_MARCA);
    doc.fillColor(COLOR_TEXTO_MUTED).font('Helvetica-Bold').fontSize(8).text(k.label.toUpperCase(), x + 14, y + 10, { width: boxW - 24 });
    doc.fillColor('#1f2937').font('Helvetica-Bold').fontSize(20).text(String(k.valor), x + 14, y + 24, { width: boxW - 24 });
  });
  doc.font('Helvetica');

  return y + boxH + 24;
}

// barra apilada tipo pendiente/resuelto, con leyenda debajo
function dibujarBarraApilada(doc, y, titulo, segmentos) {
  const startX = doc.page.margins.left;
  const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const barH = 20;
  const total = segmentos.reduce((acc, s) => acc + s.value, 0);

  doc.fillColor('#000').font('Helvetica-Bold').fontSize(13).text(titulo, startX, y);
  let cursorY = y + 22;

  doc.roundedRect(startX, cursorY, usableWidth, barH, 4).fill(COLOR_BANDA);
  let x = startX;
  segmentos.forEach((s) => {
    const w = total > 0 ? (s.value / total) * usableWidth : 0;
    if (w > 0.5) doc.rect(x, cursorY, w, barH).fill(s.color);
    x += w;
  });
  cursorY += barH + 12;

  segmentos.forEach((s) => {
    const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
    doc.circle(startX + 4, cursorY + 4, 4).fill(s.color);
    doc
      .fillColor('#1f2937')
      .font('Helvetica')
      .fontSize(10)
      .text(`${s.label}: ${s.value} (${pct}%)`, startX + 16, cursorY);
    cursorY += 18;
  });

  return cursorY + 10;
}

function dibujarBarrasHorizontales(doc, y, titulo, items) {
  const startX = doc.page.margins.left;
  const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const labelW = 170;
  const trackX = startX + labelW;
  const trackW = usableWidth - labelW - 50;
  const rowH = 22;
  const maximo = Math.max(1, ...items.map((i) => i.value));

  doc.fillColor('#000').font('Helvetica-Bold').fontSize(13).text(titulo, startX, y);
  let cursorY = y + 22;

  if (items.length === 0) {
    doc.font('Helvetica').fontSize(10).fillColor(COLOR_TEXTO_MUTED).text('No hay datos para este rango.', startX, cursorY);
    return cursorY + 18;
  }

  items.forEach((item) => {
    doc.fillColor('#1f2937').font('Helvetica').fontSize(9).text(item.label, startX, cursorY + 4, { width: labelW - 8, ellipsis: true });
    const w = (item.value / maximo) * trackW;
    doc.roundedRect(trackX, cursorY, trackW, 14, 3).fill(COLOR_BANDA);
    if (w > 0.5) doc.roundedRect(trackX, cursorY, w, 14, 3).fill(COLOR_MARCA);
    doc.fillColor('#1f2937').font('Helvetica-Bold').fontSize(9).text(String(item.value), trackX + trackW + 8, cursorY + 3);
    cursorY += rowH;
  });

  return cursorY + 10;
}

module.exports = {
  generarPdfReportes,
  dibujarTabla,
  dibujarKpis,
  dibujarBarraApilada,
  dibujarBarrasHorizontales,
  dibujarEncabezadoMarca,
  dibujarPiePagina,
};
