// models/ServiceProvider_Service.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServiceProvider_Service = sequelize.define('ServiceProvider_Service', {
  ProviderID: {
    type: DataTypes.STRING,
    primaryKey: true,
    references: {
      model: 'ServiceProvider', // Note: Using table name as string
      key: 'ProviderID',
    },
    allowNull: false,
  },
  ServiceID: {
    type: DataTypes.STRING,
    primaryKey: true,
    references: {
      model: 'Service', // Note: Using table name as string
      key: 'ServiceID',
    },
    allowNull: false,
  },
}, {
  tableName: 'ServiceProvider_Service',
  timestamps: false, // Disable timestamps
});

module.exports = ServiceProvider_Service;
