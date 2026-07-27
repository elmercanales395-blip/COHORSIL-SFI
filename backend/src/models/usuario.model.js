// Traigo la conexión a la base y los tipos de dato de sql para armar consultas parametrizadas
const { getConnection, sql } = require('../config/db');

// Busca un usuario por su email, lo uso tanto en login como para validar duplicados en el registro
async function buscarPorEmail(email) {
  const pool = await getConnection();
  const result = await pool.request()
    // Uso .input() con tipo VarChar en vez de concatenar el email directo en el query, para evitar inyección SQL
    .input('email', sql.VarChar, email)
    .query('SELECT * FROM Usuarios WHERE email = @email');
  // recordset[0] porque el email es único, solo puede haber un resultado
  return result.recordset[0];
}

// Trae todos los usuarios activos, sin el password_hash (para la pantalla de gestión de usuarios del admin)
async function listarTodos() {
  const pool = await getConnection();
  const result = await pool.request()
    .query('SELECT id, nombre, email, rol FROM Usuarios WHERE activo = 1 ORDER BY nombre');
  return result.recordset;
}

// Inserta un usuario nuevo en la tabla Usuarios
async function crear({ nombre, email, password_hash, rol }) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('nombre', sql.VarChar, nombre)
    .input('email', sql.VarChar, email)
    // Guardo el hash de la contraseña, nunca la contraseña en texto plano
    .input('password_hash', sql.VarChar, password_hash)
    // Si no me mandan rol, uso 'vendedor' como valor por defecto
    .input('rol', sql.VarChar, rol || 'vendedor')
    // OUTPUT INSERTED.* me devuelve la fila recién creada sin tener que hacer un segundo SELECT
    .query(`INSERT INTO Usuarios (nombre, email, password_hash, rol)
            OUTPUT INSERTED.id, INSERTED.nombre, INSERTED.email, INSERTED.rol
            VALUES (@nombre, @email, @password_hash, @rol)`);
  return result.recordset[0];
}

// Busca un usuario por su id, lo uso para validar que exista antes de editar/eliminar
async function buscarPorId(id) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query('SELECT id, nombre, email, rol FROM Usuarios WHERE id = @id');
  return result.recordset[0];
}

// Actualiza los datos de un usuario existente. Si mandan password_hash, también lo actualiza,
// si no, deja la contraseña actual sin tocar
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

// Borrado lógico: no borro la fila (los faltantes ya registrados quedan con la referencia
// al vendedor gracias a la FK Faltantes.usuario_id, que no tiene cascada), solo pongo activo = 0
async function eliminar(id) {
  const pool = await getConnection();
  await pool.request()
    .input('id', sql.Int, id)
    .query('UPDATE Usuarios SET activo = 0 WHERE id = @id');
}

// Exporto las funciones para que los controladores de auth y usuarios las usen
module.exports = { buscarPorEmail, buscarPorId, crear, listarTodos, actualizar, eliminar };
