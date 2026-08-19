-- Agrega casa_comercial a vw_FaltantesDetalle (ver 37_alter_faltantes_casa_comercial.sql)

ALTER VIEW vw_FaltantesDetalle AS
SELECT
    f.id AS faltante_id,
    p.codigo AS producto_codigo,
    p.nombre AS producto_nombre,
    p.categoria,
    f.producto_solicitado,
    f.casa_comercial,
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
GO
