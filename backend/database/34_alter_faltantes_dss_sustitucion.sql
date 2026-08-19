-- Sistema de apoyo a decisiones comerciales: sustitución de productos y marcas de la
-- competencia. producto_id queda NULL cuando el cliente pidió una marca externa que no está
-- en catálogo; en ese caso se guarda producto_solicitado (texto libre). producto_sustituto_id
-- guarda el producto propio recomendado/ofrecido como sustituto. resultado_venta registra si
-- esa venta se concretó con el sustituto o se perdió (NULL = todavía sin decidir).

ALTER TABLE Faltantes ALTER COLUMN producto_id INT NULL;
GO

ALTER TABLE Faltantes ADD producto_solicitado VARCHAR(150) NULL;
GO

ALTER TABLE Faltantes ADD producto_sustituto_id INT NULL
    FOREIGN KEY REFERENCES Productos(id);
GO

ALTER TABLE Faltantes ADD resultado_venta VARCHAR(20) NULL
    CHECK (resultado_venta IN ('convertida', 'perdida'));
GO

-- Siempre debe haber uno de los dos: un producto del catálogo, o el texto de lo que pidió el cliente
ALTER TABLE Faltantes ADD CONSTRAINT CK_Faltantes_ProductoOTexto
    CHECK (producto_id IS NOT NULL OR producto_solicitado IS NOT NULL);
GO
