const bcrypt = require('bcryptjs');
const usuarioModel = require('../models/usuario.model');

async function listar(req, res) {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Solo un administrador puede ver los usuarios' });
  }
  try {
    const usuarios = await usuarioModel.listarTodos();
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al listar usuarios', error: err.message });
  }
}

// La contraseña es opcional: solo se actualiza si mandan una nueva
async function actualizar(req, res) {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Solo un administrador puede editar usuarios' });
  }
  try {
    const { id } = req.params;
    const { nombre, email, rol, password } = req.body;

    if (!nombre || !email || !rol) {
      return res.status(400).json({ mensaje: 'Nombre, email y rol son obligatorios' });
    }

    const existente = await usuarioModel.buscarPorId(id);
    if (!existente) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Si el correo cambió, verifico que no choque con el de otro usuario
    const conMismoEmail = await usuarioModel.buscarPorEmail(email);
    if (conMismoEmail && String(conMismoEmail.id) !== String(id)) {
      return res.status(409).json({ mensaje: 'Ya existe otro usuario con ese email' });
    }

    const password_hash = password ? await bcrypt.hash(password, 10) : null;

    const usuario = await usuarioModel.actualizar({ id, nombre, email, rol, password_hash });
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar usuario', error: err.message });
  }
}

async function eliminar(req, res) {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Solo un administrador puede eliminar usuarios' });
  }
  try {
    const { id } = req.params;

    if (String(req.usuario.id) === String(id)) {
      return res.status(400).json({ mensaje: 'No puedes eliminar tu propia cuenta' });
    }

    const existente = await usuarioModel.buscarPorId(id);
    if (!existente) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    await usuarioModel.eliminar(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al eliminar usuario', error: err.message });
  }
}

module.exports = { listar, actualizar, eliminar };
