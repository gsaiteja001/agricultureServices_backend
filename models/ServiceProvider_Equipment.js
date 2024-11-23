// models/ServiceProvider_Equipment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const ServiceProvider = require('./ServiceProvider');
const Equipment = require('./Equipment');

const ServiceProvider_Equipment = sequelize.define('ServiceProvider_Equipment', {
  ProviderID: {
    type: DataTypes.STRING,
    primaryKey: true,
    references: {
      model: ServiceProvider,
      key: 'ProviderID',
    },
  },
  EquipmentID: {
    type: DataTypes.STRING,
    primaryKey: true,
    references: {
      model: Equipment,
      key: 'EquipmentID',
    },
  },
}, {
  tableName: 'ServiceProvider_Equipment',
  timestamps: false,
});

// Associations
ServiceProvider.belongsToMany(Equipment, {
  through: ServiceProvider_Equipment,
  foreignKey: 'ProviderID',
  otherKey: 'EquipmentID',
});

Equipment.belongsToMany(ServiceProvider, {
  through: ServiceProvider_Equipment,
  foreignKey: 'EquipmentID',
  otherKey: 'ProviderID',
});

module.exports = ServiceProvider_Equipment;
