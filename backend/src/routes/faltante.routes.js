const express = require('express');
const router = express.Router();
const faltanteController = require('../controllers/faltante.controller');
const verificarToken = require('../middlewares/auth.middleware');

router.use(verificarToken);

router.get('/', faltanteController.listar);
router.get('/eliminados', faltanteController.listarEliminados);
router.get('/:id', faltanteController.obtener);
router.post('/', faltanteController.crear);
router.put('/:id', faltanteController.actualizar);
router.patch('/:id/resolver', faltanteController.resolver);
router.patch('/:id/restaurar', faltanteController.restaurar);
// Borrado lógico, no se saca de la base de datos
router.delete('/:id', faltanteController.eliminar);
// Este sí borra el registro de la base de datos
router.delete('/:id/definitivo', faltanteController.eliminarDefinitivo);

module.exports = router;
