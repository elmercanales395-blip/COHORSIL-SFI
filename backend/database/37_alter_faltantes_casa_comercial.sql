-- Casa comercial (distribuidora/marca dueña) del producto de la competencia que pidió el
-- cliente. Solo aplica cuando producto_solicitado tiene valor (texto libre, igual que ese campo)

ALTER TABLE Faltantes ADD casa_comercial VARCHAR(100) NULL;
GO
