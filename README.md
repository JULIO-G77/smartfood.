# 🥗 SmartFood

**Sistema de gestión del comedor escolar**  
I.E. Normal Superior Montes de María — San Juan de Nepomuceno, Bolívar

---

## ¿Qué es SmartFood?
Plataforma web que permite a los estudiantes confirmar anticipadamente si van a comer en el comedor, reduciendo el desperdicio de alimentos.

## Estructura del proyecto
```
smartfood/
├── frontend/          ← Aplicación web (HTML + CSS + JS)
│   ├── index.html     ← Página principal (SPA)
│   ├── css/styles.css ← Estilos globales
│   └── js/
│       ├── api.js         ← Comunicación con la API
│       ├── utils.js       ← Funciones utilitarias
│       ├── app.js         ← Controlador principal
│       ├── estudiante.js  ← Módulo estudiante
│       └── admin.js       ← Módulo administrador
├── backend/           ← Servidor Node.js + Express
│   ├── server.js      ← Punto de entrada
│   ├── seed.js        ← Datos de prueba
│   ├── cron.js        ← Notificaciones automáticas
│   ├── config/        ← Configuración DB
│   ├── models/        ← Modelos Sequelize
│   ├── routes/        ← Endpoints API REST
│   └── middleware/    ← Auth JWT
├── database/
│   └── smartfood.sql  ← Script SQL completo
└── docs/
    └── INSTALACION.md
```

## Instalación rápida
Ver `docs/INSTALACION.md`

## Tecnologías
- **Frontend:** HTML5, CSS3, JavaScript ES6+
- **Backend:** Node.js, Express.js
- **Base de datos:** MySQL + Sequelize ORM
- **Autenticación:** JWT + bcryptjs
- **Jobs automáticos:** node-cron

## Cuentas de prueba
| Rol | Correo | Contraseña |
|-----|--------|-----------|
| Admin | admin@smartfood.co | admin123 |
| Estudiante | maria@smartfood.co | est123 |
