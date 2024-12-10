// routes/serviceProviders.js

const express = require('express');
const router = express.Router();
const { ServiceProvider, Service, Equipment, Address, farmer } = require('../models'); // Mongoose Models
const serviceProviderController = require('../controllers/serviceProviderController');

/**
 * @route   GET /api/serviceProviders
 * @desc    Fetch all ServiceProviders with their associated Services, Equipment, and Address
 * @access  Public or Protected (depending on your application)
 */
router.get('/', async (req, res) => {
  try {
    const serviceProviders = await ServiceProvider.find().populate([
      {
        path: 'services',
        select: 'ServiceID ServiceName Description',
      },
      {
        path: 'equipments',
        select: 'EquipmentID Name Type Description',
      },
      {
        path: 'address',
        select: 'Street City State ZipCode',
      },
    ]);
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
    const serviceProvider = await ServiceProvider.findById(req.params.id).populate([
      {
        path: 'services',
        select: 'ServiceID ServiceName Description',
      },
      {
        path: 'equipments',
        select: 'EquipmentID Name Type Description Capacity',
      },
      {
        path: 'address',
        select: 'Street City State ZipCode',
      },
    ]);

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

// PUT update ServiceProvider along with Equipments and Services
router.put('/update/:ProviderID', serviceProviderController.updateServiceProvider);

module.exports = router;
