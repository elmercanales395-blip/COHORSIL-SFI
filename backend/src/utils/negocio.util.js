// todo esto es en JS y no en las vistas de SQL Server, así se puede filtrar por cualquier rango
// sin andar parametrizando cada vista

const { calcularResumen } = require('../../../shared/negocio.util.mjs');

function filtrarPorRango(faltantes, desde, hasta) {
  const inicio = new Date(`${desde}T00:00:00`);
  const fin = new Date(`${hasta}T23:59:59.999`);
  return faltantes.filter((f) => {
    const fecha = new Date(f.fecha_registro);
    return fecha >= inicio && fecha <= fin;
  });
}

function agruparPorProducto(faltantes) {
  const porProducto = new Map();
  faltantes.forEach((f) => {
    const clave = f.producto_codigo || f.producto_nombre;
    const actual = porProducto.get(clave) || {
      codigo: f.producto_codigo,
      producto: f.producto_nombre,
      categoria: f.categoria,
      veces_reportado: 0,
      unidades_solicitadas: 0,
      pendientes: 0,
    };
    actual.veces_reportado += 1;
    actual.unidades_solicitadas += f.cantidad_solicitada;
    if (f.estado === 'pendiente') actual.pendientes += 1;
    porProducto.set(clave, actual);
  });
  return [...porProducto.values()].sort((a, b) => b.veces_reportado - a.veces_reportado);
}

// equivalente en JS a vw_FaltantesPorSucursal
function agruparPorSucursal(faltantes) {
  const porSucursal = new Map();
  faltantes.forEach((f) => {
    const actual = porSucursal.get(f.sucursal) || { sucursal: f.sucursal, total_faltantes: 0, pendientes: 0, resueltos: 0 };
    actual.total_faltantes += 1;
    if (f.estado === 'pendiente') actual.pendientes += 1;
    else actual.resueltos += 1;
    porSucursal.set(f.sucursal, actual);
  });
  return [...porSucursal.values()].sort((a, b) => b.total_faltantes - a.total_faltantes);
}

function calcularTiempoResolucion(faltantes) {
  const porProducto = new Map();
  faltantes
    .filter((f) => f.estado === 'resuelto')
    .forEach((f) => {
      const clave = f.producto_codigo || f.producto_nombre;
      const actual = porProducto.get(clave) || { producto: f.producto_nombre, faltantes_resueltos: 0, sumaDias: 0 };
      actual.faltantes_resueltos += 1;
      actual.sumaDias += f.dias_transcurridos;
      porProducto.set(clave, actual);
    });
  return [...porProducto.values()]
    .map((p) => ({
      producto: p.producto,
      faltantes_resueltos: p.faltantes_resueltos,
      promedio_dias_resolucion: Math.round((p.sumaDias / p.faltantes_resueltos) * 10) / 10,
    }))
    .sort((a, b) => b.promedio_dias_resolucion - a.promedio_dias_resolucion);
}

function listarPendientes(faltantes) {
  return faltantes.filter((f) => f.estado === 'pendiente').sort((a, b) => new Date(a.fecha_registro) - new Date(b.fecha_registro));
}

// ranking de marcas de la competencia (producto_solicitado = texto libre cuando producto_id es NULL)
function agruparPorCompetencia(faltantes) {
  const porCompetencia = new Map();
  faltantes
    .filter((f) => f.producto_solicitado)
    .forEach((f) => {
      const clave = f.producto_solicitado;
      const actual = porCompetencia.get(clave) || {
        producto_solicitado: f.producto_solicitado,
        casa_comercial: f.casa_comercial,
        veces_solicitado: 0,
        unidades_solicitadas: 0,
        convertidas: 0,
        perdidas: 0,
      };
      actual.veces_solicitado += 1;
      actual.unidades_solicitadas += f.cantidad_solicitada;
      if (f.resultado_venta === 'convertida') actual.convertidas += 1;
      if (f.resultado_venta === 'perdida') actual.perdidas += 1;
      porCompetencia.set(clave, actual);
    });
  return [...porCompetencia.values()].sort((a, b) => b.veces_solicitado - a.veces_solicitado);
}

module.exports = {
  filtrarPorRango,
  calcularResumen,
  agruparPorProducto,
  agruparPorSucursal,
  calcularTiempoResolucion,
  listarPendientes,
  agruparPorCompetencia,
};
