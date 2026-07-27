# SRF - Sistema de Registro de Faltantes (COHORSIL)

Módulo para registrar productos agotados ("faltantes") por sucursal y generar reportería para
los departamentos de compras e inventarios. Backend en Node/Express + SQL Server, frontend en
React + Vite.

## Requisitos

- Node.js (v18 o superior recomendado) y npm
- SQL Server (Express o superior)
- **ODBC Driver 18 for SQL Server** instalado en la máquina donde corre el backend — el driver
  `msnodesqlv8` lo necesita para conectarse
- El backend se conecta a SQL Server con **autenticación de Windows** (`trustedConnection`). Si el
  servidor de destino usa autenticación de SQL Server (usuario/contraseña) en vez de Windows, hay
  que ajustar `backend/src/config/db.js` antes de desplegar

## 1. Base de datos

1. Crear una base de datos vacía en SQL Server (ej. `srf_faltantes`).
2. Ejecutar los scripts de `backend/database/` **en orden numérico** (01 al 33) contra esa base,
   desde SQL Server Management Studio o `sqlcmd`. Crean las tablas, las vistas de reportería y
   cargan el catálogo de productos/sucursales de ejemplo.

## 2. Backend

```
cd backend
npm install
copy .env.example .env    (en Windows; en Linux/Mac: cp .env.example .env)
```

Llenar `.env` con los datos reales:

- `DB_SERVER`, `DB_INSTANCE`, `DB_DATABASE`: datos de conexión a la base creada en el paso 1
- `JWT_SECRET`: un valor largo y aleatorio (no usar el de desarrollo en producción)
- `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_TO`: cuenta de Gmail que envía el aviso automático cuando se
  registra un faltante. `EMAIL_PASS` debe ser una [contraseña de aplicación de
  Gmail](https://myaccount.google.com/apppasswords), no la contraseña normal de la cuenta

Levantar el servidor:

```
npm run dev
```

Por defecto queda escuchando en el puerto 3000 (`http://localhost:3000/api`).

## 3. Frontend

```
cd frontend
npm install
copy .env.example .env
```

`VITE_API_URL` debe apuntar a la URL del backend (incluyendo `/api`).

Para desarrollo:

```
npm run dev
```

Para producción (genera la carpeta `dist/` con los archivos estáticos a publicar):

```
npm run build
```

## Notas

- Los datos reales (usuarios, faltantes registrados) no viajan por este repositorio — solo la
  estructura de la base y el catálogo semilla de productos/sucursales.
- El primer usuario administrador hay que crearlo directamente en la tabla `Usuarios` (insertando
  un registro con `rol = 'admin'` y el hash de la contraseña), ya que el registro de usuarios
  desde la app requiere estar logueado como admin.
