// Uso bcryptjs para encriptar y comparar contraseñas, nunca las guardo en texto plano
const bcrypt = require('bcryptjs');
// Uso jsonwebtoken para generar el token que el frontend guarda y manda en cada petición
const jwt = require('jsonwebtoken');
// Traigo el modelo de usuario para hablar con la base de datos
const usuarioModel = require('../models/usuario.model');

// Controlador para el registro de un nuevo usuario
async function registrar(req, res) {
  try {
    // Solo un administrador ya logueado puede dar de alta cuentas nuevas
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'Solo un administrador puede registrar usuarios' });
    }

    // Extraigo los datos que me manda el formulario del frontend
    const { nombre, email, password, rol } = req.body;

    // Valido que los campos obligatorios vengan completos antes de tocar la base de datos
    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: 'Nombre, email y password son obligatorios' });
    }

    // Verifico que no exista ya un usuario registrado con ese mismo correo
    const existente = await usuarioModel.buscarPorEmail(email);
    if (existente) {
      return res.status(409).json({ mensaje: 'Ya existe un usuario con ese email' });
    }

    // Encripto la contraseña antes de guardarla (10 es el costo/salt rounds de bcrypt)
    const password_hash = await bcrypt.hash(password, 10);
    // Inserto el usuario nuevo en la base de datos
    const usuario = await usuarioModel.crear({ nombre, email, password_hash, rol });

    // Devuelvo el usuario creado con status 201 (creado)
    res.status(201).json(usuario);
  } catch (err) {
    // Si algo falla (por ejemplo la conexión a la base), responde con error 500
    res.status(500).json({ mensaje: 'Error al registrar usuario', error: err.message });
  }
}

// Controlador para iniciar sesión
async function login(req, res) {
  try {
    // Extraigo las credenciales que manda el usuario desde el login
    const { email, password } = req.body;

    // Valido que ambos campos vengan, si falta alguno no sige
    if (!email || !password) {
      return res.status(400).json({ mensaje: 'Email y password son obligatorios' });
    }

    // Busco el usuario en la base de datos por su correo
    const usuario = await usuarioModel.buscarPorEmail(email);
    if (!usuario) {
      // Si no existe, no doy detalles de si el email o el password es el que falla, por seguridad
      return res.status(401).json({ mensaje: 'No existe una cuenta con ese correo' });
    }

    // Las cuentas eliminadas quedan con activo = 0 (borrado lógico), no pueden volver a entrar
    if (!usuario.activo) {
      return res.status(401).json({ mensaje: 'Esta cuenta fue desactivada' });
    }

    // Comparo la contraseña que me mandaron contra el hash guardado en la base de datos
    const passwordValido = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValido) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    // Si todo está bien, genero el token JWT con los datos básicos del usuario, válido por 8 horas
    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' },
    );

    // Devuelvo el token junto con los datos del usuario (sin el password_hash) para el frontend
    res.json({
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error: err.message });
  }
}

// Exporto ambas funciones para usarlas en las rutas de auth
module.exports = { registrar, login };
