// models/Service.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

const ServiceSchema = new Schema({
  serviceID: { type: String, required: false, unique: true },
  serviceName: { type: String, required: false },
  category: { type: String, required: false },
  description: { type: String, default: null },
  serviceProviders: [{ type: Schema.Types.ObjectId, ref: 'ServiceProvider', required: false }], // Many-to-Many
}, {
  collection: 'Service',
  timestamps: false,
});

module.exports = mongoose.model('Service', ServiceSchema);
