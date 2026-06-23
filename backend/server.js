const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const fs = require('fs');
require('dotenv').config();

const sequelize = require('./config/database');
require('./models'); // registrar asociaciones

const app = express();

// Middlewares globales
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Morgan: log de peticiones HTTP
app.use(morgan('dev'));
// Guardar logs en archivo
const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: logStream }));

// Servir frontend estático
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas API
app.use('/api/auth',           require('./routes/auth'));
app.use('/api/menu',           require('./routes/menu'));
app.use('/api/confirmacion',   require('./routes/confirmacion'));
app.use('/api/usuarios',       require('./routes/usuarios'));
app.use('/api/notificaciones', require('./routes/notificaciones'));
app.use('/api/reportes',       require('./routes/reportes'));

// Ruta de salud
app.get('/api/salud', (req, res) => res.json({ estado: 'OK', sistema: 'SmartFood', version: '1.0.0' }));

// SPA fallback: todas las rutas devuelven index.html
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/index.html')));

// Iniciar servidor
const PORT = process.env.PORT || 3000;
sequelize.authenticate()
  .then(() => {
    console.log('✅ Conectado a MySQL');
    return sequelize.sync({ alter: false });
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 SmartFood corriendo en http://localhost:${PORT}`);
      console.log(`   Panel admin: http://localhost:${PORT}/index.html`);
    });
    // Activar jobs programados
    require('./cron');
  })
  .catch(e => {
    console.error('❌ Error al conectar a la base de datos:', e.message);
    console.error('   Verifica tu archivo .env y que MySQL esté corriendo');
    process.exit(1);
  });
