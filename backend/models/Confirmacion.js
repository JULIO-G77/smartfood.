const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Confirmacion = sequelize.define('Confirmacion', {
  id_confirmacion: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_estudiante: { type: DataTypes.INTEGER, allowNull: false },
  id_menu: { type: DataTypes.INTEGER, allowNull: false },
  estado: { type: DataTypes.ENUM('confirmado','cancelado'), defaultValue: 'confirmado' }
}, { tableName: 'confirmaciones', timestamps: true, createdAt: 'fecha_confirmacion', updatedAt: false });

module.exports = Confirmacion;
