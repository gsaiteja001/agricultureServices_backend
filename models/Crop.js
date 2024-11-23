// models/Crop.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Crop = sequelize.define('Crop', {
  CropID: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  Name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  scientificName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'Crop',
  timestamps: false,
});

module.exports = Crop;
