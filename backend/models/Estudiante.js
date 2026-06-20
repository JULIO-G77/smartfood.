const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Estudiante = sequelize.define('Estudiante', {
  id_estudiante: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_usuario: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  curso: { type: DataTypes.STRING(20), allowNull: false },
  ciudad: { type: DataTypes.STRING(80), defaultValue: 'San Juan de Nepomuceno' },
  alergias: { type: DataTypes.TEXT },
  preferencias: { type: DataTypes.ENUM('ninguna','vegetariano','vegano','sin-gluten'), defaultValue: 'ninguna' }
}, { tableName: 'estudiantes', timestamps: false });

module.exports = Estudiante;
