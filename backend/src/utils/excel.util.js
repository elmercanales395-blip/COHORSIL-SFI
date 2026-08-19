const ExcelJS = require('exceljs');

// misma paleta que pdf.util.js, para que se vea como parte del mismo set de reportes
const COLOR_MARCA = 'FF0F4C81';
const COLOR_BANDA = 'FFF4F6F8';
const COLOR_BORDE = 'FFDDE3E8';

const BORDE_DELGADO = { style: 'thin', color: { argb: COLOR_BORDE } };
const BORDES_CELDA = { top: BORDE_DELGADO, left: BORDE_DELGADO, bottom: BORDE_DELGADO, right: BORDE_DELGADO };

// mismo patrón de columnas { key, label, format } que dibujarTabla en pdf.util.js
// barras: columnas con formato condicional "data bar" -- exceljs no deja meter un gráfico real,
// esto es lo más cercano
function agregarHoja(workbook, { nombre, columnas, filas, barras = [] }) {
  const hoja = workbook.addWorksheet(nombre.slice(0, 31), { // Excel limita el nombre de hoja a 31 caracteres
    views: [{ state: 'frozen', ySplit: 1 }],
    properties: { tabColor: { argb: COLOR_MARCA } },
  });

  hoja.columns = columnas.map((c) => ({ header: c.label, key: c.key, width: Math.max(c.label.length + 4, 14) }));

  const encabezado = hoja.getRow(1);
  encabezado.eachCell((celda) => {
    celda.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_MARCA } };
    celda.alignment = { vertical: 'middle' };
    celda.border = BORDES_CELDA;
  });
  encabezado.height = 20;

  filas.forEach((fila) => {
    const valores = {};
    columnas.forEach((c) => {
      valores[c.key] = c.format ? c.format(fila[c.key]) : fila[c.key];
    });
    hoja.addRow(valores);
  });

  if (filas.length === 0) {
    hoja.addRow({});
    hoja.mergeCells(2, 1, 2, columnas.length);
    hoja.getCell(2, 1).value = 'No hay datos para este reporte.';
    hoja.getCell(2, 1).font = { italic: true, color: { argb: 'FF6B7280' } };
    hoja.getCell(2, 1).border = BORDES_CELDA;
    return hoja;
  }

  // formato de miles solo donde todos los valores son numéricos, para no aplicarlo a texto por accidente
  const columnasNumericas = columnas.filter((c) => filas.every((f) => typeof (c.format ? c.format(f[c.key]) : f[c.key]) === 'number'));
  columnasNumericas.forEach((c) => {
    hoja.getColumn(c.key).numFmt = '#,##0';
  });

  for (let i = 2; i <= filas.length + 1; i += 1) {
    const fila = hoja.getRow(i);
    fila.eachCell({ includeEmpty: true }, (celda) => {
      celda.border = BORDES_CELDA;
      if (i % 2 === 0) celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_BANDA } };
    });
  }

  hoja.autoFilter = { from: { row: 1, column: 1 }, to: { row: filas.length + 1, column: columnas.length } };

  barras.forEach((clave) => {
    const letra = hoja.getColumn(clave).letter;
    hoja.addConditionalFormatting({
      ref: `${letra}2:${letra}${filas.length + 1}`,
      rules: [
        {
          type: 'dataBar',
          gradient: true,
          border: true,
          cfvo: [{ type: 'min' }, { type: 'max' }],
          color: { argb: COLOR_MARCA },
        },
      ],
    });
  });

  return hoja;
}

function construirWorkbook({ hojas }) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SRF - Sistema de Faltantes';
  workbook.created = new Date();

  hojas.forEach((hoja) => agregarHoja(workbook, hoja));

  return workbook;
}

async function generarExcelReportes(res, { nombreArchivo, hojas }) {
  const workbook = construirWorkbook({ hojas });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);

  await workbook.xlsx.write(res);
  res.end();
}

async function generarExcelBuffer({ hojas }) {
  const workbook = construirWorkbook({ hojas });
  return workbook.xlsx.writeBuffer();
}

module.exports = { generarExcelReportes, generarExcelBuffer };
