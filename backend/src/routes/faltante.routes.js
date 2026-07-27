const express = require('express');
const router = express.Router();
const faltanteController = require('../controllers/faltante.controller');
const verificarToken = require('../middlewares/auth.middleware');

// Aplico el middleware a todas las rutas de este router: sin token válido no se puede usar nada de faltantes
router.use(verificarToken);

// Listo todos los faltantes activos
router.get('/', faltanteController.listar);
// Listo los faltantes que fueron eliminados (borrado lógico), para poder revisarlos o restaurarlos
router.get('/eliminados', faltanteController.listarEliminados);
// Obtengo el detalle de un faltante puntual por su id
router.get('/:id', faltanteController.obtener);
// Registro un faltante nuevo
router.post('/', faltanteController.crear);
// Edito un faltante existente (por si se registró mal)
router.put('/:id', faltanteController.actualizar);
// Marco un faltante como resuelto
router.patch('/:id/resolver', faltanteController.resolver);
// Restauro un faltante que había sido eliminado (deshago el borrado lógico)
router.patch('/:id/restaurar', faltanteController.restaurar);
// Elimino un faltante (borrado lógico, no lo saco de la base de datos)
router.delete('/:id', faltanteController.eliminar);
// Elimino un faltante de forma definitiva (esta vez sí, borrado real de la base de datos)
router.delete('/:id/definitivo', faltanteController.eliminarDefinitivo);

module.exports = router;
