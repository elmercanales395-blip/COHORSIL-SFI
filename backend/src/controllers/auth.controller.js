const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuario.model');

async function registrar(req, res) {
  try {
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'Solo un administrador puede registrar usuarios' });
    }

    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: 'Nombre, email y password son obligatorios' });
    }

    const existente = await usuarioModel.buscarPorEmail(email);
    if (existente) {
      return res.status(409).json({ mensaje: 'Ya existe un usuario con ese email' });
    }

    // 10 = costo/salt rounds de bcrypt
    const password_hash = await bcrypt.hash(password, 10);
    const usuario = await usuarioModel.crear({ nombre, email, password_hash, rol });

    res.status(201).json(usuario);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al registrar usuario', error: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ mensaje: 'Email y password son obligatorios' });
    }

    const usuario = await usuarioModel.buscarPorEmail(email);
    if (!usuario) {
      // No se distingue si falló el email o el password, por seguridad
      return res.status(401).json({ mensaje: 'No existe una cuenta con ese correo' });
    }

    // Cuentas eliminadas quedan con activo = 0 (borrado lógico), no pueden volver a entrar
    if (!usuario.activo) {
      return res.status(401).json({ mensaje: 'Esta cuenta fue desactivada' });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValido) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' },
    );

    res.json({
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error: err.message });
  }
}

module.exports = { registrar, login };
