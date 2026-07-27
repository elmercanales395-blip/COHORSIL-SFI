const { getConnection } = require('../config/db');

// Solo traigo los productos activos (activo = 1) y ordenados por nombre para que se vean bien en el select
async function listar() {
  const pool = await getConnection();
  const result = await pool.request()
    .query('SELECT id, codigo, nombre, categoria, unidad_medida FROM Productos WHERE activo = 1 ORDER BY nombre');
  return result.recordset;
}

module.exports = { listar };
