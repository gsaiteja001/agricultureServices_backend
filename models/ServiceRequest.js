// models/ServiceRequest.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ServiceRequestSchema = new Schema({
  requestID: {
    type: String,
    required: true,
    unique: true,
  },
  farmerID: {
    type: String,
    required: true,
  },
  farmerName: {
    type: String,
    required: true,
  },
  farmerContactInfo: {
    type: String,
    required: true,
  },
  farmerAddress: {
    type: String,
    required: true,
  },
  scheduledDate: {
    type: Date,
    required: true,
  },
  serviceProvider: {
    type: Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true,
  },
  service: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: 'pending',
  },
  notes: {
    type: String,
    default: null,
  },
}, {
  collection: 'ServiceRequest',
  timestamps: true,
});

module.exports = mongoose.model('ServiceRequest', ServiceRequestSchema);
