ALTER VIEW vw_TiempoResolucionPromedio AS
SELECT
    p.id AS producto_id,
    p.nombre AS producto,
    COUNT(f.id) AS faltantes_resueltos,
    AVG(DATEDIFF(DAY, f.fecha_registro, f.fecha_resuelto)) AS promedio_dias_resolucion
FROM Faltantes f
JOIN Productos p ON p.id = f.producto_id
WHERE f.estado = 'resuelto' AND f.fecha_resuelto IS NOT NULL AND f.activo = 1
GROUP BY p.id, p.nombre;
