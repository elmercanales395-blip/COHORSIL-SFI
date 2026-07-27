const { getConnection, sql } = require('../config/db');

// Traigo todos los faltantes activos desde la vista vw_FaltantesDetalle
// (uso una vista en vez de la tabla directa porque ya viene con los datos de producto/sucursal/usuario unidos)
async function listar() {
  const pool = await getConnection();
  const result = await pool.request()
    .query('SELECT * FROM vw_FaltantesDetalle ORDER BY fecha_registro DESC');
  return result.recordset;
}

// Traigo un solo faltante por su id, usando la misma vista para tener todos los datos ya combinados
async function obtenerPorId(id) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query('SELECT * FROM vw_FaltantesDetalle WHERE faltante_id = @id');
  return result.recordset[0];
}

// Inserta un faltante nuevo en la tabla Faltantes
async function crear({ producto_id, sucursal_id, usuario_id, cantidad_solicitada, cliente_nombre, observaciones }) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('producto_id', sql.Int, producto_id)
    .input('sucursal_id', sql.Int, sucursal_id)
    .input('usuario_id', sql.Int, usuario_id)
    .input('cantidad_solicitada', sql.Int, cantidad_solicitada)
    // Si no me mandan cliente_nombre u observaciones, guardo NULL en vez de string vacío
    .input('cliente_nombre', sql.VarChar, cliente_nombre || null)
    .input('observaciones', sql.VarChar, observaciones || null)
    // OUTPUT INSERTED.id me devuelve el id que generó automáticamente la base de datos
    .query(`INSERT INTO Faltantes (producto_id, sucursal_id, usuario_id, cantidad_solicitada, cliente_nombre, observaciones)
            OUTPUT INSERTED.id
            VALUES (@producto_id, @sucursal_id, @usuario_id, @cantidad_solicitada, @cliente_nombre, @observaciones)`);
  // Con ese id vuelvo a consultar la vista para devolver el registro completo con todos los datos unidos
  return obtenerPorId(result.recordset[0].id);
}

// Actualiza los datos de un faltante existente (por si el vendedor se equivocó al registrarlo)
async function actualizar({ id, producto_id, sucursal_id, cantidad_solicitada, cliente_nombre, observaciones }) {
  const pool = await getConnection();
  await pool.request()
    .input('id', sql.Int, id)
    .input('producto_id', sql.Int, producto_id)
    .input('sucursal_id', sql.Int, sucursal_id)
    .input('cantidad_solicitada', sql.Int, cantidad_solicitada)
    .input('cliente_nombre', sql.VarChar, cliente_nombre || null)
    .input('observaciones', sql.VarChar, observaciones || null)
    .query(`UPDATE Faltantes
            SET producto_id = @producto_id,
                sucursal_id = @sucursal_id,
                cantidad_solicitada = @cantidad_solicitada,
                cliente_nombre = @cliente_nombre,
                observaciones = @observaciones
            WHERE id = @id`);
  return obtenerPorId(id);
}

// Cambia el estado de un faltante a 'resuelto' y guarda la fecha en la que se resolvió
async function marcarResuelto(id) {
  const pool = await getConnection();
  await pool.request()
    .input('id', sql.Int, id)
    .query(`UPDATE Faltantes SET estado = 'resuelto', fecha_resuelto = GETDATE() WHERE id = @id`);
  return obtenerPorId(id);
}

// Borrado lógico: no borro la fila, solo pongo activo = 0 y guardo la fecha de eliminación
async function eliminar(id) {
  const pool = await getConnection();
  await pool.request()
    .input('id', sql.Int, id)
    .query(`UPDATE Faltantes SET activo = 0, fecha_eliminacion = GETDATE() WHERE id = @id`);
}

// Trae los faltantes eliminados desde su propia vista, para poder revisarlos o restaurarlos
async function listarEliminados() {
  const pool = await getConnection();
  const result = await pool.request()
    .query('SELECT * FROM vw_FaltantesEliminados ORDER BY fecha_eliminacion DESC');
  return result.recordset;
}

// Deshace el borrado lógico: vuelvo a poner activo = 1 y limpio la fecha de eliminación
async function restaurar(id) {
  const pool = await getConnection();
  await pool.request()
    .input('id', sql.Int, id)
    .query(`UPDATE Faltantes SET activo = 1, fecha_eliminacion = NULL WHERE id = @id`);
  return obtenerPorId(id);
}

// Borrado real de la base de datos, solo permito borrar los que ya estaban con activo = 0
// (evito que se borre por accidente un faltante que sigue activo)
async function eliminarDefinitivo(id) {
  const pool = await getConnection();
  await pool.request()
    .input('id', sql.Int, id)
    .query('DELETE FROM Faltantes WHERE id = @id AND activo = 0');
}

// Exporto todas las funciones para que el controlador de faltantes las use
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
