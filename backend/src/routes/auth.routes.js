const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const verificarToken = require('../middlewares/auth.middleware');

// requiere estar logueado como admin, si no cualquiera se podría registrar como admin
router.post('/registro', verificarToken, authController.registrar);
router.post('/login', authController.login);

module.exports = router;
