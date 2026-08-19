-- Mismo cambio que en 35, pero para la vista de faltantes eliminados

ALTER VIEW vw_FaltantesEliminados AS
SELECT
    f.id AS faltante_id,
    p.codigo AS producto_codigo,
    p.nombre AS producto_nombre,
    p.categoria,
    f.producto_solicitado,
    ps.nombre AS producto_sustituto,
    f.resultado_venta,
    s.nombre AS sucursal,
    u.nombre AS registrado_por,
    f.cantidad_solicitada,
    f.cliente_nombre,
    f.observaciones,
    f.estado,
    f.fecha_registro,
    f.fecha_resuelto,
    f.fecha_eliminacion
FROM Faltantes f
LEFT JOIN Productos p ON p.id = f.producto_id
LEFT JOIN Productos ps ON ps.id = f.producto_sustituto_id
JOIN Sucursales s ON s.id = f.sucursal_id
JOIN Usuarios u ON u.id = f.usuario_id
WHERE f.activo = 0;
