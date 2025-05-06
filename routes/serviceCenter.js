const express = require('express');
const router = express.Router();
const ServiceCenter = require('../models/ServiceCenter');
const ServiceRequest = require('../models/ServiceRequest');


// Create a new service center
router.post('/', async (req, res) => {
  try {
    const serviceCenterData = req.body;
    const newServiceCenter = new ServiceCenter(serviceCenterData);
    const savedServiceCenter = await newServiceCenter.save();
    res.status(201).json(savedServiceCenter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an existing service center by serviceCenterId
router.put('/:id', async (req, res) => {
  try {
    const updatedServiceCenter = await ServiceCenter.findOneAndUpdate(
      { serviceCenterId: req.params.id },
      req.body,
      { new: true }
    );
    if (!updatedServiceCenter) {
      return res.status(404).json({ message: 'Service center not found' });
    }
    res.status(200).json(updatedServiceCenter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a service center by serviceCenterId
router.delete('/:id', async (req, res) => {
  try {
    const deletedServiceCenter = await ServiceCenter.findOneAndDelete({
      serviceCenterId: req.params.id,
    });
    if (!deletedServiceCenter) {
      return res.status(404).json({ message: 'Service center not found' });
    }
    res.status(200).json({ message: 'Service center deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Fetch all service centers
router.get('/all-service-centers', async (req, res) => {
    try {
      const serviceCenters = await ServiceCenter.find();
      res.status(200).json(serviceCenters);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });



  

// 1) Add a service to the 'availableServices' array
// POST /api/service-centers/:centerId/add-service
router.post('/:centerId/add-service', async (req, res) => {
    try {
      const { centerId } = req.params;
      const { serviceID } = req.body;
  
      const updatedCenter = await ServiceCenter.findOneAndUpdate(
        { serviceCenterId: centerId },
        { $addToSet: { availableServices: serviceID } }, // $addToSet avoids duplicates
        { new: true }
      );
  
      if (!updatedCenter) {
        return res.status(404).json({ error: 'Service Center not found' });
      }
      res.json(updatedCenter);
    } catch (error) {
      console.error('Error adding service:', error);
      res.status(500).json({ error: 'Failed to add service' });
    }
  });
  
  
  
  // 2) Remove a service from 'availableServices'
  //
  // DELETE /api/service-centers/:centerId/remove-service/:serviceID
  router.delete('/:centerId/remove-service/:serviceID', async (req, res) => {
    try {
      const { centerId, serviceID } = req.params;
  
      const updatedCenter = await ServiceCenter.findOneAndUpdate(
        { serviceCenterId: centerId },
        { $pull: { availableServices: serviceID } },
        { new: true }
      );
  
      if (!updatedCenter) {
        return res.status(404).json({ error: 'Service Center not found' });
      }
      res.json(updatedCenter);
    } catch (error) {
      console.error('Error removing service:', error);
      res.status(500).json({ error: 'Failed to remove service' });
    }
  });
  
  
  
  // 3) Update a Service Request (this can also go in serviceRequests.js).
  //    If you want to do partial updates or other modifications, you can
  //    do so in your controller. Here, a simple example:
  router.put('/service-requests/:requestId', async (req, res) => {
    try {
      const { requestId } = req.params;
      const updateData = req.body;
  
      const updatedRequest = await ServiceRequest.findOneAndUpdate(
        { requestID: requestId },
        updateData,
        { new: true }
      );
  
      if (!updatedRequest) {
        return res.status(404).json({ error: 'Service request not found' });
      }
      res.json(updatedRequest);
    } catch (error) {
      console.error('Error updating service request:', error);
      res.status(500).json({ error: 'Failed to update service request' });
    }
  });
  
  
  
  

module.exports = router;
