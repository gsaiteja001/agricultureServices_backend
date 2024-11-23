// models/Address.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Address = sequelize.define('Address', {
  AddressID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  Street: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  City: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  State: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ZipCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'Address',
  timestamps: false,
});

module.exports = Address;
