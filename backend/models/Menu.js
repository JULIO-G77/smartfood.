const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Menu = sequelize.define('Menu', {
  id_menu: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  fecha: { type: DataTypes.DATEONLY, allowNull: false, unique: true },
  entrada: { type: DataTypes.STRING(150), allowNull: false },
  plato_principal: { type: DataTypes.STRING(150), allowNull: false },
  bebida: { type: DataTypes.STRING(100), allowNull: false },
  postre: { type: DataTypes.STRING(100), allowNull: false },
  activo: { type: DataTypes.TINYINT, defaultValue: 1 },
  creado_por: { type: DataTypes.INTEGER }
}, { tableName: 'menus', timestamps: true, createdAt: 'fecha_creacion', updatedAt: false });

module.exports = Menu;
