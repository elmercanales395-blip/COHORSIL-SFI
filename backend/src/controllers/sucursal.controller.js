const sucursalModel = require('../models/sucursal.model');

async function listar(req, res) {
  try {
    const sucursales = await sucursalModel.listar();
    res.json(sucursales);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al listar sucursales', error: err.message });
  }
}

module.exports = { listar };
