# 📦 Guía de Instalación — SmartFood

## Requisitos previos
- Node.js v18 o superior → https://nodejs.org
- MySQL 8.0 → https://dev.mysql.com/downloads/mysql/
- Git → https://git-scm.com

---

## Paso 1 — Clonar / descomprimir el proyecto
```bash
cd escritorio
# Si descargaste el ZIP, descomprime la carpeta smartfood ahí
```

## Paso 2 — Crear la base de datos
1. Abre MySQL Workbench o la terminal MySQL
2. Ejecuta el archivo `database/smartfood.sql`
```sql
source C:/ruta/smartfood/database/smartfood.sql
```

## Paso 3 — Configurar el backend
```bash
cd smartfood/backend
npm install
cp .env.example .env
```
Edita el archivo `.env` con tus datos:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=smartfood
JWT_SECRET=smartfood_secreto_2026
```

## Paso 4 — Insertar datos de prueba
```bash
node seed.js
```
Esto crea las cuentas:
- **Admin:** admin@smartfood.co / admin123
- **Estudiante:** maria@smartfood.co / est123

## Paso 5 — Ejecutar el servidor
```bash
npm run dev     # modo desarrollo (con nodemon)
# ó
npm start       # modo producción
```
El sistema estará en: **http://localhost:3000**

---

## ¿Problemas comunes?
| Error | Solución |
|-------|----------|
| `ECONNREFUSED` | MySQL no está corriendo. Inicia el servicio. |
| `Unknown database` | Ejecuta primero `smartfood.sql` |
| `Port 3000 in use` | Cambia `PORT=3001` en `.env` |
| `npm not found` | Instala Node.js desde nodejs.org |
