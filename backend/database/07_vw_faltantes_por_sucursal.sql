CREATE VIEW vw_FaltantesPorSucursal AS
SELECT
    s.id AS sucursal_id,
    s.nombre AS sucursal,
    COUNT(f.id) AS total_faltantes,
    SUM(CASE WHEN f.estado = 'pendiente' THEN 1 ELSE 0 END) AS pendientes,
    SUM(CASE WHEN f.estado = 'resuelto' THEN 1 ELSE 0 END) AS resueltos
FROM Faltantes f
JOIN Sucursales s ON s.id = f.sucursal_id
GROUP BY s.id, s.nombre;
