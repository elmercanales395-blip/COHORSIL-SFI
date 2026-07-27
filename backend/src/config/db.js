// Uso el driver msnodesqlv8 de mssql porque me conecto con autenticación de Windows (trustedConnection)
const sql = require('mssql/msnodesqlv8');
// Cargo las variables de entorno para no dejar los datos de conexión escritos en el código
require('dotenv').config();

// Armo la configuración de conexión a SQL Server a partir del .env
const dbConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  driver: 'ODBC Driver 18 for SQL Server',
  options: {
    instanceName: process.env.DB_INSTANCE,
    // Uso autenticación de Windows en vez de usuario/contraseña
    trustedConnection: true,
    // Confío en el certificado del servidor para evitar el error de SSL en desarrollo
    trustServerCertificate: true,
    // GETDATE() en SQL Server devuelve la hora local del servidor (Honduras, UTC-6), no UTC.
    // Sin esto, el driver asume que esos DATETIME ya vienen en UTC y desfasa las fechas 6 horas.
    useUTC: false,
  },
};

// Guardo el pool de conexiones en esta variable para no crear uno nuevo en cada consulta
let pool;

// Esta función devuelve el pool ya existente, o lo crea la primera vez que se necesita
async function getConnection() {
  if (pool) return pool;
  pool = await new sql.ConnectionPool(dbConfig).connect();
  return pool;
}

// Exporto tanto el objeto sql (para usar sus tipos y helpers) como la función de conexión
module.exports = { sql, getConnection };
