const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const faltanteRoutes = require('./routes/faltante.routes');
const productoRoutes = require('./routes/producto.routes');
const sucursalRoutes = require('./routes/sucursal.routes');
const reporteRoutes = require('./routes/reporte.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const { iniciarJobReporteMensual } = require('./jobs/reporteMensual.job');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/faltantes', faltanteRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/sucursales', sucursalRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/usuarios', usuarioRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  iniciarJobReporteMensual();
});
