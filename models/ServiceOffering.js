// models/ServiceOffering.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const ServiceProvider = require('./ServiceProvider');
const Service = require('./Service');

const Crop = require('./Crop');

const Equipment = require('./Equipment');

const ServiceOffering = sequelize.define('ServiceOffering', {
  ServiceOfferingID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ProviderID: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: ServiceProvider,
      key: 'ProviderID',
    },
  },
  ServiceID: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Service,
      key: 'ServiceID',
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
  CropID: {
    type: DataTypes.STRING,
    primaryKey: true,
    references: {
      model: Crop,
      key: 'CropID',
    },
  },
  Rate: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Availability: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ServiceArea: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  AdditionalDetails: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'ServiceOffering',
  timestamps: false,
});

// Associations
ServiceOffering.belongsTo(ServiceProvider, { foreignKey: 'ProviderID' });
ServiceOffering.belongsTo(Service, { foreignKey: 'ServiceID' });

module.exports = ServiceOffering;
