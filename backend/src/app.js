// Importo express, el framework que uso para armar el servidor y las rutas
const express = require('express');
// Importo cors para permitir que el frontend (que corre en otro puerto/origen) pueda consumir mi API
const cors = require('cors');
// Cargo las variables de entorno del archivo .env (puerto, datos de conexión, etc.)
require('dotenv').config();

// Importo cada grupo de rutas que separé por módulo
const authRoutes = require('./routes/auth.routes');
const faltanteRoutes = require('./routes/faltante.routes');
const productoRoutes = require('./routes/producto.routes');
const sucursalRoutes = require('./routes/sucursal.routes');
const reporteRoutes = require('./routes/reporte.routes');
const usuarioRoutes = require('./routes/usuario.routes');

// Creo la instancia principal de la aplicación
const app = express();

// Habilito CORS para todas las rutas
app.use(cors());
// Le digo a express que entienda los bodies en formato JSON que llegan en las peticiones
app.use(express.json());

// Registro cada grupo de rutas bajo su propio prefijo dentro de /api
app.use('/api/auth', authRoutes);
app.use('/api/faltantes', faltanteRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/sucursales', sucursalRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/usuarios', usuarioRoutes);

// Tomo el puerto desde el .env, y si no existe uso el 3000 por defecto
const PORT = process.env.PORT || 3000;

// Levanto el servidor y muestro en consola en qué puerto quedó escuchando
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
