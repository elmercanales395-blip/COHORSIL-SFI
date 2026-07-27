const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporte.controller');
const verificarToken = require('../middlewares/auth.middleware');

// Los reportes también requieren estar autenticado para consultarlos
router.use(verificarToken);

// Y además, solo un administrador puede consultarlos (son datos de gestión, no del día a día del vendedor)
router.use((req, res, next) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Solo un administrador puede ver los reportes' });
  }
  next();
});

// Reporte agrupado por producto: cuántos faltantes hay de cada uno
router.get('/por-producto', reporteController.porProducto);
// Reporte agrupado por sucursal: cuántos faltantes reporta cada sucursal
router.get('/por-sucursal', reporteController.porSucursal);
// Reporte de los faltantes que todavía están pendientes de resolver
router.get('/pendientes', reporteController.pendientes);
// Reporte del tiempo que se tarda en resolver cada faltante
router.get('/tiempo-resolucion', reporteController.tiempoResolucion);

// Los mismos 4 reportes juntos en un solo PDF descargable
router.get('/pdf', reporteController.reportesPdf);

module.exports = router;
