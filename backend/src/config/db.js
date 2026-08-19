// msnodesqlv8 porque conectamos con autenticación de Windows
const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

const dbConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  driver: 'ODBC Driver 18 for SQL Server',
  options: {
    instanceName: process.env.DB_INSTANCE,
    trustedConnection: true,
    trustServerCertificate: true, // si no, tira error de SSL por el certificado autofirmado
    // ojo: sin esto las fechas se desfasan 6h porque GETDATE() ya da hora local (Honduras)
    useUTC: false,
  },
};

let pool;

async function getConnection() {
  if (pool) return pool;
  pool = await new sql.ConnectionPool(dbConfig).connect();
  return pool;
}

module.exports = { sql, getConnection };
