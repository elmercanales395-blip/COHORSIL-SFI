// Cálculos de negocio compartidos entre el backend (PDF de reportes) y el frontend (resumen en
// pantalla), para que ambos usen la misma definición de "pendiente/resuelto" y la misma
// agrupación mensual. fecha_registro puede llegar como Date (driver de SQL Server, en el
// backend) o como string ISO (JSON ya serializado, en el frontend) — new Date(...) admite ambos.
export function calcularResumen(faltantes) {
  const total = faltantes.length;
  const pendientes = faltantes.filter((f) => f.estado === 'pendiente').length;
  const resueltos = total - pendientes;

  const porMes = new Map();
  faltantes.forEach((f) => {
    const clave = new Date(f.fecha_registro).toISOString().slice(0, 7);
    porMes.set(clave, (porMes.get(clave) || 0) + 1);
  });
  const tendencia = [...porMes.entries()].sort(([a], [b]) => a.localeCompare(b));

  return { total, pendientes, resueltos, tendencia };
}
