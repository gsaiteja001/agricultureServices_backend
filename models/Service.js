// models/Service.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const ServiceProvider = require('./ServiceProvider');
const ServiceProvider_Service = require('./ServiceProvider_Service');

const Service = sequelize.define('Service', {
  ServiceID: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  ServiceName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'Service',
  timestamps: false,
});

// Associations
Service.belongsToMany(ServiceProvider, {
  through: {
    model: ServiceProvider_Service,
    timestamps: false, 
  },
  foreignKey: 'ServiceID',
  otherKey: 'ProviderID',
});

module.exports = Service;
