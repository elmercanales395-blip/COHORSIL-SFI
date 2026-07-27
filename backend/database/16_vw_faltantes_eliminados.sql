CREATE VIEW vw_FaltantesEliminados AS
SELECT
    f.id AS faltante_id,
    p.codigo AS producto_codigo,
    p.nombre AS producto_nombre,
    p.categoria,
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
JOIN Productos p ON p.id = f.producto_id
JOIN Sucursales s ON s.id = f.sucursal_id
JOIN Usuarios u ON u.id = f.usuario_id
WHERE f.activo = 0;
