const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const verificarToken = require('../middlewares/auth.middleware');

// También protejo las rutas de usuarios: hay que estar logueado (el controlador ya valida que sea admin)
router.use(verificarToken);

// Lista los usuarios registrados, para la pantalla de gestión de usuarios del admin
router.get('/', usuarioController.listar);

// Edita un usuario existente (nombre, email, rol y opcionalmente contraseña)
router.put('/:id', usuarioController.actualizar);

// Elimina un usuario
router.delete('/:id', usuarioController.eliminar);

module.exports = router;
