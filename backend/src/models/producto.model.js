const { getConnection } = require('../config/db');

async function listar() {
  const pool = await getConnection();
  const result = await pool.request()
    .query('SELECT id, codigo, nombre, categoria, unidad_medida FROM Productos WHERE activo = 1 ORDER BY nombre');
  return result.recordset;
}

module.exports = { listar };
