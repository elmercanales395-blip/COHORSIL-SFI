const express = require('express');
const router = express.Router();
const productoController = require('../controllers/producto.controller');
const verificarToken = require('../middlewares/auth.middleware');

router.use(verificarToken);

router.get('/', productoController.listar);

module.exports = router;
