const productoModel = require('../models/producto.model');

async function listar(req, res) {
  try {
    const productos = await productoModel.listar();
    res.json(productos);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al listar productos', error: err.message });
  }
}

module.exports = { listar };
