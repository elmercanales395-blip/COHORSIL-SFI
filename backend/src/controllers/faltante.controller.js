const faltanteModel = require('../models/faltante.model');
const emailService = require('../services/email.service');

async function listar(req, res) {
  try {
    const faltantes = await faltanteModel.listar();
    res.json(faltantes);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al listar faltantes', error: err.message });
  }
}

async function obtener(req, res) {
  try {
    const faltante = await faltanteModel.obtenerPorId(req.params.id);
    if (!faltante) return res.status(404).json({ mensaje: 'Faltante no encontrado' });
    res.json(faltante);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener faltante', error: err.message });
  }
}

async function crear(req, res) {
  try {
    const {
      producto_id,
      producto_solicitado,
      casa_comercial,
      producto_sustituto_id,
      resultado_venta,
      sucursal_id,
      cantidad_solicitada,
      cliente_nombre,
      observaciones,
    } = req.body;

    // producto_id no es obligatorio si es marca de la competencia (ahí lo que importa es producto_solicitado)
    if ((!producto_id && !producto_solicitado) || !sucursal_id || !cantidad_solicitada) {
      return res.status(400).json({
        mensaje: 'sucursal_id, cantidad_solicitada y (producto_id o producto_solicitado) son obligatorios',
      });
    }

    // usuario_id viene del token, lo agrega el middleware de auth
    const faltante = await faltanteModel.crear({
      producto_id,
      producto_solicitado,
      casa_comercial,
      producto_sustituto_id,
      resultado_venta,
      sucursal_id,
      usuario_id: req.usuario.id,
      cantidad_solicitada,
      cliente_nombre,
      observaciones,
    });

    res.status(201).json(faltante);

    // Se manda después de responder, para no hacer esperar al usuario si el envío tarda
    emailService.notificarFaltante(faltante);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al crear faltante', error: err.message });
  }
}

async function actualizar(req, res) {
  try {
    const {
      producto_id,
      producto_solicitado,
      casa_comercial,
      producto_sustituto_id,
      resultado_venta,
      sucursal_id,
      cantidad_solicitada,
      cliente_nombre,
      observaciones,
    } = req.body;

    if ((!producto_id && !producto_solicitado) || !sucursal_id || !cantidad_solicitada) {
      return res.status(400).json({
        mensaje: 'sucursal_id, cantidad_solicitada y (producto_id o producto_solicitado) son obligatorios',
      });
    }

    const existente = await faltanteModel.obtenerPorId(req.params.id);
    if (!existente) {
      return res.status(404).json({ mensaje: 'Faltante no encontrado' });
    }

    const faltante = await faltanteModel.actualizar({
      id: req.params.id,
      producto_id,
      producto_solicitado,
      casa_comercial,
      producto_sustituto_id,
      resultado_venta,
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

async function resolver(req, res) {
  try {
    const faltante = await faltanteModel.marcarResuelto(req.params.id);
    res.json(faltante);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al resolver faltante', error: err.message });
  }
}

// Borrado lógico: solo desactiva el registro
async function eliminar(req, res) {
  try {
    await faltanteModel.eliminar(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al eliminar faltante', error: err.message });
  }
}

async function listarEliminados(req, res) {
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

module.exports = { listar, obtener, crear, actualizar, resolver, eliminar, listarEliminados, restaurar, eliminarDefinitivo };
