const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id_usuario: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(120), allowNull: false },
  correo: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  rol: { type: DataTypes.ENUM('admin','estudiante'), defaultValue: 'estudiante' },
  activo: { type: DataTypes.TINYINT, defaultValue: 1 }
}, { tableName: 'usuarios', timestamps: true, createdAt: 'fecha_registro', updatedAt: false });

module.exports = Usuario;
