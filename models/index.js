// models/index.js
const ServiceProvider = require('./ServiceProvider');
const Service = require('./Service');
const Address = require('./Address');
const Equipment = require('./Equipment');
const Crop = require('./Crop');
const ServiceRequest = require('./ServiceRequest');
const Farmer = require('./farmer'); // Ensure this model is defined

module.exports = {
  ServiceProvider,
  Service,
  Address,
  Equipment,
  Crop,
  ServiceRequest,
  Farmer,
};
