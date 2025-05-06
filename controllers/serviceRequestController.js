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
/**
 * Get All Service Requests
 */
exports.getAllServiceRequests = async (req, res) => {
  try {
    const serviceRequests = await ServiceRequest.aggregate([
      // Sort by scheduledDate descending
      { $sort: { scheduledDate: -1 } },
      
      // Lookup for ServiceProvider
      {
        $lookup: {
          from: 'ServiceProvider', // Name of the ServiceProvider collection
          localField: 'serviceProviderID', // Field in ServiceRequest
          foreignField: 'providerID', // Field in ServiceProvider
          as: 'serviceProvider', // Alias for the joined data
        },
      },
      {
        $unwind: {
          path: '$serviceProvider',
          preserveNullAndEmptyArrays: true, // Optional: keep ServiceRequest even if no ServiceProvider found
        },
      },
      {
        $project: {
          // Include all ServiceRequest fields
          requestID: 1,
          farmerId: 1,
          farmerName: 1,
          farmerContactInfo: 1,
          farmerAddress: 1,
          scheduledDate: 1,
          serviceProviderID: 1,
          serviceID: 1,
          status: 1,
          notes: 1,
          createdAt: 1,
          updatedAt: 1,
          
          // Include selected ServiceProvider fields
          'serviceProvider.providerID': 1,
          'serviceProvider.name': 1,
          'serviceProvider.contactInfo': 1,
        },
      },
      
      // Lookup for Service
      {
        $lookup: {
          from: 'Service', // Name of the Service collection
          localField: 'serviceID', // Field in ServiceRequest
          foreignField: 'serviceID', // Field in Service
          as: 'service',
        },
      },
      {
        $unwind: {
          path: '$service',
          preserveNullAndEmptyArrays: true, // Optional: keep ServiceRequest even if no Service found
        },
      },
      {
        $project: {
          // Include all ServiceRequest fields
          requestID: 1,
          farmerId: 1,
          farmerName: 1,
          farmerContactInfo: 1,
          farmerAddress: 1,
          scheduledDate: 1,
          serviceProviderID: 1,
          serviceID: 1,
          status: 1,
          notes: 1,
          createdAt: 1,
          updatedAt: 1,
          
          // Include selected ServiceProvider fields
          'serviceProvider.providerID': 1,
          'serviceProvider.name': 1,
          'serviceProvider.contactInfo': 1,
          
          // Include selected Service fields
          'service.serviceID': 1,
          'service.serviceName': 1,
          'service.category': 1,
        },
      },
    ]);

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
    const { farmerId, status } = req.query; 
    // e.g., /api/service-requests/farmer?farmerId=farmer123&status=active

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

    // Fetch Farmer from MongoDB
    const farmer = await Farmer.findOne({ farmerId });
    if (!farmer) {
      console.log(`Farmer not found for farmerId: ${farmerId}`);
      return res.status(404).json({ error: 'Farmer not found.' });
    }

    let requests = [];
    if (status === 'active') {
      // Filter currentServiceRequests based on active statuses
      requests = farmer.currentServiceRequests.filter(
        req => ['Pending', 'InProgress', 'Assigned'].includes(req.status)
      );
    } else if (status === 'completed') {
      // Filter completedServiceRequests based on completed statuses
      // Note: schema uses "Cancelled" (double 'l')
      requests = farmer.completedServiceRequests.filter(
        req => ['Completed', 'Cancelled'].includes(req.status)
      );
    }

    if (!requests.length) {
      console.log('No service requests found matching the criteria.');
      return res.status(200).json({ serviceRequests: [] });
    }

    // Sort requests by scheduledDate descending (latest first)
    requests.sort((a, b) => b.scheduledDate - a.scheduledDate);

    // Optionally populate serviceProvider and service details
    const populatedRequests = await Promise.all(
      requests.map(async (request) => {
        const serviceProvider = await ServiceProvider.findOne({ serviceProviderId: request.serviceProviderID })
          .select('name contactInfo');

        const service = await Service.findOne({ serviceId: request.serviceID })
          .select('serviceName category');

        return {
          ...request.toObject(),
          serviceProvider: serviceProvider || null,
          service: service || null,
        };
      })
    );

    res.status(200).json({ serviceRequests: populatedRequests });
  } catch (error) {
    console.error('Error fetching Service Requests for Farmer:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};


/**
 * Get Service Request by RequestID
 */
exports.getServiceRequestById = async (req, res) => {
  try {
    const { requestId } = req.params;
    // Query by the custom 'requestID' field
    const serviceRequest = await ServiceRequest.findOne({ requestID: requestId });
    if (serviceRequest) {
      res.status(200).json({ serviceRequest });
    } else {
      res.status(404).json({ error: 'Service Request not found.' });
    }
  } catch (error) {
    console.error('Error fetching Service Request by ID:', error);
    res.status(500).json({ error: error.message });
  }
};