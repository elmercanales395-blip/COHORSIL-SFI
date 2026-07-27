CREATE VIEW vw_FaltantesPorProducto AS
SELECT
    p.id AS producto_id,
    p.codigo,
    p.nombre AS producto,
    p.categoria,
    COUNT(f.id) AS veces_reportado,
    SUM(f.cantidad_solicitada) AS unidades_solicitadas,
    SUM(CASE WHEN f.estado = 'pendiente' THEN 1 ELSE 0 END) AS pendientes
FROM Faltantes f
JOIN Productos p ON p.id = f.producto_id
GROUP BY p.id, p.codigo, p.nombre, p.categoria;
