// models/index.js


const sequelize = require('../config/database');
const { Sequelize } = require('sequelize');

// Import Models
const ServiceProvider = require('./ServiceProvider');
const Service = require('./Service');
const ServiceProvider_Service = require('./ServiceProvider_Service');
const Address = require('./Address');
const Equipment = require('./Equipment');
const Farmer = require('./farmer'); 

// Define Associations

// ServiceProvider <-> Service (Many-to-Many)
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

// ServiceProvider -> Equipment (One-to-Many)
ServiceProvider.hasMany(Equipment, { foreignKey: 'OwnedBy' });
Equipment.belongsTo(ServiceProvider, { foreignKey: 'OwnedBy' });

// ServiceProvider -> Address (One-to-Many)
ServiceProvider.hasMany(Address, { foreignKey: 'ProviderID' });
Address.belongsTo(ServiceProvider, { foreignKey: 'ProviderID' });



// Export Models
module.exports = {
  ServiceProvider,
  Service,
  ServiceProvider_Service,
  Address,
  Equipment,
  Farmer,
  sequelize,
  Sequelize,
};
