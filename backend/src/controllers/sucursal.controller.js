const sucursalModel = require('../models/sucursal.model');

// Devuelve la lista de sucursales activas, la uso para llenar el select del formulario de faltantes
async function listar(req, res) {
  try {
    const sucursales = await sucursalModel.listar();
    res.json(sucursales);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al listar sucursales', error: err.message });
  }
}

module.exports = { listar };
