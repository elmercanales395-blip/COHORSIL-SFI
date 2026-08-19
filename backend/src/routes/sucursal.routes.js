const express = require('express');
const router = express.Router();
const sucursalController = require('../controllers/sucursal.controller');
const verificarToken = require('../middlewares/auth.middleware');

router.use(verificarToken);

router.get('/', sucursalController.listar);

module.exports = router;
