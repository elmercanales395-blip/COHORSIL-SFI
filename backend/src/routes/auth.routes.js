const express = require('express');
// Creo un router para agrupar todas las rutas relacionadas con autenticación
const router = express.Router();
const authController = require('../controllers/auth.controller');
const verificarToken = require('../middlewares/auth.middleware');

// Crear una cuenta nueva requiere sesión iniciada: solo un admin ya logueado puede dar de alta usuarios
// (si no, cualquiera podría registrarse a sí mismo con rol "admin")
router.post('/registro', verificarToken, authController.registrar);
// Ruta para iniciar sesión y obtener el token, esta sí va libre porque todavía no existe sesión
router.post('/login', authController.login);

module.exports = router;
