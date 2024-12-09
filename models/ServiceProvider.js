// models/ServiceProvider.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ServiceProviderSchema = new Schema({
  providerID: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  contactInfo: {
    type: String,
    required: true,
  },
  availability: {
    type: String,
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
  certifications: {
    type: String,
    required: true,
  },
  ratings: {
    type: Number,
    required: true,
  },
  farmerId: {
    type: String,
    required: true,
    unique: true,
  },
  // Adding references to related collections
  addresses: [{
    type: Schema.Types.ObjectId,
    ref: 'Address',
  }],
  equipment: [{
    type: Schema.Types.ObjectId,
    ref: 'Equipment',
  }],
}, {
  collection: 'ServiceProvider',
  timestamps: false,
});

module.exports = mongoose.model('ServiceProvider', ServiceProviderSchema);
