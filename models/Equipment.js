// models/Equipment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServiceProvider = require('./ServiceProvider');

const Equipment = sequelize.define('Equipment', {
  EquipmentID: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  Name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  Capacity: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  OwnedBy: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: ServiceProvider,
      key: 'ProviderID',
    },
  },
}, {
  tableName: 'Equipment',
  timestamps: false,
});

module.exports = Equipment;
