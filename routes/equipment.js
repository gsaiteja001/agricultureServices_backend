// routes/equipment.js

const express = require('express');
const router = express.Router();
const { Equipment, ServiceProvider, Crop, Address } = require('../models'); // Assuming models are in Mongoose format

/**
 * @route   GET /api/equipments
 * @desc    Fetch all Equipments with their associated ServiceProvider
 * @access  Public or Protected (depending on your application)
 */
router.get('/', async (req, res) => {
  try {
    const equipments = await Equipment.find().populate({
      path: 'serviceProvider',
      select: 'ProviderID Name ContactInfo',
    });
    res.json(equipments);
  } catch (error) {
    console.error('Error fetching Equipment:', error);
    res.status(500).json({ error: 'An error occurred while fetching equipment.' });
  }
});

/**
 * @route   GET /api/equipment/:id
 * @desc    Fetch a specific Equipment by ID with associated Services, ServiceProviders, and Crops
 * @access  Public or Protected (depending on your application)
 */
router.get('/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id).populate([
      {
        path: 'serviceProvider',
        select: 'ProviderID Name ContactInfo',
        populate: [
          {
            path: 'services',
            select: 'ServiceID ServiceName Description',
          },
          {
            path: 'address',
            select: 'Street City State ZipCode',
          },
        ],
      },
      {
        path: 'crops',
        select: 'CropID Name',
      },
    ]);

    if (equipment) {
      res.json(equipment);
    } else {
      res.status(404).json({ error: 'Equipment not found' });
    }
  } catch (error) {
    console.error('Error fetching Equipment:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
