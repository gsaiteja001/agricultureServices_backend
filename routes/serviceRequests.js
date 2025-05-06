// routes/serviceRequests.js

const express = require('express');
const router = express.Router();
const serviceRequestController = require('../controllers/serviceRequestController');

// POST /api/service-requests/
router.post('/create-request', serviceRequestController.addServiceRequest);

// PUT /api/service-requests/:requestId
router.put('/:requestId', serviceRequestController.updateServiceRequest);

// GET /api/service-requests/provider?providerId=123&status=active
router.get('/provider', serviceRequestController.getServiceRequestsForProvider);

// GET /api/service-requests/farmer?farmerId=farmer123&status=active
router.get('/farmer', serviceRequestController.getServiceRequestsForFarmer);


// GET /api/service-requests/all
router.get('/all', serviceRequestController.getAllServiceRequests);


router.get('/:requestId', serviceRequestController.getServiceRequestById);

module.exports = router;
