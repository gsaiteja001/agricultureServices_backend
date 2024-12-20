// models/Equipment.js

const mongoose = require('mongoose');
const { Schema } = mongoose;
const { v4: uuidv4 } = require('uuid');

const EquipmentSchema = new Schema({
  equipmentID: { type: String, default: uuidv4, unique: true, required: true },
  name: { type: String, required: true },
  type: { type: String, default: null },
  description: { type: String, default: null },
  capacity: { type: String, default: null },
  serviceProvider: { type: Schema.Types.ObjectId, ref: 'ServiceProvider', required: true }, // One-to-Many
  crops: [{ type: Schema.Types.ObjectId, ref: 'Crop' }], // Many-to-Many
}, {
  collection: 'Equipment',
  timestamps: false,
});

module.exports = mongoose.model('Equipment', EquipmentSchema);
