const productoModel = require('../models/producto.model');

// Devuelve la lista de productos activos, la uso para llenar el select del formulario de faltantes
async function listar(req, res) {
  try {
    const productos = await productoModel.listar();
    res.json(productos);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al listar productos', error: err.message });
  }
}

module.exports = { listar };
