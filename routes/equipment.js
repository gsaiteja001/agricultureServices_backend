// routes/equipment.js

const express = require('express');
const router = express.Router();
const { Equipment, Service, ServiceProvider, Crop, Address } = require('../models');

/**
 * @route   GET /api/equipments
 * @desc    Fetch all Equipments with their associated ServiceProvider
 * @access  Public or Protected (depending on your application)
 */
router.get('/', async (req, res) => {
  try {
    const equipments = await Equipment.findAll({
      include: {
        model: ServiceProvider,
        attributes: ['ProviderID', 'Name', 'ContactInfo'], // Specify desired attributes
      },
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
    const equipment = await Equipment.findByPk(req.params.id, {
      include: [
        {
          model: ServiceProvider,
          through: { attributes: [] },
          attributes: ['ProviderID', 'Name', 'ContactInfo'], 
          include: [
            {
              model: Service,
              through: { attributes: [] },
              attributes: ['ServiceID', 'ServiceName', 'Description'],
            },
            {
              model: Address,
              attributes: ['Street', 'City', 'State', 'ZipCode'], 
            },
          ],
        },
        {
          model: Crop,
          through: { attributes: [] },
          attributes: ['CropID', 'Name'], // Corrected attribute names
        },
      ],
    });

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
