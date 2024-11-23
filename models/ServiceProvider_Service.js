// models/ServiceProvider_Service.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const ServiceProvider = require('./ServiceProvider');
const Service = require('./Service');

const ServiceProvider_Service = sequelize.define('ServiceProvider_Service', {
  ProviderID: {
    type: DataTypes.STRING,
    primaryKey: true,
    references: {
      model: ServiceProvider,
      key: 'ProviderID',
    },
  },
  ServiceID: {
    type: DataTypes.STRING,
    primaryKey: true,
    references: {
      model: Service,
      key: 'ServiceID',
    },
  },
  // Additional fields can be added here if needed
}, {
  tableName: 'ServiceProvider_Service',
  timestamps: false,
});

// Associations
ServiceProvider.belongsToMany(Service, {
  through: ServiceProvider_Service,
  foreignKey: 'ProviderID',
  otherKey: 'ServiceID',
});

Service.belongsToMany(ServiceProvider, {
  through: ServiceProvider_Service,
  foreignKey: 'ServiceID',
  otherKey: 'ProviderID',
});

module.exports = ServiceProvider_Service;
