CREATE TABLE Productos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    categoria VARCHAR(100) NULL,
    unidad_medida VARCHAR(20) NULL,
    activo BIT NOT NULL DEFAULT 1
);
