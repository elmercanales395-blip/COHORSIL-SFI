CREATE TABLE Sucursales (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(200) NULL,
    telefono VARCHAR(20) NULL,
    activo BIT NOT NULL DEFAULT 1
);
