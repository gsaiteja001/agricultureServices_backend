// models/ServiceRequest.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const ServiceProvider = require('./ServiceProvider');
const Service = require('./Service');

const ServiceRequest = sequelize.define('ServiceRequest', {
  RequestID: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  FarmerID: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  FarmerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  FarmerContactInfo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  FarmerAddress: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ScheduledDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },

  ServiceProviderID: {
    type: DataTypes.STRING,
    references: {
      model: ServiceProvider,
      key: 'ProviderID',
    },
  },
  ServiceID: {
    type: DataTypes.STRING,
    references: {
      model: Service,
      key: 'ServiceID',
    },
  },
  Status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending',
  },
  Notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'ServiceRequest',
  timestamps: true,
});

// Associations
ServiceRequest.belongsTo(ServiceProvider, { foreignKey: 'ServiceProviderID' });
ServiceRequest.belongsTo(Service, { foreignKey: 'ServiceID' });

module.exports = ServiceRequest;
