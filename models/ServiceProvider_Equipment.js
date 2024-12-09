// models/ServiceProviderEquipment.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ServiceProviderEquipmentSchema = new Schema({
  serviceProvider: {
    type: Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true,
  },
  equipment: {
    type: Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true,
  },
}, {
  collection: 'ServiceProviderEquipment',
  timestamps: false,
});

// To ensure unique pairs, you can add a compound index
ServiceProviderEquipmentSchema.index({ serviceProvider: 1, equipment: 1 }, { unique: true });

module.exports = mongoose.model('ServiceProviderEquipment', ServiceProviderEquipmentSchema);
