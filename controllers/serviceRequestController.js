// controllers/serviceRequestController.js

const mongoose = require('mongoose');

const Farmer = require('../models/farmer'); 
const ServiceProvider = require('../models/ServiceProvider');
const Equipment = require('../models/Equipment');
const Address = require('../models/Address');
const Service = require('../models/Service');
const ServiceRequest = require('../models/ServiceRequest');
const { v4: uuidv4 } = require('uuid');

/**
 * Get All Service Requests
 */
exports.getAllServiceRequests = async (req, res) => {
  try {
    const serviceRequests = await ServiceRequest.find()
      .populate({
        path: 'serviceProvider',
        select: 'providerID name contactInfo',
      })
      .populate({
        path: 'service',
        select: 'serviceID serviceName category',
      })
      .sort({ scheduledDate: -1 }); // Sort by ScheduledDate descending

    res.status(200).json({ serviceRequests });
  } catch (error) {
    console.error('Error fetching all Service Requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Add a new Service Request
 */
exports.addServiceRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      farmerId,
      farmerName,
      farmerContactInfo,
      farmerAddress,
      scheduledDate,
      serviceProviderID,
      serviceId,
      notes,
    } = req.body;

    // Validate ServiceProvider by providerID
    const serviceProvider = await ServiceProvider.findOne({ providerID: serviceProviderID }).session(session);
    if (!serviceProvider) {
      throw new Error('Service Provider not found.');
    }

    // Validate Service by serviceID
    const service = await Service.findOne({ serviceID: serviceId }).session(session);
    if (!service) {
      throw new Error('Service not found.');
    }

    // Create a new unique RequestID
    const requestID = uuidv4();

    // Create and save new ServiceRequest
    const newServiceRequest = new ServiceRequest({
      requestID,
      farmerID: farmerId,
      farmerName,
      farmerContactInfo,
      farmerAddress,
      scheduledDate,
      serviceProviderID: serviceProvider.providerID, 
      serviceID: service.serviceID,
      status: 'Pending',
      notes,
    });

    await newServiceRequest.save({ session });

    // Update Farmer's document
    const farmer = await Farmer.findOne({ farmerId }).session(session);
    if (!farmer) {
      throw new Error('Farmer not found in MongoDB.');
    }

    // Add this request to the farmer's currentServiceRequests
    farmer.currentServiceRequests.push({
      requestID: newServiceRequest.requestID,
      serviceID: newServiceRequest.service,          // storing ObjectId reference to the Service
      serviceProviderID: newServiceRequest.serviceProvider, // storing ObjectId reference to the ServiceProvider
      status: newServiceRequest.status,
      scheduledDate: newServiceRequest.scheduledDate,
    });

    await farmer.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Return success response
    res.status(201).json({
      message: 'Service Request created successfully.',
      serviceRequest: newServiceRequest,
    });
  } catch (error) {
    // Rollback on error
    await session.abortTransaction();
    session.endSession();
    console.error('Error adding Service Request:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Update an existing Service Request
 */
exports.updateServiceRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { requestId } = req.params;
    const updateData = req.body;

    // Find the ServiceRequest
    const serviceRequest = await ServiceRequest.findOne({ requestID: requestId }).session(session);
    if (!serviceRequest) {
      throw new Error('Service Request not found.');
    }

    // Update ServiceRequest
    Object.keys(updateData).forEach(key => {
      serviceRequest[key] = updateData[key];
    });

    await serviceRequest.save({ session });

    // If Status is updated, reflect changes in Farmer's document
    if (updateData.status) {
      const farmer = await Farmer.findOne({ farmerId: serviceRequest.farmerID }).session(session);
      if (!farmer) {
        throw new Error('Farmer not found in MongoDB.');
      }

      // Find the service request in currentServiceRequests
      const serviceRequestIndex = farmer.currentServiceRequests.findIndex(
        req => req.requestID === requestId
      );

      if (serviceRequestIndex === -1) {
        throw new Error('Service Request not found in farmer\'s currentServiceRequests.');
      }

      // Remove from currentServiceRequests
      const [completedServiceRequest] = farmer.currentServiceRequests.splice(serviceRequestIndex, 1);

      // Update the status
      completedServiceRequest.status = updateData.status;
      completedServiceRequest.scheduledDate = serviceRequest.scheduledDate;
      // Update other fields if necessary

      // Add to completedServiceRequests or returnedServiceRequests based on status
      if (updateData.status.toLowerCase() === 'completed') {
        farmer.completedServiceRequests.push(completedServiceRequest);
      } else if (updateData.status.toLowerCase() === 'canceled') {
        // Assuming you have a 'returnedServiceRequests' array
        farmer.returnedServiceRequests = farmer.returnedServiceRequests || [];
        farmer.returnedServiceRequests.push(completedServiceRequest);
      }

      await farmer.save({ session });
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: 'Service Request updated successfully.',
      serviceRequest,
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await session.abortTransaction();
    session.endSession();
    console.error('Error updating Service Request:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get Service Requests for a ServiceProvider based on providerId and status
 */
exports.getServiceRequestsForProvider = async (req, res) => {
  try {
    const { providerId, status } = req.query; // e.g., /api/service-requests/provider?providerId=123&status=active

    // Validate ServiceProvider
    const serviceProvider = await ServiceProvider.findOne({ providerID: providerId });
    if (!serviceProvider) {
      return res.status(404).json({ error: 'Service Provider not found.' });
    }

    // Define status filter
    let statusFilter = {};
    if (status === 'active') {
      statusFilter = { status: { $in: ['pending', 'accepted'] } };
    } else if (status === 'completed') {
      statusFilter = { status: { $in: ['completed', 'canceled'] } };
    }

    // Fetch ServiceRequests
    const serviceRequests = await ServiceRequest.find({
      serviceProvider: serviceProvider._id,
      ...statusFilter,
    })
      .populate({
        path: 'service',
        select: 'serviceName category',
      })
      .sort({ scheduledDate: -1 });

    res.status(200).json({ serviceRequests });
  } catch (error) {
    console.error('Error fetching Service Requests for Provider:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get Service Requests for a Farmer based on farmerId and status
 */
exports.getServiceRequestsForFarmer = async (req, res) => {
  try {
    const { farmerId, status } = req.query; // e.g., /api/service-requests/farmer?farmerId=farmer123&status=active

    console.log(`Received request for farmerId: ${farmerId} with status: ${status}`);

    // Validate query parameters
    if (!farmerId || !status) {
      console.log('Missing farmerId or status in query parameters.');
      return res.status(400).json({ error: 'Both farmerId and status query parameters are required.' });
    }

    // Validate status value
    const validStatuses = ['active', 'completed'];
    if (!validStatuses.includes(status)) {
      console.log(`Invalid status parameter: ${status}`);
      return res.status(400).json({ error: `Invalid status parameter. Must be one of: ${validStatuses.join(', ')}.` });
    }

    // Fetch Farmer from MongoDB to verify existence
    const farmer = await Farmer.findOne({ farmerId });
    if (!farmer) {
      console.log(`Farmer not found for farmerId: ${farmerId}`);
      return res.status(404).json({ error: 'Farmer not found.' });
    }

    // Define status filter
    let statusFilter = {};
    if (status === 'active') {
      statusFilter = { status: { $in: ['Pending', 'InProgress', 'Assigned'] } };
    } else if (status === 'completed') {
      statusFilter = { status: { $in: ['Completed', 'Canceled'] } };
    }

    console.log(`Status filter applied: ${JSON.stringify(statusFilter)}`);

    // Fetch ServiceRequests based on farmerId and status
    const serviceRequests = await ServiceRequest.find({
      farmerId: farmerId,
      ...statusFilter,
    }).sort({ scheduledDate: -1 });

    console.log(`Found ${serviceRequests.length} service requests for farmerId: ${farmerId} with status: ${status}`);

    // If no service requests found, return an empty array
    if (!serviceRequests.length) {
      console.log('No service requests found matching the criteria.');
      return res.status(200).json({ serviceRequests: [] });
    }

    // Manually populate serviceProvider and service details using findOne
    const populatedServiceRequests = await Promise.all(
      serviceRequests.map(async (request) => {
        // Fetch Service Provider using serviceProviderID
        const serviceProvider = await ServiceProvider.findOne({ serviceProviderId: request.serviceProviderID }).select('name contactInfo');
        
        // Fetch Service using serviceID
        const service = await Service.findOne({ serviceId: request.serviceID }).select('serviceName category');

        console.log(`Populated ServiceProvider: ${serviceProvider ? serviceProvider.serviceProviderId : 'Not Found'}, Service: ${service ? service.serviceId : 'Not Found'}`);

        // Handle cases where serviceProvider or service might not be found
        return {
          ...request.toObject(),
          serviceProvider: serviceProvider || null, 
          service: service || null, // Assign null if not found
        };
      })
    );

    res.status(200).json({ serviceRequests: populatedServiceRequests });
  } catch (error) {
    console.error('Error fetching Service Requests for Farmer:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
