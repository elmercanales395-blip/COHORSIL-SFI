const express = require('express');
const router = express.Router();
const sucursalController = require('../controllers/sucursal.controller');
const verificarToken = require('../middlewares/auth.middleware');

// También protejo las rutas de sucursales
router.use(verificarToken);

// Listo las sucursales, las uso por ejemplo para el select del formulario de faltantes
router.get('/', sucursalController.listar);

module.exports = router;
