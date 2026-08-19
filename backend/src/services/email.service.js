const nodemailer = require('nodemailer');

// para no recrear la conexión SMTP en cada correo
let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // app password de gmail, no la contraseña normal
      },
    });
  }
  return transporter;
}

async function notificarFaltante(faltante) {
  const destinatario = process.env.EMAIL_TO;
  // si no está configurado el .env no tumbo el sistema, solo aviso en consola
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !destinatario) {
    console.warn('Notificación de faltante omitida: EMAIL_USER, EMAIL_PASS o EMAIL_TO no configurados en .env');
    return;
  }

  // si es marca de la competencia no hay producto_nombre, solo el texto libre de producto_solicitado
  const nombreProducto = faltante.producto_nombre || `${faltante.producto_solicitado} (competencia, fuera de catálogo)`;

  const asunto = `Faltante reportado: ${nombreProducto} (${faltante.sucursal})`;
  const texto = [
    `Se registró un nuevo faltante en el sistema.`,
    ``,
    `Producto: ${nombreProducto}${faltante.producto_codigo ? ` (${faltante.producto_codigo})` : ''}`,
    ...(faltante.producto_sustituto ? [`Sustituto sugerido: ${faltante.producto_sustituto}`] : []),
    `Categoría: ${faltante.categoria || 'N/A'}`,
    `Sucursal: ${faltante.sucursal}`,
    `Cantidad solicitada: ${faltante.cantidad_solicitada}`,
    `Cliente: ${faltante.cliente_nombre || 'No especificado'}`,
    `Registrado por: ${faltante.registrado_por}`,
    `Observaciones: ${faltante.observaciones || 'Ninguna'}`,
    `Fecha: ${new Date(faltante.fecha_registro).toLocaleString('es-HN')}`, // hora de Honduras
  ].join('\n');

  try {
    await getTransporter().sendMail({
      from: process.env.EMAIL_USER,
      to: destinatario,
      subject: asunto,
      text: texto,
    });
  } catch (err) {
    console.error('Error al enviar notificación de faltante por correo:', err.message);
  }
}

// a diferencia de notificarFaltante, aquí NO se atrapa el error -- el job mensual necesita
// enterarse si falló para poder loguearlo
async function enviarReporteMensual({ pdfBuffer, excelBuffer, desde, hasta }) {
  const destinatario = process.env.EMAIL_TO;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !destinatario) {
    console.warn('Envío del reporte mensual omitido: EMAIL_USER, EMAIL_PASS o EMAIL_TO no configurados en .env');
    return;
  }

  const rango = `${new Date(`${desde}T00:00:00`).toLocaleDateString('es-GT')} al ${new Date(`${hasta}T00:00:00`).toLocaleDateString('es-GT')}`;

  await getTransporter().sendMail({
    from: process.env.EMAIL_USER,
    to: destinatario,
    subject: `Reporte mensual de faltantes: ${rango}`,
    text: `Se adjunta el reporte de inteligencia de negocio (PDF y Excel) correspondiente al periodo del ${rango}, incluyendo el ranking de marcas de la competencia más buscadas por los clientes.`,
    attachments: [
      { filename: `reporte-negocio_${desde}_a_${hasta}.pdf`, content: pdfBuffer },
      { filename: `reporte-negocio_${desde}_a_${hasta}.xlsx`, content: excelBuffer },
    ],
  });
}

module.exports = { notificarFaltante, enviarReporteMensual };
