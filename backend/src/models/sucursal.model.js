const { getConnection } = require('../config/db');

async function listar() {
  const pool = await getConnection();
  const result = await pool.request()
    .query('SELECT id, nombre, direccion, telefono, zona FROM Sucursales WHERE activo = 1 ORDER BY nombre');
  return result.recordset;
}

module.exports = { listar };
