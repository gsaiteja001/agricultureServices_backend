const mongoose = require('mongoose');
const { Schema } = mongoose;

const ServiceCenterSchema = new Schema({
  serviceCenterId: { type: String, required: true, unique: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number], // Expected format: [longitude, latitude]
      required: true,
    },
  },
  address: {
    street: { type: String, required: true },
    mandal: { type: String, required: true },
    pincode: { type: String, required: true },
    state: { type: String, required: true },
  },
  availableServices: [{ type: String }], // Array of serviceIDs
  agents: {
    employeesA: [{ type: String }],
    employeesB: [{ type: String }],
    employeesC: [{ type: String }],
  },
  serviceRequests: [{ type: String }], // Array of requestIDs
  storageCapacity: { type: Number, required: true },
  currentOccupancy: { type: Number, required: true },
  securityMeasures: { type: String, default: null },
  operationalHours: { type: String, default: null },
  serviceCoverageArea: { type: Number, default: null }, 
}, {
  collection: 'serviceCenter',
  timestamps: true,
});

module.exports = mongoose.model('ServiceCenter', ServiceCenterSchema);
