const Usuario = require('./Usuario');
const Estudiante = require('./Estudiante');
const Menu = require('./Menu');
const Confirmacion = require('./Confirmacion');
const Notificacion = require('./Notificacion');

Usuario.hasOne(Estudiante, { foreignKey: 'id_usuario', as: 'perfil' });
Estudiante.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

Usuario.hasMany(Notificacion, { foreignKey: 'id_usuario', as: 'notificaciones' });
Notificacion.belongsTo(Usuario, { foreignKey: 'id_usuario' });

Estudiante.hasMany(Confirmacion, { foreignKey: 'id_estudiante', as: 'confirmaciones' });
Confirmacion.belongsTo(Estudiante, { foreignKey: 'id_estudiante' });

Menu.hasMany(Confirmacion, { foreignKey: 'id_menu', as: 'confirmaciones' });
Confirmacion.belongsTo(Menu, { foreignKey: 'id_menu' });

module.exports = { Usuario, Estudiante, Menu, Confirmacion, Notificacion };
