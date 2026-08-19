-- vw_FaltantesDetalle: LEFT JOIN con Productos porque producto_id ahora puede ser NULL, y se
-- agregan producto_solicitado, el nombre del sustituto sugerido, y resultado_venta

ALTER VIEW vw_FaltantesDetalle AS
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
    DATEDIFF(DAY, f.fecha_registro, ISNULL(f.fecha_resuelto, GETDATE())) AS dias_transcurridos
FROM Faltantes f
LEFT JOIN Productos p ON p.id = f.producto_id
LEFT JOIN Productos ps ON ps.id = f.producto_sustituto_id
JOIN Sucursales s ON s.id = f.sucursal_id
JOIN Usuarios u ON u.id = f.usuario_id
WHERE f.activo = 1;
