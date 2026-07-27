CREATE VIEW vw_FaltantesPendientes AS
SELECT *
FROM vw_FaltantesDetalle
WHERE estado = 'pendiente';
