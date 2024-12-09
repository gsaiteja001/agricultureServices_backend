// models/Crop.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const CropSchema = new Schema({
  cropID: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  scientificName: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    default: null,
  },
}, {
  collection: 'Crop',
  timestamps: false,
});

module.exports = mongoose.model('Crop', CropSchema);
