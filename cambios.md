# Historial de cambios — SmartFood

## [23/06/2026]

### 1. Separar "menú de hoy" de "menú de mañana"

**Qué se hizo:**
Se crearon dos rutas distintas en el backend (`routes/menu.js`):
- `GET /api/menu` → ahora devuelve solo el menú de MAÑANA
- `GET /api/menu/hoy` → nueva ruta que devuelve solo el menú de HOY

En el frontend (`js/api.js`) se renombró la función `menuHoy()` a `menuManana()` y se agregó una nueva `menuHoy()`.

**Para qué sirve:**
Antes la ruta `GET /api/menu` buscaba cualquier menú con fecha >= hoy y devolvía el primero que encontraba. Si hoy era martes y existían menús para martes y miércoles, devolvía el de martes. Eso no servía porque:
- Los estudiantes necesitan confirmar para MAÑANA, no para hoy
- El menú de hoy ya se comió, debería verse como pasado

Ahora cada cosa tiene su endpoint: uno para mostrar el menú de hoy (solo lectura) y otro para el menú de mañana (para confirmar).

---

### 2. Admin ahora busca confirmaciones de mañana

**Qué se hizo:**
En `routes/confirmacion.js`, la ruta `GET /api/confirmacion/todas` (que usa el admin) cambió su fecha por defecto de "hoy" a "mañana".

```js
// Antes:
const fecha = req.query.fecha || new Date().toISOString().split('T')[0];

// Después:
let fecha = req.query.fecha;
if (!fecha) {
  const manana = new Date(); manana.setDate(manana.getDate() + 1);
  fecha = manana.toISOString().split('T')[0];
}
```

**Para qué sirve:**
Este era el bug principal que reportaste. Cuando el admin creaba un menú para mañana y los estudiantes confirmaban, el admin iba a "Confirmaciones" y no veía nada. ¿Por qué? Porque el sistema buscaba confirmaciones para la fecha de HOY, pero el menú creado era para MAÑANA. Al no encontrar menú para hoy, devolvía lista vacía. Ahora busca mañana por defecto.

---

### 3. Dashboard del estudiante con dos tarjetas

**Qué se hizo:**
En `js/estudiante.js`, la función `cargarDashboard()` se reescribió completamente. Antes cargaba una sola tarjeta con el menú que viniera de la API. Ahora carga dos:

1. **Menú de hoy** (con opacidad reducida al 65% y badge "Pasado") — solo para consultar
2. **Menú de mañana** (con borde azul, badge de estado, botón para ir a confirmar y barra de progreso)

**Para qué sirve:**
El estudiante necesita ver QUÉ se comió hoy (informativo) y QUÉ se comerá mañana (para decidir si confirma). Antes todo se mezclaba en una sola tarjeta y el menú de hoy aparecía como "disponible para confirmar" cuando ya debería estar cerrado.

---

### 4. Arreglar `as: undefined` en el historial

**Qué se hizo:**
En `routes/confirmacion.js` se cambió:
```js
// Antes:
include: [{ model: Menu, as: undefined, attributes: [...] }]

// Después:
include: [{ model: Menu, attributes: [...] }]
```

**Para qué sirve:**
En Sequelize (el ORM que usa el proyecto), cuando relacionas dos modelos con `belongsTo` sin especificar un alias (`as`), Sequelize usa el nombre del modelo por defecto. Pero si escribes `as: undefined` explícitamente, Sequelize interpreta "undefined" como un string y busca una asociación llamada "undefined", que no existe. Esto hace que la consulta falle silenciosamente y el historial del estudiante se vea vacío o incompleto.

---

### 5. Corregir división por cero en barras de progreso

**Qué se hizo:**
En `js/estudiante.js` se agregó una validación antes de calcular el porcentaje:
```js
// Antes:
Math.round(conteo.confirmados / conteo.total * 100)

// Después:
conteo.total > 0 ? Math.round(conteo.confirmados / conteo.total * 100) : 0
```

**Para qué sirve:**
Si no hay estudiantes registrados en el sistema, `conteo.total` vale 0. Dividir por 0 en JavaScript da `Infinity`, y al asignar `width: Infinity%` a una barra de progreso, el navegador no sabe cómo mostrarlo. La barra simplemente no se ve o se rompe. Preguntar "¿total es mayor que 0?" antes de dividir evita el error.

---

### 6. Eliminar ID duplicado `adm-toast`

**Qué se hizo:**
En `index.html` había dos elementos con `id="adm-toast"`:
- Uno en la página de estudiante (dentro del dashboard)
- Otro en la página de admin

Se eliminó el que estaba en la página de estudiante.

**Para qué sirve:**
Los `id` en HTML deben ser únicos. Si hay dos elementos con el mismo `id`, `document.getElementById('adm-toast')` puede devolver cualquiera de los dos, o comportarse distinto según el navegador. En este caso, cuando el admin usaba notificaciones, el mensaje podía aparecer en el lugar equivocado o no aparecer.

---

### 7. Arreglar cálculo de semana los domingos

**Qué se hizo:**
En `routes/menu.js` y `routes/reportes.js`, se cambió la fórmula para calcular el lunes de la semana actual:
```js
// Antes (roto en domingo):
lunes.setDate(hoy.getDate() - hoy.getDay() + 1)

// Después:
lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7))
```

**Para qué sirve:**
`getDay()` devuelve 0 para domingo, 1 para lunes, ..., 6 para sábado. Con la fórmula original, el domingo:
- `0 - 0 + 1 = 1`, o sea `fecha_actual + 1` = **lunes de la SIGUIENTE semana**
- Esto hacía que el menú semanal mostrara la semana equivocada

La nueva fórmula usa `(getDay() + 6) % 7` que convierte:
- Domingo (0) → 6 (para restar 6 y llegar al lunes actual)
- Lunes (1) → 0 (no resta nada, se queda en lunes)
- ...
- Sábado (6) → 5 (resta 5 para llegar al lunes actual)

---

### 8. Texto en el panel de confirmaciones del admin

**Qué se hizo:**
En `js/admin.js` se agregó código para mostrar la fecha de mañana en el encabezado de la sección de confirmaciones. En `index.html` se cambió el texto estático de "Confirmaciones del día" a solo "Confirmaciones" con un span para la fecha dinámica.

**Para qué sirve:**
Antes decía "Confirmaciones del día" pero mostraba las de mañana, lo cual era confuso. Ahora el admin ve claramente QUÉ fecha está consultando.

---

## [24/06/2026]

### 9. Validar que los menús solo se creen para fechas futuras

**Qué se hizo:**
En `routes/menu.js`, al crear un menú (POST), se agregó una validación que compara la fecha ingresada con la fecha de mañana:

```js
const manana = new Date(); manana.setDate(manana.getDate() + 1);
const fechaMin = manana.toISOString().split('T')[0];
if (fecha < fechaMin) return res.status(400).json({ 
  error: `No puedes crear menús para hoy o fechas pasadas. La fecha mínima es ${fechaMin}.` 
});
```

**Para qué sirve:**
Antes se podía crear un menú para cualquier fecha, incluso días pasados o el mismo día. Eso no tiene sentido porque:
- El menú de hoy ya debería estar definido desde antes
- Si alguien se equivoca y pone una fecha pasada, el sistema debería rechazarlo
- Los estudiantes confirman para MAÑANA, entonces crear un menú para hoy o antes no tiene propósito

Ahora el sistema solo permite crear menús para mañana o días posteriores.

---

### 10. Eliminar registro de usuarios

**Qué se hizo:**
Se eliminó TODO lo relacionado con el registro de cuentas:

**Backend:**
- En `routes/auth.js` se eliminó la ruta `POST /api/auth/register` completa
- Se quitó `Notificacion` del require ya no se necesitaba

**Frontend:**
- En `index.html` se eliminó todo el bloque `<div id="page-register">` (la página de registro)
- En `index.html` se eliminó el botón "¿No tienes cuenta? Regístrate aquí" del login
- En `js/app.js` se eliminó la función `doRegister()`
- En `js/api.js` se eliminó la función `register()`

**Para qué sirve:**
Cualquier persona con el link podía entrar y crear una cuenta sin pertenecer a la institución. Como los estudiantes recibirán sus cuentas ya creadas por los administradores (con correo institucional y contraseña), ya no es necesario que nadie se registre por su cuenta. Solo existen dos formas de tener cuenta: que el admin la cree manualmente, o que vengan pre-cargadas en el sistema.

---

### 11. Actualizar seed.js con nuevos usuarios institucionales

**Qué se hizo:**
Se reescribió `seed.js` para que genere:

- **2 administradores:**
  - `admin@smartfood.co` / `admin123` (Administrador Principal)
  - `coordinador@smartfood.co` / `coord123` (Coordinador Académico)

- **10 estudiantes** con correos institucionales:
  - `estudiante1@smartfood.co` a `estudiante10@smartfood.co`
  - Todos con contraseña `est123`
  - Distribuidos en cursos de 7° a 11°
  - Algunos con alergias y preferencias variadas para probar

- **5 menús de muestra** para los próximos 5 días hábiles (saltando sábado y domingo)

**Para qué sirve:**
Cuando despliegues la página, no partirás de cero. Ya tendrás:
- Dos administradores (tú y otro encargado) listos para entrar
- Diez estudiantes para hacer pruebas reales entre dispositivos
- Menús para los próximos días para que los estudiantes puedan confirmar

Solo tienes que correr `npm run seed` después de crear la base de datos y todo queda listo.

---

### 12. Agregar Morgan para monitoreo de peticiones

**Qué se hizo:**
Se instaló la librería `morgan` y se agregó al servidor (`server.js`):
```js
const morgan = require('morgan');
app.use(morgan('dev')); // logs en consola
// También guarda logs en un archivo access.log
const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: logStream }));
```

---

### 13. Eliminar cuentas de prueba del login

**Qué se hizo:**
En `index.html` se eliminó todo el bloque `div.demo-box` que mostraba los correos y contraseñas de prueba debajo del formulario de login.

**Para qué sirve:**
Cuando el proyecto esté en producción (en Render), cualquier persona que entre a la URL podría ver las credenciales y entrar sin permiso. Los administradores ya saben sus cuentas, y los estudiantes recibirán las suyas por otro medio. No tiene sentido mostrar las claves en la página pública.

---

**Para qué sirve:**
Morgan registra CADA petición HTTP que recibe el servidor. En consola se ve algo así:
```
POST /api/auth/login 200 12.345 ms
GET /api/menu 404 5.123 ms
GET /api/confirmacion/todas 200 8.456 ms
```
Esto permite ver:
- Qué usuarios están haciendo peticiones (según su IP)
- A qué hora entran
- Qué errores devuelve el servidor (códigos 400, 404, 500)
- Cuánto tarda cada petición

Además se guarda todo en `backend/access.log` para revisarlo después.

---

## [25/06/2026]

### 14. Menú lateral responsive (hamburguesa)

**Qué se hizo:**
En `index.html`:
- Se agregó un botón ☰ (`sidebar-toggle`) en el navbar (visible solo en mobile)
- Se agregó un `div.sidebar-backdrop` (fondo oscuro semitransparente) que se activa al abrir el menú
- Todos los `onclick` del sidebar ahora también llaman `toggleSidebar()` para cerrar el menú tras navegar

En `js/app.js`:
- Se agregó la función `toggleSidebar()` que alterna la clase `open` en sidebar y backdrop

En `css/styles.css`:
- El sidebar pasa a `position: fixed` en mobile, oculto a la izquierda con `transform: translateX(-100%)`
- Al abrirse (`sidebar.open`) se desliza con `transform: translateX(0)` y sombra
- El backdrop aparece con opacidad

**Para qué sirve:**
En celulares, el sidebar ocupaba todo el ancho y rompía el diseño. Ahora se oculta detrás del borde izquierdo y solo se ve cuando el usuario toca el ☰. Tocar una opción o el fondo oscuro lo cierra automáticamente.

---

### 15. Arreglar estadísticas del panel admin

**Qué se hizo:**
En `routes/reportes.js`, el endpoint `GET /api/reportes/estadisticas` buscaba el menú de HOY para contar confirmados/cancelados. Se cambió para buscar el menú de MAÑANA:

```js
// Antes:
const hoy = new Date().toISOString().split('T')[0];
const menuHoy = await Menu.findOne({ where: { fecha: hoy } });

// Después:
const manana = new Date(); manana.setDate(manana.getDate() + 1);
const fecha = manana.toISOString().split('T')[0];
const menu = await Menu.findOne({ where: { fecha } });
```

En `index.html` se actualizaron las etiquetas:
- "Confirmados hoy" → "Confirmados mañana"
- "Cancelados hoy" → "Cancelados mañana"
- "Confirmaciones de hoy" → "Confirmaciones de mañana" (panel y reportes)

**Para qué sirve:**
El panel siempre mostraba `Confirmados: 0`, `Cancelados: 0` y `Sin responder: N` aunque los estudiantes ya hubieran confirmado. El error era que contaba confirmaciones sobre el menú de HOY, pero los estudiantes confirman para MAÑANA. Al no haber menú para hoy, todos los contadores daban cero.

---

### 16. Agregar logo SmartFood

**Qué se hizo:**
- Se copió el archivo `logo SmartFood 1.png` a `frontend/images/logo.png`
- En `index.html`:
  - Login: se reemplazó `<i class="ti ti-leaf"></i>` por `<img src="images/logo.png">` en `auth-logo-icon`
  - Navbar estudiante: el ícono de hoja por la imagen con clase `navbar-logo`
  - Navbar admin: igual
- En `css/styles.css` se agregó `.navbar-logo { width: 28px; height: 28px; object-fit: contain; }`
- Se agregó `<link rel="icon" href="images/logo.png">` en el `<head>`

**Para qué sirve:**
La página se veía genérica con el ícono de hoja de Tabler Icons. Ahora muestra el logo real del proyecto, dando identidad visual.
