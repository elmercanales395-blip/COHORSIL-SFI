// Uso nodemailer para poder enviar correos desde una cuenta de Gmail
const nodemailer = require('nodemailer');

// Guardo el transporter aquí para no recrear la conexión SMTP en cada correo que mando
let transporter;

// Crea el transporter la primera vez que se necesita, y después reutiliza el mismo
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        // Uso una contraseña de aplicación de Gmail, no la contraseña normal de la cuenta
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
}

// Envía un correo avisando que se registró un faltante nuevo
async function notificarFaltante(faltante) {
  const destinatario = process.env.EMAIL_TO;
  // Si falta configurar el correo en el .env, no interrumpo el sistema, solo aviso en consola y no envío nada
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !destinatario) {
    console.warn('Notificación de faltante omitida: EMAIL_USER, EMAIL_PASS o EMAIL_TO no configurados en .env');
    return;
  }

  // Armo el asunto con el nombre del producto y la sucursal para identificarlo rápido
  const asunto = `Faltante reportado: ${faltante.producto_nombre} (${faltante.sucursal})`;
  // Armo el cuerpo del correo como un arreglo de líneas y las uno con saltos de línea, es más fácil de leer así
  const texto = [
    `Se registró un nuevo faltante en el sistema.`,
    ``,
    `Producto: ${faltante.producto_nombre} (${faltante.producto_codigo})`,
    `Categoría: ${faltante.categoria}`,
    `Sucursal: ${faltante.sucursal}`,
    `Cantidad solicitada: ${faltante.cantidad_solicitada}`,
    // Si no hay nombre de cliente, muestro un texto por defecto en vez de dejarlo vacío
    `Cliente: ${faltante.cliente_nombre || 'No especificado'}`,
    `Registrado por: ${faltante.registrado_por}`,
    `Observaciones: ${faltante.observaciones || 'Ninguna'}`,
    // Formateo la fecha en horario y formato de Honduras
    `Fecha: ${new Date(faltante.fecha_registro).toLocaleString('es-HN')}`,
  ].join('\n');

  try {
    await getTransporter().sendMail({
      from: process.env.EMAIL_USER,
      to: destinatario,
      subject: asunto,
      text: texto,
    });
  } catch (err) {
    // Si el correo falla, no quiero que se caiga el sistema, solo lo dejo registrado en consola
    console.error('Error al enviar notificación de faltante por correo:', err.message);
  }
}

module.exports = { notificarFaltante };
