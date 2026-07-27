# Manual de Usuario
## Sistema de Registro de Faltantes "No Hay" — COHORSIL

> ¡Somos Innovación Agropecuaria!

---

## 1. ¿Qué es este sistema?

El sistema de **Registro de Faltantes "No Hay"** permite registrar, de forma rápida, los productos que un cliente solicita en una sucursal y que en ese momento **no están disponibles en inventario** (por ejemplo, un fertilizante o un fungicida agotado).

Con esta información, los departamentos de **Compras** e **Inventarios** pueden:

- Saber qué productos se están pidiendo y no se están pudiendo entregar.
- Identificar qué sucursales tienen más faltantes.
- Medir qué tan rápido se resuelven esos faltantes (reabastecimiento).
- Recibir un correo automático cada vez que se registra un faltante nuevo.

---

## 2. Roles de usuario

El sistema tiene dos tipos de usuario:

| Rol | Puede hacer |
|---|---|
| **Usuario (empleado de sucursal)** | Iniciar sesión, registrar faltantes, ver el listado de faltantes activos, marcarlos como resueltos, eliminarlos y ver los reportes. |
| **Administrador (admin)** | Todo lo anterior, más acceso a la sección **Eliminados**: buscar, restaurar o eliminar definitivamente los faltantes que fueron borrados. |

> Las cuentaas de usuario las crea el administrador.

---

## 3. Iniciar sesión

1. Abre la dirección del sistema en tu navegador (te la proporciona tu administrador).
2. Ingresa tu **correo** y **contraseña**.
3. Presiona **Ingresar**.

Si el correo o la contraseña no son correctos, el sistema mostrará un mensaje de error indicando cuál dato falló.

La sesión permanece iniciada aunque recargues la página. Para salir, usa el botón **Cerrar sesión** en la esquina superior derecha.

---

## 4. Pantalla principal: Faltantes

Al iniciar sesión llegas a la página **Faltantes**, que tiene dos partes: el formulario para registrar un producto no disponible, y la tabla de faltantes ya registrados.

### 4.1 Registrar un producto no disponible

El formulario usa una selección **en cascada**: primero eliges categoría y zona, y luego el sistema filtra las opciones siguientes.

1. **Categoría**: elige el tipo de producto (por ejemplo, *Fertilizante* o *Fungicidas*).
2. **Producto**: se habilita solo después de elegir categoría, y muestra únicamente los productos de esa categoría (por ejemplo, "12-24-12 43 kg" o "Alto LT").
3. **Zona**: elige la zona geográfica de la sucursal.
4. **Sucursal**: se habilita solo después de elegir zona, y muestra únicamente las sucursales de esa zona.
5. **Cantidad solicitada**: cuántas unidades pidió el cliente (mínimo 1).
6. **Cliente** *(opcional)*: nombre del cliente que hizo la solicitud.
7. **Observaciones** *(opcional)*: cualquier detalle adicional (por ejemplo, "cliente espera para la próxima semana").
8. Presiona **Registrar faltante**.

Al registrarse, el faltante aparece de inmediato en la tabla de abajo, y el sistema **envía un correo automático** al encargado de compras/inventarios avisando del nuevo faltante.

### 4.2 Tabla de faltantes registrados

Muestra todos los faltantes activos (no eliminados), con:

- Producto, sucursal, cantidad, cliente, quién lo registró y cuándo.
- **Estado**: `pendiente` (aún sin resolver) o `resuelto`.
- **Días**: cuántos días han pasado desde que se registró.

Acciones disponibles por fila:

- **Resolver**: marca el faltante como resuelto (solo visible si está pendiente). Úsalo cuando el producto ya fue reabastecido o entregado al cliente.
- **Eliminar**: quita el faltante de esta lista (borrado lógico, no se pierde el registro — un administrador puede verlo y restaurarlo desde la sección de Eliminados).

---

## 5. Reportes

La página **Reportes** presenta cuatro tableros pensados para apoyar la toma de decisiones de Compras e Inventarios:

### 5.1 Faltantes pendientes
Lista de todos los faltantes que **todavía no se han resuelto**, con los días que llevan esperando. Útil para dar seguimiento diario.

### 5.2 Faltantes por producto
Agrupa por producto cuántas veces se ha reportado, cuántas unidades se han solicitado en total, y cuántos de esos reportes siguen pendientes. Ayuda a decidir qué comprar primero.

### 5.3 Faltantes por sucursal
Muestra el total de faltantes de cada sucursal, separando pendientes de resueltos. Ayuda a identificar qué sucursales tienen más problemas de abastecimiento.

### 5.4 Tiempo promedio de resolución
Por producto, muestra cuántos faltantes se han resuelto y el promedio de días que tardó resolverlos. Sirve para medir qué tan rápido reacciona la cadena de abastecimiento.

---

## 6. Faltantes eliminados (solo Administrador)

Esta sección solo aparece en el menú si tu usuario tiene rol **admin**. Permite:

1. **Buscar** un faltante eliminado por código o nombre de producto.
2. **Filtrar** por fecha de eliminación.
3. **Restaurar**: regresa el faltante a la lista de activos (página Faltantes), por si se eliminó por error.
4. **Eliminar definitivamente**: borra el registro para siempre de la base de datos. El sistema pedirá una confirmación antes de hacerlo porque **esta acción no se puede deshacer**.

---

## 7. Notificaciones por correo

Cada vez que se registra un faltante nuevo, el sistema envía automáticamente un correo al encargado configurado, con el detalle del producto, sucursal, cantidad, cliente y observaciones. No requiere ninguna acción adicional del usuario que registra el faltante.

---

## 8. Preguntas frecuentes

**¿Qué hago si me equivoco al registrar un faltante?**
Usa el botón **Eliminar** en la tabla de Faltantes. Si necesitas recuperarlo, pide a un administrador que lo restaure desde la sección Eliminados.

**¿Por qué no puedo elegir un producto o sucursal?**
Los selects de Producto y Sucursal se habilitan solo después de elegir Categoría y Zona respectivamente. Elige primero esos campos.

**¿Qué significa el estado "pendiente"?**
Que el faltante fue registrado pero todavía no se ha marcado como resuelto (el producto aún no ha sido reabastecido o entregado).

**No veo la sección "Eliminados" en el menú.**
Esa sección solo está disponible para usuarios con rol de administrador.

**Olvidé mi contraseña.**
Contacta a tu administrador para que la restablezca; el sistema no tiene todavía una opción de autoservicio para esto.
