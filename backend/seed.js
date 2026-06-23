const bcrypt = require('bcryptjs');
const sequelize = require('./config/database');
const { Usuario, Estudiante, Menu } = require('./models');
require('dotenv').config();

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Conectado a MySQL...');
    await sequelize.sync({ force: true });

    const hashAdmin = await bcrypt.hash('admin123', 10);
    const hashCoord = await bcrypt.hash('coord123', 10);
    const hashEst   = await bcrypt.hash('est123', 10);

    // 2 Administradores
    const admin = await Usuario.create({ nombre: 'Administrador Principal', correo: 'admin@smartfood.co', password: hashAdmin, rol: 'admin' });
    await Usuario.create({ nombre: 'Coordinador Académico', correo: 'coordinador@smartfood.co', password: hashCoord, rol: 'admin' });

    // 10 Estudiantes
    const estudiantes = [
      { nombre: 'Sofía Martínez',  correo: 'estudiante1@smartfood.co', curso: '11°A', alergias: 'Ninguna',  preferencias: 'ninguna' },
      { nombre: 'Miguel Ángel Torres', correo: 'estudiante2@smartfood.co', curso: '11°B', alergias: 'Lactosa',  preferencias: 'ninguna' },
      { nombre: 'Valentina Rodríguez', correo: 'estudiante3@smartfood.co', curso: '10°A', alergias: 'Ninguna',  preferencias: 'vegetariano' },
      { nombre: 'Santiago Pérez',      correo: 'estudiante4@smartfood.co', curso: '10°B', alergias: 'Gluten',   preferencias: 'sin-gluten' },
      { nombre: 'Camila López',        correo: 'estudiante5@smartfood.co', curso: '9°A',  alergias: 'Ninguna',  preferencias: 'ninguna' },
      { nombre: 'Andrés García',       correo: 'estudiante6@smartfood.co', curso: '9°B',  alergias: 'Mariscos', preferencias: 'ninguna' },
      { nombre: 'Mariana González',    correo: 'estudiante7@smartfood.co', curso: '8°A',  alergias: 'Ninguna',  preferencias: 'vegano' },
      { nombre: 'Felipe Castro',       correo: 'estudiante8@smartfood.co', curso: '8°B',  alergias: 'Ninguna',  preferencias: 'ninguna' },
      { nombre: 'Isabella Ramírez',   correo: 'estudiante9@smartfood.co', curso: '7°A',  alergias: 'Lactosa',  preferencias: 'ninguna' },
      { nombre: 'Gabriel Mendoza',    correo: 'estudiante10@smartfood.co', curso: '7°B', alergias: 'Ninguna',  preferencias: 'ninguna' },
    ];

    for (const e of estudiantes) {
      const u = await Usuario.create({ nombre: e.nombre, correo: e.correo, password: hashEst, rol: 'estudiante' });
      await Estudiante.create({ id_usuario: u.id_usuario, curso: e.curso, alergias: e.alergias, preferencias: e.preferencias });
    }

    // Menús de muestra para los próximos 5 días hábiles
    const hoy = new Date();
    let diasCreados = 0;
    for (let i = 1; diasCreados < 5; i++) {
      const d = new Date(hoy); d.setDate(hoy.getDate() + i);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      const menus = [
        { entrada: 'Sopa de lentejas',    plato_principal: 'Arroz con pollo guisado',     bebida: 'Jugo de maracuyá',   postre: 'Gelatina de fresa' },
        { entrada: 'Crema de zanahoria',  plato_principal: 'Sancocho de res con arroz',    bebida: 'Limonada natural',   postre: 'Fruta de temporada' },
        { entrada: 'Consomé de pollo',    plato_principal: 'Bandeja paisa',                bebida: 'Jugo de guanábana',  postre: 'Arroz con leche' },
        { entrada: 'Sopa de pasta',       plato_principal: 'Pescado frito con patacones',  bebida: 'Agua de panela',     postre: 'Helado de coco' },
        { entrada: 'Caldo de costilla',   plato_principal: 'Ajiaco santafereño',           bebida: 'Jugo de mora',       postre: 'Gelatina de uva' },
      ];
      await Menu.create({ fecha: d.toISOString().split('T')[0], ...menus[diasCreados % 5], creado_por: admin.id_usuario });
      diasCreados++;
    }

    console.log('✅ Datos insertados correctamente');
    console.log('   Admin:         admin@smartfood.co / admin123');
    console.log('   Coordinador:   coordinador@smartfood.co / coord123');
    console.log('   Estudiantes:   estudiante1@smartfood.co / est123 (hasta estudiante10)');
    process.exit(0);
  } catch (e) {
    console.error('❌ Error en seed:', e.message);
    process.exit(1);
  }
}

seed();
