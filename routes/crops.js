// routes/crops.js

const express = require('express');
const router = express.Router();
const { Crop, Equipment, ServiceProvider } = require('../models');

/**
 * @route   GET /api/crops
 * @desc    Get all crops with equipment that can be used on them
 * @access  Public or Protected (depending on your application)
 */
router.get('/', async (req, res) => {
  try {
    const crops = await Crop.find()
      .populate({
        path: 'equipments',
        select: 'equipmentID name type description capacity',
      });
    res.json(crops);
  } catch (error) {
    console.error('Error fetching crops:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/crops/:id
 * @desc    Get a specific crop with its associated equipment and their service providers
 * @access  Public or Protected (depending on your application)
 */
router.get('/:id', async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id)
      .populate({
        path: 'equipments',
        select: 'equipmentID name type description capacity',
        populate: {
          path: 'serviceProvider',
          select: 'providerID name contactInfo',
        },
      });

    if (crop) {
      res.json(crop);
    } else {
      res.status(404).json({ error: 'Crop not found' });
    }
  } catch (error) {
    console.error('Error fetching crop:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
