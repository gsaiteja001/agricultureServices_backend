// models/ServiceProvider.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServiceProvider = sequelize.define('ServiceProvider', {
  ProviderID: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  Name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ContactInfo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Availability: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Experience: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Certifications: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Ratings: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
}, {
  tableName: 'ServiceProvider',
  timestamps: false,
});

module.exports = ServiceProvider;
