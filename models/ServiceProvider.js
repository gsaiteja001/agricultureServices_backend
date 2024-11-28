// models/ServiceProvider.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Address = require('./Address');
const Equipment = require('./Equipment');
const Service = require('./Service');

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

// Associations
ServiceProvider.hasMany(Address, { foreignKey: 'ProviderID' });
ServiceProvider.hasMany(Equipment, { foreignKey: 'OwnedBy' });

// Modify belongsToMany to include timestamps: false
ServiceProvider.belongsToMany(Service, {
  through: {
    model: ServiceProvider_Service,
    timestamps: false,
  },
  foreignKey: 'ProviderID',
  otherKey: 'ServiceID',
});
module.exports = ServiceProvider;
