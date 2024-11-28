// routes/serviceProviders.js

const express = require('express');
const router = express.Router();
const { ServiceProvider, Service, Equipment, Address } = require('../models');
const serviceProviderController = require('../controllers/serviceProviderController');
/**
 * @route   GET /api/serviceProviders
 * @desc    Fetch all ServiceProviders with their associated Services, Equipment, and Address
 * @access  Public or Protected (depending on your application)
 */
router.get('/', async (req, res) => {
  try {
    const serviceProviders = await ServiceProvider.findAll({
      include: [
        {
          model: Service,
          through: { attributes: [] }, // Exclude join table attributes
          attributes: ['ServiceID', 'ServiceName', 'Description'], // Specify desired attributes
        },
        {
          model: Equipment,
          through: { attributes: [] }, // Exclude join table attributes
          attributes: ['EquipmentID', 'Name', 'Type', 'Description'], // Adjusted attribute names
        },
        {
          model: Address,
          attributes: ['Street', 'City', 'State', 'ZipCode'], // Ensure correct casing
        },
      ],
      order: [['Name', 'ASC']], // Adjusted to match model's 'Name' attribute
    });

    res.json(serviceProviders);
  } catch (error) {
    console.error('Error fetching ServiceProviders:', error);
    res.status(500).json({ error: 'An error occurred while fetching service providers.' });
  }
});

/**
 * @route   GET /api/serviceProviders/:id
 * @desc    Fetch a single ServiceProvider by ID with associated Services, Equipment, and Address
 * @access  Public or Protected (depending on your application)
 */
router.get('/:id', async (req, res) => {
  try {
    const serviceProvider = await ServiceProvider.findByPk(req.params.id, {
      include: [
        {
          model: Service,
          through: { attributes: [] },
          attributes: ['ServiceID', 'ServiceName', 'Description'],
        },
        {
          model: Equipment,
          through: { attributes: [] },
          attributes: ['EquipmentID', 'Name', 'Type', 'Description'],
        },
        {
          model: Address,
          attributes: ['Street', 'City', 'State', 'ZipCode'],
        },
      ],
    });

    if (serviceProvider) {
      res.json(serviceProvider);
    } else {
      res.status(404).json({ error: 'ServiceProvider not found' });
    }
  } catch (error) {
    console.error('Error fetching ServiceProvider:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create a new ServiceProvider
router.post('/create', serviceProviderController.createServiceProvider);

// PUT update ServiceProvider's Equipments
router.put('/:ProviderID/equipments', serviceProviderController.updateServiceProviderEquipments);

// PUT add or remove Services for a ServiceProvider
router.put('/:ProviderID/services', serviceProviderController.updateServiceProviderServices);


module.exports = router;
