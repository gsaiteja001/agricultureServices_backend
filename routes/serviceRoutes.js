// routes/serviceRoutes.js
const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

// Get all services
router.get('/services', async (req, res) => {
  try {
    const services = await Service.findAll();
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single service by ID
router.get('/services/:id', async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (service) {
      res.json(service);
    } else {
      res.status(404).json({ error: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new service
router.post('/services', async (req, res) => {
  try {
    const newService = await Service.create(req.body);
    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a service
router.put('/services/:id', async (req, res) => {
  try {
    const [updated] = await Service.update(req.body, {
      where: { ServiceID: req.params.id },
    });
    if (updated) {
      const updatedService = await Service.findByPk(req.params.id);
      res.json(updatedService);
    } else {
      res.status(404).json({ error: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a service
router.delete('/services/:id', async (req, res) => {
  try {
    const deleted = await Service.destroy({
      where: { ServiceID: req.params.id },
    });
    if (deleted) {
      res.json({ message: 'Service deleted' });
    } else {
      res.status(404).json({ error: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
