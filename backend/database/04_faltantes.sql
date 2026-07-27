CREATE TABLE Faltantes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    producto_id INT NOT NULL FOREIGN KEY REFERENCES Productos(id),
    sucursal_id INT NOT NULL FOREIGN KEY REFERENCES Sucursales(id),
    usuario_id INT NOT NULL FOREIGN KEY REFERENCES Usuarios(id),
    cantidad_solicitada INT NOT NULL DEFAULT 1,
    cliente_nombre VARCHAR(150) NULL,
    observaciones VARCHAR(500) NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'resuelto')),
    fecha_registro DATETIME NOT NULL DEFAULT GETDATE(),
    fecha_resuelto DATETIME NULL
);
