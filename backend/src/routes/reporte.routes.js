const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporte.controller');
const verificarToken = require('../middlewares/auth.middleware');

router.use(verificarToken);

// Solo un administrador puede consultarlos (son datos de gestión, no del día a día del vendedor)
router.use((req, res, next) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Solo un administrador puede ver los reportes' });
  }
  next();
});

router.get('/por-producto', reporteController.porProducto);
router.get('/por-sucursal', reporteController.porSucursal);
router.get('/pendientes', reporteController.pendientes);
router.get('/tiempo-resolucion', reporteController.tiempoResolucion);

// Junta los mismos reportes de arriba en un solo PDF descargable
router.get('/pdf', reporteController.reportesPdf);
// Igual que el PDF, pero además incluye una hoja de competencia
router.get('/excel', reporteController.reportesExcel);

module.exports = router;
