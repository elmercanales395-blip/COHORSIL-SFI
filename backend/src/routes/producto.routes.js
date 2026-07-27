const express = require('express');
const router = express.Router();
const productoController = require('../controllers/producto.controller');
const verificarToken = require('../middlewares/auth.middleware');

// Protejo todas las rutas de productos, necesitan sesión iniciada
router.use(verificarToken);

// Por ahora solo necesito listar los productos, por ejemplo para llenar un select en el formulario
router.get('/', productoController.listar);

module.exports = router;
