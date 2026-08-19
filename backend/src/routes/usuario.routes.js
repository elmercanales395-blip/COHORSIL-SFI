const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const verificarToken = require('../middlewares/auth.middleware');

// El rol admin se valida en el controlador, no acá
router.use(verificarToken);

router.get('/', usuarioController.listar);

router.put('/:id', usuarioController.actualizar);

router.delete('/:id', usuarioController.eliminar);

module.exports = router;
