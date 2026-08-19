const { getConnection, sql } = require('../config/db');

// vw_FaltantesDetalle ya trae producto/sucursal/usuario unidos, por eso no se usa la tabla directa
async function listar() {
  const pool = await getConnection();
  const result = await pool.request()
    .query('SELECT * FROM vw_FaltantesDetalle ORDER BY fecha_registro DESC');
  return result.recordset;
}

async function obtenerPorId(id) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query('SELECT * FROM vw_FaltantesDetalle WHERE faltante_id = @id');
  return result.recordset[0];
}

// producto_id NULL = pidió marca de competencia (queda en producto_solicitado como texto libre).
// producto_sustituto_id es lo que se le ofreció en su lugar, resultado_venta si esa venta se dio o no
async function crear({
  producto_id,
  producto_solicitado,
  casa_comercial,
  producto_sustituto_id,
  resultado_venta,
  sucursal_id,
  usuario_id,
  cantidad_solicitada,
  cliente_nombre,
  observaciones,
}) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('producto_id', sql.Int, producto_id || null)
    .input('producto_solicitado', sql.VarChar, producto_solicitado || null)
    .input('casa_comercial', sql.VarChar, casa_comercial || null)
    .input('producto_sustituto_id', sql.Int, producto_sustituto_id || null)
    .input('resultado_venta', sql.VarChar, resultado_venta || null)
    .input('sucursal_id', sql.Int, sucursal_id)
    .input('usuario_id', sql.Int, usuario_id)
    .input('cantidad_solicitada', sql.Int, cantidad_solicitada)
    .input('cliente_nombre', sql.VarChar, cliente_nombre || null)
    .input('observaciones', sql.VarChar, observaciones || null)
    // OUTPUT INSERTED.id devuelve el id generado sin necesidad de una segunda consulta
    .query(`INSERT INTO Faltantes
              (producto_id, producto_solicitado, casa_comercial, producto_sustituto_id, resultado_venta, sucursal_id, usuario_id, cantidad_solicitada, cliente_nombre, observaciones)
            OUTPUT INSERTED.id
            VALUES
              (@producto_id, @producto_solicitado, @casa_comercial, @producto_sustituto_id, @resultado_venta, @sucursal_id, @usuario_id, @cantidad_solicitada, @cliente_nombre, @observaciones)`);
  // Se vuelve a consultar la vista para devolver el registro completo con los datos ya unidos
  return obtenerPorId(result.recordset[0].id);
}

// También se usa para marcar después si la venta se concretó con el sustituto o se perdió
async function actualizar({
  id,
  producto_id,
  producto_solicitado,
  casa_comercial,
  producto_sustituto_id,
  resultado_venta,
  sucursal_id,
  cantidad_solicitada,
  cliente_nombre,
  observaciones,
}) {
  const pool = await getConnection();
  await pool.request()
    .input('id', sql.Int, id)
    .input('producto_id', sql.Int, producto_id || null)
    .input('producto_solicitado', sql.VarChar, producto_solicitado || null)
    .input('casa_comercial', sql.VarChar, casa_comercial || null)
    .input('producto_sustituto_id', sql.Int, producto_sustituto_id || null)
    .input('resultado_venta', sql.VarChar, resultado_venta || null)
    .input('sucursal_id', sql.Int, sucursal_id)
    .input('cantidad_solicitada', sql.Int, cantidad_solicitada)
    .input('cliente_nombre', sql.VarChar, cliente_nombre || null)
    .input('observaciones', sql.VarChar, observaciones || null)
    .query(`UPDATE Faltantes
            SET producto_id = @producto_id,
                producto_solicitado = @producto_solicitado,
                casa_comercial = @casa_comercial,
                producto_sustituto_id = @producto_sustituto_id,
                resultado_venta = @resultado_venta,
                sucursal_id = @sucursal_id,
                cantidad_solicitada = @cantidad_solicitada,
                cliente_nombre = @cliente_nombre,
                observaciones = @observaciones
            WHERE id = @id`);
  return obtenerPorId(id);
}

async function marcarResuelto(id) {
  const pool = await getConnection();
  await pool.request()
    .input('id', sql.Int, id)
    .query(`UPDATE Faltantes SET estado = 'resuelto', fecha_resuelto = GETDATE() WHERE id = @id`);
  return obtenerPorId(id);
}

// Borrado lógico: no borra la fila, solo activo = 0
async function eliminar(id) {
  const pool = await getConnection();
  await pool.request()
    .input('id', sql.Int, id)
    .query(`UPDATE Faltantes SET activo = 0, fecha_eliminacion = GETDATE() WHERE id = @id`);
}

async function listarEliminados() {
  const pool = await getConnection();
  const result = await pool.request()
    .query('SELECT * FROM vw_FaltantesEliminados ORDER BY fecha_eliminacion DESC');
  return result.recordset;
}

async function restaurar(id) {
  const pool = await getConnection();
  await pool.request()
    .input('id', sql.Int, id)
    .query(`UPDATE Faltantes SET activo = 1, fecha_eliminacion = NULL WHERE id = @id`);
  return obtenerPorId(id);
}

// el AND activo = 0 es a propósito, para no borrar por error uno que sigue activo
async function eliminarDefinitivo(id) {
  const pool = await getConnection();
  await pool.request()
    .input('id', sql.Int, id)
    .query('DELETE FROM Faltantes WHERE id = @id AND activo = 0');
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  marcarResuelto,
  eliminar,
  listarEliminados,
  restaurar,
  eliminarDefinitivo,
};
