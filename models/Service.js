// models/Service.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ServiceSchema = new Schema({
  serviceID: {
    type: String,
    required: true,
    unique: true,
  },
  serviceName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: null,
  },
}, {
  collection: 'Service',
  timestamps: false,
});

module.exports = mongoose.model('Service', ServiceSchema);
