// models/Equipment_Crop.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Equipment = require('./Equipment');
const Crop = require('./Crop');

const Equipment_Crop = sequelize.define('Equipment_Crop', {
  EquipmentID: {
    type: DataTypes.STRING,
    primaryKey: true,
    references: {
      model: Equipment,
      key: 'EquipmentID',
    },
  },
  CropID: {
    type: DataTypes.STRING,
    primaryKey: true,
    references: {
      model: Crop,
      key: 'CropID',
    },
  },
}, {
  tableName: 'Equipment_Crop',
  timestamps: false,
});

// Associations
Equipment.belongsToMany(Crop, {
  through: Equipment_Crop,
  foreignKey: 'EquipmentID',
  otherKey: 'CropID',
});

Crop.belongsToMany(Equipment, {
  through: Equipment_Crop,
  foreignKey: 'CropID',
  otherKey: 'EquipmentID',
});

module.exports = Equipment_Crop;
