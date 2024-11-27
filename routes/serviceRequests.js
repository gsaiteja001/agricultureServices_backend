// routes/serviceRequests.js
const express = require('express');
const router = express.Router();
const serviceRequestController = require('../controllers/serviceRequestController');

// Route: Add new Service Request
// POST /api/service-requests/
router.post('/create-request', serviceRequestController.addServiceRequest);

// Route: Update existing Service Request
// PUT /api/service-requests/:requestId
router.put('/:requestId', serviceRequestController.updateServiceRequest);

// Route: Get Service Requests for a ServiceProvider
// GET /api/service-requests/provider?providerId=123&status=active
router.get('/provider', serviceRequestController.getServiceRequestsForProvider);

// Route: Get Service Requests for a Farmer
// GET /api/service-requests/farmer?farmerId=farmer123&status=active
router.get('/farmer', serviceRequestController.getServiceRequestsForFarmer);

module.exports = router;
