// models/ServiceProvider.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

const ServiceProviderSchema = new Schema({
  providerID: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  contactInfo: { type: String, required: true },
  availability: { type: String, required: true },
  experience: { type: String, required: true },
  certifications: { type: String, required: true },
  ratings: { type: Number, required: true, min: 0, max: 5 },
  farmerId: { type: String, required: true, unique: true },
  services: [{ type: String, ref: 'Service' }], // Many-to-Many
  equipments: [{ type: Schema.Types.ObjectId, ref: 'Equipment' }], // One-to-Many
  addresses: [{ type: Schema.Types.ObjectId, ref: 'Address' }], // One-to-Many
}, {
  collection: 'ServiceProvider',
  timestamps: false,
});

module.exports = mongoose.model('ServiceProvider', ServiceProviderSchema);
