const { getConnection } = require('../config/db');

// cada reporte tiene su vista en SQL Server, la agrupación se hace allá y no en JS
async function porProducto() {
  const pool = await getConnection();
  const result = await pool.request()
    .query('SELECT * FROM vw_FaltantesPorProducto ORDER BY veces_reportado DESC');
  return result.recordset;
}

async function porSucursal() {
  const pool = await getConnection();
  const result = await pool.request()
    .query('SELECT * FROM vw_FaltantesPorSucursal ORDER BY total_faltantes DESC');
  return result.recordset;
}

async function pendientes() {
  const pool = await getConnection();
  const result = await pool.request()
    .query('SELECT * FROM vw_FaltantesPendientes ORDER BY fecha_registro ASC');
  return result.recordset;
}

async function tiempoResolucion() {
  const pool = await getConnection();
  const result = await pool.request()
    .query('SELECT * FROM vw_TiempoResolucionPromedio ORDER BY promedio_dias_resolucion DESC');
  return result.recordset;
}

module.exports = { porProducto, porSucursal, pendientes, tiempoResolucion };
