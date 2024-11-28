// const Service = require('./Service');
// const ServiceProvider = require('./ServiceProvider');
// const Equipment = require('./Equipment');
// const Crop = require('./Crop');

// const ServiceProvider_Service = require('./ServiceProvider_Service');
// const ServiceOffering = require('./ServiceOffering');
// const ServiceProvider_Equipment = require('./ServiceProvider_Equipment');
// const Equipment_Crop = require('./Equipment_Crop');

// const Address = require('./Address');


// module.exports = {
//   Service,
//   ServiceProvider,
//   Equipment,
//   Crop,
//   ServiceProvider_Service,
//   ServiceOffering,
//   ServiceProvider_Equipment,
//   Equipment_Crop,
//   Address,
// };

// models/index.js

const sequelize = require('../config/database');
const { Sequelize } = require('sequelize');

// Import Models
const ServiceProvider = require('./ServiceProvider');
const Service = require('./Service');
const ServiceProvider_Service = require('./ServiceProvider_Service');
const Address = require('./Address');
const Equipment = require('./Equipment');

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
  sequelize,
  Sequelize,
};
