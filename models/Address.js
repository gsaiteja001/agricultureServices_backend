// models/Address.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const AddressSchema = new Schema({
  provider: {
    type: Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true,
  },
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    default: null,
  },
    coordinates: {
        type: String,
      default: null,
    },
}, {
  collection: 'Address',
  timestamps: false,
});

module.exports = mongoose.model('Address', AddressSchema);
