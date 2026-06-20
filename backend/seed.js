// Script para insertar datos de prueba con passwords hasheados reales
const bcrypt = require('bcryptjs');
const sequelize = require('./config/database');
const { Usuario, Estudiante, Menu } = require('./models');
require('dotenv').config();

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Conectado a MySQL...');
    await sequelize.sync({ force: true }); // CUIDADO: borra y recrea tablas

    const hashAdmin = await bcrypt.hash('admin123', 10);
    const hashEst   = await bcrypt.hash('est123', 10);

    const admin = await Usuario.create({ nombre: 'Administrador Principal', correo: 'admin@smartfood.co', password: hashAdmin, rol: 'admin' });
    const u2 = await Usuario.create({ nombre: 'María García',   correo: 'maria@smartfood.co',  password: hashEst, rol: 'estudiante' });
    const u3 = await Usuario.create({ nombre: 'Juan Pérez',     correo: 'juan@smartfood.co',   password: hashEst, rol: 'estudiante' });
    const u4 = await Usuario.create({ nombre: 'Laura Martínez', correo: 'laura@smartfood.co',  password: hashEst, rol: 'estudiante' });
    const u5 = await Usuario.create({ nombre: 'Carlos Ruiz',    correo: 'carlos@smartfood.co', password: hashEst, rol: 'estudiante' });
    const u6 = await Usuario.create({ nombre: 'Ana Torres',     correo: 'ana@smartfood.co',    password: hashEst, rol: 'estudiante' });

    await Estudiante.bulkCreate([
      { id_usuario: u2.id_usuario, curso: '9°A',  ciudad: 'San Juan de Nepomuceno', alergias: 'Ninguna',  preferencias: 'ninguna' },
      { id_usuario: u3.id_usuario, curso: '10°B', ciudad: 'San Juan de Nepomuceno', alergias: 'Gluten',   preferencias: 'sin-gluten' },
      { id_usuario: u4.id_usuario, curso: '11°A', ciudad: 'San Juan de Nepomuceno', alergias: 'Lactosa',  preferencias: 'ninguna' },
      { id_usuario: u5.id_usuario, curso: '8°A',  ciudad: 'San Juan de Nepomuceno', alergias: 'Ninguna',  preferencias: 'ninguna' },
      { id_usuario: u6.id_usuario, curso: '7°B',  ciudad: 'San Juan de Nepomuceno', alergias: 'Mariscos', preferencias: 'ninguna' },
    ]);

    const hoy = new Date();
    for (let i = 0; i < 5; i++) {
      const d = new Date(hoy); d.setDate(hoy.getDate() + i);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      const menus = [
        { entrada: 'Sopa de lentejas',    plato_principal: 'Arroz con pollo guisado',     bebida: 'Jugo de maracuyá',   postre: 'Gelatina de fresa' },
        { entrada: 'Crema de zanahoria',  plato_principal: 'Sancocho de res con arroz',    bebida: 'Limonada natural',   postre: 'Fruta de temporada' },
        { entrada: 'Consomé de pollo',    plato_principal: 'Bandeja paisa',                bebida: 'Jugo de guanábana',  postre: 'Arroz con leche' },
        { entrada: 'Sopa de pasta',       plato_principal: 'Pescado frito con patacones',  bebida: 'Agua de panela',     postre: 'Helado de coco' },
        { entrada: 'Caldo de costilla',   plato_principal: 'Ajiaco santafereño',           bebida: 'Jugo de mora',       postre: 'Gelatina de uva' },
      ];
      await Menu.create({ fecha: d.toISOString().split('T')[0], ...menus[i % 5], creado_por: admin.id_usuario });
    }

    console.log('✅ Datos de prueba insertados correctamente');
    console.log('   admin@smartfood.co / admin123');
    console.log('   maria@smartfood.co / est123');
    process.exit(0);
  } catch (e) {
    console.error('❌ Error en seed:', e.message);
    process.exit(1);
  }
}

seed();
