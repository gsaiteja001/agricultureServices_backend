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
}, {
  tableName: 'ServiceProvider_Service',
  timestamps: false, // Disable timestamps
});

// // Ensure associations are defined in both models
// ServiceProvider.belongsToMany(Service, {
//   through: {
//     model: ServiceProvider_Service,
//     timestamps: false,
//   },
//   foreignKey: 'ProviderID',
//   otherKey: 'ServiceID',
// });


// Service.belongsToMany(ServiceProvider, {
//   through: {
//     model: ServiceProvider_Service,
//     timestamps: false,
//   },
//   foreignKey: 'ServiceID',
//   otherKey: 'ProviderID',
// });

module.exports = ServiceProvider_Service;
