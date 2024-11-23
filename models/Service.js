
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Service = sequelize.define('Service', {
  ServiceID: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  ServiceName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'Service',
  timestamps: false,
});

module.exports = Service;
