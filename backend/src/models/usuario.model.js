const { getConnection, sql } = require('../config/db');

// Se usa tanto en login como para validar duplicados en el registro
async function buscarPorEmail(email) {
  const pool = await getConnection();
  const result = await pool.request()
    // .input() con tipo VarChar en vez de concatenar el email en el query, para evitar inyección SQL
    .input('email', sql.VarChar, email)
    .query('SELECT * FROM Usuarios WHERE email = @email');
  return result.recordset[0];
}

// No incluye el password_hash, es para la pantalla de gestión de usuarios del admin
async function listarTodos() {
  const pool = await getConnection();
  const result = await pool.request()
    .query('SELECT id, nombre, email, rol FROM Usuarios WHERE activo = 1 ORDER BY nombre');
  return result.recordset;
}

async function crear({ nombre, email, password_hash, rol }) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('nombre', sql.VarChar, nombre)
    .input('email', sql.VarChar, email)
    .input('password_hash', sql.VarChar, password_hash)
    .input('rol', sql.VarChar, rol || 'vendedor')
    // con OUTPUT me ahorro el SELECT extra
    .query(`INSERT INTO Usuarios (nombre, email, password_hash, rol)
            OUTPUT INSERTED.id, INSERTED.nombre, INSERTED.email, INSERTED.rol
            VALUES (@nombre, @email, @password_hash, @rol)`);
  return result.recordset[0];
}

async function buscarPorId(id) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query('SELECT id, nombre, email, rol FROM Usuarios WHERE id = @id');
  return result.recordset[0];
}

// Si mandan password_hash lo actualiza también; si no, deja la contraseña actual sin tocar
async function actualizar({ id, nombre, email, rol, password_hash }) {
  const pool = await getConnection();
  const request = pool.request()
    .input('id', sql.Int, id)
    .input('nombre', sql.VarChar, nombre)
    .input('email', sql.VarChar, email)
    .input('rol', sql.VarChar, rol);

  let query = 'UPDATE Usuarios SET nombre = @nombre, email = @email, rol = @rol';
  if (password_hash) {
    request.input('password_hash', sql.VarChar, password_hash);
    query += ', password_hash = @password_hash';
  }
  query += ' OUTPUT INSERTED.id, INSERTED.nombre, INSERTED.email, INSERTED.rol WHERE id = @id';

  const result = await request.query(query);
  return result.recordset[0];
}

// no borro la fila, la FK Faltantes.usuario_id no tiene cascada y necesito conservar la referencia
async function eliminar(id) {
  const pool = await getConnection();
  await pool.request()
    .input('id', sql.Int, id)
    .query('UPDATE Usuarios SET activo = 0 WHERE id = @id');
}

module.exports = { buscarPorEmail, buscarPorId, crear, listarTodos, actualizar, eliminar };
