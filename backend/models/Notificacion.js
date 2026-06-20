const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notificacion = sequelize.define('Notificacion', {
  id_notificacion: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_usuario: { type: DataTypes.INTEGER, allowNull: false },
  titulo: { type: DataTypes.STRING(120), allowNull: false },
  mensaje: { type: DataTypes.TEXT, allowNull: false },
  tipo: { type: DataTypes.ENUM('menu','confirmacion','recordatorio','cancelacion','sistema'), defaultValue: 'sistema' },
  leida: { type: DataTypes.TINYINT, defaultValue: 0 }
}, { tableName: 'notificaciones', timestamps: true, createdAt: 'fecha', updatedAt: false });

module.exports = Notificacion;
