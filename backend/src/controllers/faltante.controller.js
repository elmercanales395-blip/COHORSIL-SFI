// Traigo el modelo que habla directo con la base de datos
const faltanteModel = require('../models/faltante.model');
// Traigo el servicio de correo para avisar cuando se registra un faltante nuevo
const emailService = require('../services/email.service');

// Devuelve todos los faltantes activos (los que no han sido eliminados)
async function listar(req, res) {
  try {
    const faltantes = await faltanteModel.listar();
    res.json(faltantes);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al listar faltantes', error: err.message });
  }
}

// Devuelve el detalle de un solo faltante según su id
async function obtener(req, res) {
  try {
    const faltante = await faltanteModel.obtenerPorId(req.params.id);
    // Si no existe ese id, respondo 404 en vez de mandar null
    if (!faltante) return res.status(404).json({ mensaje: 'Faltante no encontrado' });
    res.json(faltante);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener faltante', error: err.message });
  }
}

// Registra un faltante nuevo, este es el flujo principal del sistema
async function crear(req, res) {
  try {
    // Extraigo los datos que manda el formulario del frontend
    const { producto_id, sucursal_id, cantidad_solicitada, cliente_nombre, observaciones } = req.body;

    // Valido los campos obligatorios antes de escribir en la base de datos
    if (!producto_id || !sucursal_id || !cantidad_solicitada) {
      return res.status(400).json({ mensaje: 'producto_id, sucursal_id y cantidad_solicitada son obligatorios' });
    }

    // Creo el faltante, y le agrego el usuario_id que viene del token (lo puso el middleware de auth)
    const faltante = await faltanteModel.crear({
      producto_id,
      sucursal_id,
      usuario_id: req.usuario.id,
      cantidad_solicitada,
      cliente_nombre,
      observaciones,
    });

    // Respondo de inmediato al frontend con el faltante creado
    res.status(201).json(faltante);

    // Mando el correo de notificación después de responder, para no hacer esperar al usuario si el envío tarda
    emailService.notificarFaltante(faltante);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al crear faltante', error: err.message });
  }
}

// Edita un faltante existente, por si el vendedor se equivocó al registrarlo
async function actualizar(req, res) {
  try {
    const { producto_id, sucursal_id, cantidad_solicitada, cliente_nombre, observaciones } = req.body;

    if (!producto_id || !sucursal_id || !cantidad_solicitada) {
      return res.status(400).json({ mensaje: 'producto_id, sucursal_id y cantidad_solicitada son obligatorios' });
    }

    const existente = await faltanteModel.obtenerPorId(req.params.id);
    if (!existente) {
      return res.status(404).json({ mensaje: 'Faltante no encontrado' });
    }

    const faltante = await faltanteModel.actualizar({
      id: req.params.id,
      producto_id,
      sucursal_id,
      cantidad_solicitada,
      cliente_nombre,
      observaciones,
    });
    res.json(faltante);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar faltante', error: err.message });
  }
}

// Marca un faltante como resuelto
async function resolver(req, res) {
  try {
    const faltante = await faltanteModel.marcarResuelto(req.params.id);
    res.json(faltante);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al resolver faltante', error: err.message });
  }
}

// Elimina un faltante (borrado lógico, solo lo desactiva)
async function eliminar(req, res) {
  try {
    await faltanteModel.eliminar(req.params.id);
    // 204 porque no hay contenido que devolver, solo confirmo que se hizo
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al eliminar faltante', error: err.message });
  }
}

// Lista los faltantes eliminados, solo puede verlos un administrador
async function listarEliminados(req, res) {
  // Reviso el rol que viene dentro del token para restringir el acceso
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Solo un administrador puede ver los faltantes eliminados' });
  }
  try {
    const faltantes = await faltanteModel.listarEliminados();
    res.json(faltantes);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al listar faltantes eliminados', error: err.message });
  }
}

// Restaura un faltante eliminado, también solo lo puede hacer un administrador
async function restaurar(req, res) {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Solo un administrador puede restaurar faltantes' });
  }
  try {
    const faltante = await faltanteModel.restaurar(req.params.id);
    res.json(faltante);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al restaurar faltante', error: err.message });
  }
}

// Elimina un faltante para siempre de la base de datos, solo un administrador puede hacerlo
async function eliminarDefinitivo(req, res) {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Solo un administrador puede eliminar definitivamente un faltante' });
  }
  try {
    await faltanteModel.eliminarDefinitivo(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al eliminar definitivamente el faltante', error: err.message });
  }
}

// Exporto todas las funciones para que las use el router de faltantes
module.exports = { listar, obtener, crear, actualizar, resolver, eliminar, listarEliminados, restaurar, eliminarDefinitivo };
