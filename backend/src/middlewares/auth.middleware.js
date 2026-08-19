const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  // El token viaja en el header Authorization con el formato "Bearer <token>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }

  try {
    // Misma clave secreta usada al firmar el token en el login
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(403).json({ mensaje: 'Token inválido o expirado' });
  }
}

module.exports = verificarToken;
