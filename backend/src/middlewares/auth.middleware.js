// Necesito jsonwebtoken para poder verificar el token que llega en cada petición
const jwt = require('jsonwebtoken');

// Este middleware protege las rutas: se ejecuta antes del controlador y corta el paso si no hay token válido
function verificarToken(req, res, next) {
  // El token viaja en el header Authorization con el formato "Bearer <token>"
  const authHeader = req.headers['authorization'];
  // Separo por espacio y me quedo con la segunda parte, que es el token en sí
  const token = authHeader && authHeader.split(' ')[1];

  // Si no mandaron ningún token, no dejo continuar
  if (!token) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }

  try {
    // Verifico el token con la misma clave secreta con la que lo firmé al hacer login
    // y guardo los datos del usuario en req.usuario para que el controlador los pueda usar
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    // Si el token es válido, dejo que la petición siga a la siguiente función/controlador
    next();
  } catch (err) {
    // Si el token está vencido o fue manipulado, corto la petición aquí
    return res.status(403).json({ mensaje: 'Token inválido o expirado' });
  }
}

// Exporto el middleware para usarlo en las rutas que necesito proteger
module.exports = verificarToken;
