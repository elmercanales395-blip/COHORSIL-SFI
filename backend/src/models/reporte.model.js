const { getConnection } = require('../config/db');

// Cada reporte usa su propia vista de SQL Server, así dejo la lógica de agrupación y cálculo en la base de datos
// en vez de traer todos los datos crudos y procesarlos en JavaScript

// Vista que agrupa y cuenta cuántas veces se reportó cada producto como faltante
async function porProducto() {
  const pool = await getConnection();
  const result = await pool.request()
    .query('SELECT * FROM vw_FaltantesPorProducto ORDER BY veces_reportado DESC');
  return result.recordset;
}

// Vista que agrupa el total de faltantes por sucursal
async function porSucursal() {
  const pool = await getConnection();
  const result = await pool.request()
    .query('SELECT * FROM vw_FaltantesPorSucursal ORDER BY total_faltantes DESC');
  return result.recordset;
}

// Vista con los faltantes que siguen pendientes, ordenados del más antiguo al más nuevo
async function pendientes() {
  const pool = await getConnection();
  const result = await pool.request()
    .query('SELECT * FROM vw_FaltantesPendientes ORDER BY fecha_registro ASC');
  return result.recordset;
}

// Vista que calcula el promedio de días de resolución
async function tiempoResolucion() {
  const pool = await getConnection();
  const result = await pool.request()
    .query('SELECT * FROM vw_TiempoResolucionPromedio ORDER BY promedio_dias_resolucion DESC');
  return result.recordset;
}

module.exports = { porProducto, porSucursal, pendientes, tiempoResolucion };
