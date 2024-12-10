// controllers/serviceProviderController.js

const mongoose = require('mongoose');
const { ServiceProvider, Equipment, Address, Service, farmer } = require('../models');



/**
 * Helper function to retrieve Service ObjectIds based on serviceIDs
 * @param {Array<String>} serviceIDs - Array of serviceID strings
 * @param {mongoose.ClientSession} session - Mongoose session for transactions
 * @returns {Array<mongoose.Types.ObjectId>} - Array of Service ObjectIds
 */
const getServiceObjectIds = async (serviceIDs, session) => {
  const services = await Service.find({ serviceID: { $in: serviceIDs } }).session(session);
  
  if (services.length !== serviceIDs.length) {
    const foundServiceIDs = services.map(service => service.serviceID);
    const notFound = serviceIDs.filter(id => !foundServiceIDs.includes(id));
    throw new Error(`Services not found for serviceIDs: ${notFound.join(', ')}`);
  }

  return services.map(service => service._id);
};

/**
 * Create a new ServiceProvider
 */
exports.createServiceProvider = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      ProviderID,
      Name,
      ContactInfo,
      Availability,
      Experience,
      Certifications,
      Ratings,
      Addresses, // Array of address objects
      Equipments, // Array of equipment objects
      ServiceIDs, // Array of serviceID strings
      farmerId,
    } = req.body;

    // Check if farmerId exists in MongoDB
    const farmer = await Farmer.findOne({ farmerId }).session(session);
    if (!farmer) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'Farmer not found' });
    }

    // Check for duplicate EquipmentIDs
    const equipmentIDs = Equipments.map(eq => eq.EquipmentID).filter(Boolean);
    const uniqueEquipmentIDs = new Set(equipmentIDs);
    if (equipmentIDs.length !== uniqueEquipmentIDs.size) {
      throw new Error('Duplicate EquipmentID detected in Equipments array.');
    }

    // Create ServiceProvider
    const serviceProvider = new ServiceProvider({
      providerID: ProviderID,
      name: Name,
      contactInfo: ContactInfo,
      availability: Availability,
      experience: Experience,
      certifications: Certifications,
      ratings: Ratings,
      farmerId,
    });

    await serviceProvider.save({ session });

    // Associate Equipments
    if (Equipments && Equipments.length > 0) {
      const equipmentDocs = Equipments.map(equipment => ({
        equipmentID: equipment.EquipmentID || undefined, // Let Mongoose generate if undefined
        name: equipment.Name,
        type: equipment.Type,
        description: equipment.Description,
        capacity: equipment.Capacity,
        serviceProvider: serviceProvider._id,
      }));

      await Equipment.insertMany(equipmentDocs, { session });
    }

    // Associate Addresses
    if (Addresses && Addresses.length > 0) {
      const addressDocs = Addresses.map(address => ({
        provider: serviceProvider._id,
        street: address.Street,
        city: address.City,
        state: address.State,
        zipCode: address.ZipCode,
      }));

      await Address.insertMany(addressDocs, { session });
    }

    // Associate Services using serviceID
    if (ServiceIDs && ServiceIDs.length > 0) {
      const serviceObjectIds = await getServiceObjectIds(ServiceIDs, session); // Fetch ObjectIds

      await Service.updateMany(
        { _id: { $in: serviceObjectIds } },
        { $addToSet: { serviceProviders: serviceProvider._id } },
        { session }
      );

      serviceProvider.services = serviceObjectIds;
      await serviceProvider.save({ session });
    }

    // Update Farmer's ProviderId
    farmer.providerID = serviceProvider._id;
    await farmer.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: 'ServiceProvider created successfully',
      data: serviceProvider,
    });
  } catch (error) {
    console.error('Error creating ServiceProvider:', error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};




/**
 * Update the Equipments held by a ServiceProvider
 */
exports.updateServiceProviderEquipments = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { ProviderID } = req.params;
    const { Equipments } = req.body; // Array of equipment objects

    // Find the ServiceProvider
    const serviceProvider = await ServiceProvider.findOne({ providerID: ProviderID }).session(session);
    if (!serviceProvider) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'ServiceProvider not found' });
    }

    // Remove existing Equipments
    await Equipment.deleteMany({ serviceProvider: serviceProvider._id }, { session });

    // Add new Equipments
    if (Equipments && Equipments.length > 0) {
      const equipmentDocs = Equipments.map(equipment => ({
        equipmentID: equipment.EquipmentID || undefined, // Let Mongoose generate if undefined
        name: equipment.Name,
        type: equipment.Type,
        description: equipment.Description,
        capacity: equipment.Capacity,
        serviceProvider: serviceProvider._id,
      }));

      await Equipment.insertMany(equipmentDocs, { session });
    }

    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Equipments updated successfully' });
  } catch (error) {
    console.error('Error updating Equipments:', error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Add or remove multiple Services for a ServiceProvider
 */
exports.updateServiceProviderServices = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { ProviderID } = req.params;
    const { AddServiceIDs, RemoveServiceIDs } = req.body;

    // Find the ServiceProvider
    const serviceProvider = await ServiceProvider.findOne({ providerID: ProviderID }).session(session);
    if (!serviceProvider) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'ServiceProvider not found' });
    }

    // Add new Services using serviceID
    if (AddServiceIDs && AddServiceIDs.length > 0) {
      const addServiceObjectIds = await getServiceObjectIds(AddServiceIDs, session); // Fetch ObjectIds

      await Service.updateMany(
        { _id: { $in: addServiceObjectIds } },
        { $addToSet: { serviceProviders: serviceProvider._id } },
        { session }
      );

      serviceProvider.services.addToSet(...addServiceObjectIds);
    }

    // Remove Services using serviceID
    if (RemoveServiceIDs && RemoveServiceIDs.length > 0) {
      const removeServiceObjectIds = await getServiceObjectIds(RemoveServiceIDs, session); // Fetch ObjectIds

      await Service.updateMany(
        { _id: { $in: removeServiceObjectIds } },
        { $pull: { serviceProviders: serviceProvider._id } },
        { session }
      );

      serviceProvider.services.pull(...removeServiceObjectIds);
    }

    await serviceProvider.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Services updated successfully' });
  } catch (error) {
    console.error('Error updating Services:', error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};


/**
 * Update a ServiceProvider along with Equipments and Services
 */
exports.updateServiceProvider = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { ProviderID } = req.params;
    const {
      Name,
      ContactInfo,
      Availability,
      Experience,
      Certifications,
      Ratings,
      Addresses, // Array of address objects
      Equipments, // Array of equipment objects
      ServiceIDs, // Array of serviceID strings
      farmerId,
    } = req.body;

    // Find the existing ServiceProvider
    const serviceProvider = await ServiceProvider.findOne({ providerID: ProviderID }).session(session);
    if (!serviceProvider) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'ServiceProvider not found' });
    }

    // Update basic details
    if (Name !== undefined) serviceProvider.name = Name;
    if (ContactInfo !== undefined) serviceProvider.contactInfo = ContactInfo;
    if (Availability !== undefined) serviceProvider.availability = Availability;
    if (Experience !== undefined) serviceProvider.experience = Experience;
    if (Certifications !== undefined) serviceProvider.certifications = Certifications;
    if (Ratings !== undefined) serviceProvider.ratings = Ratings;
    if (farmerId !== undefined) serviceProvider.farmerId = farmerId;

    // Update Addresses
    if (Addresses) {
      // Remove existing Addresses
      await Address.deleteMany({ provider: serviceProvider._id }, { session });

      // Create new Addresses
      const addressDocs = Addresses.map(address => ({
        provider: serviceProvider._id,
        street: address.Street,
        city: address.City,
        state: address.State,
        zipCode: address.ZipCode,
      }));

      await Address.insertMany(addressDocs, { session });
    }

    // Update Equipments
    if (Equipments) {
      // Fetch existing equipments for the Provider
      const existingEquipments = await Equipment.find({ serviceProvider: serviceProvider._id }).session(session);
      const existingEquipmentMap = {};
      existingEquipments.forEach(eq => {
        existingEquipmentMap[eq.equipmentID] = eq;
      });

      // IDs of equipments sent in the request
      const incomingEquipmentIDs = Equipments
        .filter(eq => eq.EquipmentID)
        .map(eq => eq.EquipmentID);

      // Delete equipments that are not in the incoming request
      const equipmentsToDelete = existingEquipments.filter(
        eq => !incomingEquipmentIDs.includes(eq.equipmentID)
      );

      if (equipmentsToDelete.length > 0) {
        const deleteIDs = equipmentsToDelete.map(eq => eq.equipmentID);
        await Equipment.deleteMany({ equipmentID: { $in: deleteIDs } }, { session });
      }

      // Update existing and create new equipments
      for (const equipment of Equipments) {
        if (equipment.EquipmentID && existingEquipmentMap[equipment.EquipmentID]) {
          // Update existing equipment
          await Equipment.updateOne(
            { equipmentID: equipment.EquipmentID },
            {
              name: equipment.Name || existingEquipmentMap[equipment.EquipmentID].name,
              type: equipment.Type || existingEquipmentMap[equipment.EquipmentID].type,
              description: equipment.Description || existingEquipmentMap[equipment.EquipmentID].description,
              capacity: equipment.Capacity || existingEquipmentMap[equipment.EquipmentID].capacity,
              serviceProvider: serviceProvider._id,
            },
            { session }
          );
        } else {
          // Create new equipment
          const newEquipment = new Equipment({
            equipmentID: equipment.EquipmentID || undefined, // Let Mongoose generate if undefined
            name: equipment.Name,
            type: equipment.Type,
            description: equipment.Description,
            capacity: equipment.Capacity,
            serviceProvider: serviceProvider._id,
          });

          await newEquipment.save({ session });
        }
      }
    }

    // Update Services using serviceID
    if (ServiceIDs) {
      // Remove existing Service associations not in the new list
      const currentServiceIDs = await Service.find({ _id: { $in: serviceProvider.services } }).session(session)
        .select('serviceID').lean();
      const currentServiceIDStrings = currentServiceIDs.map(s => s.serviceID);

      const servicesToAddIDs = ServiceIDs.filter(id => !currentServiceIDStrings.includes(id));
      const servicesToRemoveIDs = currentServiceIDStrings.filter(id => !ServiceIDs.includes(id));

      // Add new Services
      if (servicesToAddIDs.length > 0) {
        const addServiceObjectIds = await getServiceObjectIds(servicesToAddIDs, session);

        await Service.updateMany(
          { _id: { $in: addServiceObjectIds } },
          { $addToSet: { serviceProviders: serviceProvider._id } },
          { session }
        );

        serviceProvider.services.push(...addServiceObjectIds);
      }

      // Remove old Services
      if (servicesToRemoveIDs.length > 0) {
        const removeServiceObjectIds = await getServiceObjectIds(servicesToRemoveIDs, session);

        await Service.updateMany(
          { _id: { $in: removeServiceObjectIds } },
          { $pull: { serviceProviders: serviceProvider._id } },
          { session }
        );

        serviceProvider.services = serviceProvider.services.filter(
          id => !removeServiceObjectIds.includes(id)
        );
      }
    } else {
      // If no ServiceIDs provided, remove all associations
      const allServiceObjectIds = serviceProvider.services;
      await Service.updateMany(
        { _id: { $in: allServiceObjectIds } },
        { $pull: { serviceProviders: serviceProvider._id } },
        { session }
      );

      serviceProvider.services = [];
    }

    await serviceProvider.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'ServiceProvider updated successfully' });
  } catch (error) {
    console.error('Error updating ServiceProvider:', error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};





/**
 * Delete a ServiceProvider
 */
exports.deleteServiceProvider = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { ProviderID } = req.params;

    // Find the ServiceProvider
    const serviceProvider = await ServiceProvider.findOne({ providerID: ProviderID }).session(session);
    if (!serviceProvider) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'ServiceProvider not found' });
    }

    // Delete associated Addresses
    await Address.deleteMany({ provider: serviceProvider._id }, { session });

    // Delete associated Equipments
    await Equipment.deleteMany({ serviceProvider: serviceProvider._id }, { session });

    // Remove associations with Services
    await Service.updateMany(
      { serviceProviders: serviceProvider._id },
      { $pull: { serviceProviders: serviceProvider._id } },
      { session }
    );

    // Update associated Farmers
    await Farmer.updateMany(
      { providerID: serviceProvider._id },
      { providerID: null },
      { session }
    );

    // Finally, delete the ServiceProvider
    await ServiceProvider.deleteOne({ _id: serviceProvider._id }, { session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'ServiceProvider deleted successfully' });
  } catch (error) {
    console.error('Error deleting ServiceProvider:', error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: 'An error occurred while deleting the ServiceProvider.' });
  }
};
