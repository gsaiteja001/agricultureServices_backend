// controllers/serviceRequestController.js
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/database');
const ServiceRequest = require('../models/ServiceRequest');
const ServiceProvider = require('../models/ServiceProvider');
const Service = require('../models/Service');
const Address = require('../models/Address');
const Farmer = require('../models/farmer');

// Add a new Service Request
exports.addServiceRequest = async (req, res) => {
  const {
    farmerId,
    farmerName,
    farmerContactInfo,
    farmerAddress,
    scheduledDate,

    serviceProviderId,
    serviceId,
    notes,
  } = req.body;

  // Start a transaction for Sequelize
  const t = await sequelize.transaction();

  try {
    // Validate ServiceProvider
    const serviceProvider = await ServiceProvider.findByPk(serviceProviderId, { transaction: t });
    if (!serviceProvider) {
      throw new Error('Service Provider not found.');
    }

    // Validate Service
    const service = await Service.findByPk(serviceId, { transaction: t });
    if (!service) {
      throw new Error('Service not found.');
    }

    // Create ServiceRequest in SQL
    const requestID = uuidv4(); // Generate unique RequestID
    const newServiceRequest = await ServiceRequest.create(
      {
        RequestID: requestID,
        FarmerID: farmerId,
        FarmerName: farmerName,
        FarmerContactInfo: farmerContactInfo,
        FarmerAddress: farmerAddress,
        ScheduledDate: scheduledDate,

        ServiceProviderID: serviceProviderId,
        ServiceID: serviceId,
        Status: 'pending',
        Notes: notes,
      },
      { transaction: t }
    );

    // Update Farmer document in MongoDB
    const farmer = await Farmer.findOne({ farmerId: farmerId });
    if (!farmer) {
      throw new Error('Farmer not found in MongoDB.');
    }

    // Add to currentOrders
    farmer.currentServiceRequests.push(newServiceRequest.RequestID);
    await farmer.save();

    // Commit the transaction
    await t.commit();

    res.status(201).json({
      message: 'Service Request created successfully.',
      serviceRequest: newServiceRequest,
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await t.rollback();
    console.error('Error adding Service Request:', error);
    res.status(400).json({ error: error.message });
  }
};

// Update an existing Service Request
exports.updateServiceRequest = async (req, res) => {
  const { requestId } = req.params;
  const updateData = req.body;

  // Start a transaction for Sequelize
  const t = await sequelize.transaction();

  try {
    // Find the ServiceRequest
    const serviceRequest = await ServiceRequest.findByPk(requestId, { transaction: t });
    if (!serviceRequest) {
      throw new Error('Service Request not found.');
    }

    // Update ServiceRequest
    await serviceRequest.update(updateData, { transaction: t });

    // If Status is updated, reflect changes in Farmer's document
    if (updateData.Status) {
      const farmer = await Farmer.findOne({ farmerId: serviceRequest.FarmerID });
      if (!farmer) {
        throw new Error('Farmer not found in MongoDB.');
      }

      if (updateData.Status === 'completed' || updateData.Status === 'canceled') {
        // Remove from currentOrders
        farmer.currentOrders = farmer.currentOrders.filter(id => id !== requestId);
        // Add to completedOrders or returnedOrders based on status
        if (updateData.Status === 'completed') {
          farmer.completedOrders.push(requestId);
        } else if (updateData.Status === 'canceled') {
          farmer.returnedOrders.push(requestId);
        }
        await farmer.save();
      }
    }

    // Commit the transaction
    await t.commit();

    res.status(200).json({
      message: 'Service Request updated successfully.',
      serviceRequest,
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await t.rollback();
    console.error('Error updating Service Request:', error);
    res.status(400).json({ error: error.message });
  }
};

// Get active/completed Service Requests for a ServiceProvider
exports.getServiceRequestsForProvider = async (req, res) => {
  const { providerId, status } = req.query; // e.g., /api/service-requests/provider?providerId=123&status=active

  try {
    // Validate ServiceProvider
    const serviceProvider = await ServiceProvider.findByPk(providerId);
    if (!serviceProvider) {
      throw new Error('Service Provider not found.');
    }

    // Define status filter
    let statusFilter = {};
    if (status === 'active') {
      statusFilter = {
        Status: ['pending', 'accepted'],
      };
    } else if (status === 'completed') {
      statusFilter = {
        Status: ['completed', 'canceled'],
      };
    }

    // Fetch ServiceRequests
    const serviceRequests = await ServiceRequest.findAll({
      where: {
        ServiceProviderID: providerId,
        ...statusFilter,
      },
      include: [
        { model: Service, attributes: ['ServiceName', 'Category'] },
        { model: Address },
      ],
    });

    res.status(200).json({ serviceRequests });
  } catch (error) {
    console.error('Error fetching Service Requests for Provider:', error);
    res.status(400).json({ error: error.message });
  }
};

// Get active/completed Service Requests raised by a Farmer
exports.getServiceRequestsForFarmer = async (req, res) => {
  const { farmerId, status } = req.query; // e.g., /api/service-requests/farmer?farmerId=farmer123&status=active

  try {
    // Fetch Farmer from MongoDB to verify existence
    const farmer = await Farmer.findOne({ farmerId: farmerId });
    if (!farmer) {
      throw new Error('Farmer not found in MongoDB.');
    }

    // Define status filter
    let statusFilter = {};
    if (status === 'active') {
      statusFilter = {
        Status: ['pending', 'accepted'],
      };
    } else if (status === 'completed') {
      statusFilter = {
        Status: ['completed', 'canceled'],
      };
    }

    // Fetch ServiceRequests
    const serviceRequests = await ServiceRequest.findAll({
      where: {
        FarmerID: farmerId,
        ...statusFilter,
      },
      include: [
        { model: ServiceProvider, attributes: ['Name', 'ContactInfo'] },
        { model: Service },
        { model: Address },
      ],
    });

    res.status(200).json({ serviceRequests });
  } catch (error) {
    console.error('Error fetching Service Requests for Farmer:', error);
    res.status(400).json({ error: error.message });
  }
};
