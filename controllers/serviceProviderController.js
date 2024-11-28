
const ServiceProvider = require('../models/ServiceProvider');
const Address = require('../models/Address');
const Equipment = require('../models/Equipment');
const Service = require('../models/Service');
const sequelize = require('../config/database');
const Farmer = require('../models/farmer');

const { Op } = require('sequelize');

module.exports = {
  // Create a new ServiceProvider
  createServiceProvider: async (req, res) => {
    const transaction = await sequelize.transaction();
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
        ServiceIDs, // Array of service IDs
        farmerId,
      } = req.body;

      // Check if farmerId exists in Mongoose
      const farmer = await Farmer.findOne({ farmerId: farmerId });
      if (!farmer) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Farmer not found' });
      }

       const serviceProvider = await ServiceProvider.create(
        {
          ProviderID,
          Name,
          ContactInfo,
          Availability,
          Experience,
          Certifications,
          Ratings,
          farmerId,
        },
        { transaction }
      );

      const equipmentIDs = Equipments.map((eq) => eq.EquipmentID).filter(Boolean);
      const uniqueEquipmentIDs = new Set(equipmentIDs);
      
      if (equipmentIDs.length !== uniqueEquipmentIDs.size) {
        throw new Error('Duplicate EquipmentID detected in Equipments array.');
      }

      // Associate Equipments
      if (Equipments && Equipments.length > 0) {
        const equipmentPromises = Equipments.map((equipment) =>
          Equipment.create(
            {
              EquipmentID: equipment.EquipmentID || undefined, // Let Sequelize generate
              Name: equipment.Name,
              Type: equipment.Type,
              Description: equipment.Description,
              Capacity: equipment.Capacity,
              OwnedBy: ProviderID,
            },
            { transaction }
          )
        );
        await Promise.all(equipmentPromises);
      }

      
      // Associate Addresses
      if (Addresses && Addresses.length > 0) {
        const addressPromises = Addresses.map((address) =>
          Address.create({ ...address, ProviderID }, { transaction })
        );
        await Promise.all(addressPromises);
      }

      // Associate Services
      if (ServiceIDs && ServiceIDs.length > 0) {
        await serviceProvider.addServices(ServiceIDs, { transaction });
      }

      // Update Farmer's ProviderId in Mongoose
      farmer.ProviderID = ProviderID;
      await farmer.save();

      // Commit the transaction
      await transaction.commit();

      res.status(201).json({
        message: 'ServiceProvider created successfully',
        data: serviceProvider,
      });
    } catch (error) {
      console.error('Error creating ServiceProvider:', error);
      await transaction.rollback();
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
  // Update the Equipments held by a ServiceProvider
  updateServiceProviderEquipments: async (req, res) => {
    try {
      const { ProviderID } = req.params;
      const { Equipments } = req.body; // Array of equipment objects

      // Remove existing Equipments
      await Equipment.destroy({ where: { OwnedBy: ProviderID } });

      // Add new Equipments
      if (Equipments && Equipments.length > 0) {
        const equipmentPromises = Equipments.map((equipment) =>
          Equipment.create({ ...equipment, OwnedBy: ProviderID })
        );
        await Promise.all(equipmentPromises);
      }

      res.json({ message: 'Equipments updated successfully' });
    } catch (error) {
      console.error('Error updating Equipments:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // Add or drop multiple Services for a ServiceProvider
  updateServiceProviderServices: async (req, res) => {
    try {
      const { ProviderID } = req.params;
      const { AddServiceIDs, RemoveServiceIDs } = req.body;

      const serviceProvider = await ServiceProvider.findByPk(ProviderID);

      if (!serviceProvider) {
        return res.status(404).json({ error: 'ServiceProvider not found' });
      }

      // Add new Services
      if (AddServiceIDs && AddServiceIDs.length > 0) {
        await serviceProvider.addServices(AddServiceIDs);
      }

      // Remove Services
      if (RemoveServiceIDs && RemoveServiceIDs.length > 0) {
        await serviceProvider.removeServices(RemoveServiceIDs);
      }

      res.json({ message: 'Services updated successfully' });
    } catch (error) {
      console.error('Error updating Services:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

   // Update a ServiceProvider along with Equipments and Services
  updateServiceProvider: async (req, res) => {
    const transaction = await sequelize.transaction();
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
        ServiceIDs, // Array of service IDs
        farmerId,
      } = req.body;

      // Find the existing ServiceProvider
      const serviceProvider = await ServiceProvider.findByPk(ProviderID, { transaction });

      if (!serviceProvider) {
        await transaction.rollback();
        return res.status(404).json({ error: 'ServiceProvider not found' });
      }

      // Update the ServiceProvider's basic details
      await serviceProvider.update({
        Name,
        ContactInfo,
        Availability,
        Experience,
        Certifications,
        Ratings,
        farmerId,
      }, { transaction });

      // Update Addresses
      if (Addresses) {
        // Delete existing Addresses
        await Address.destroy({ where: { ProviderID }, transaction });
        // Create new Addresses
        const addressPromises = Addresses.map((address) =>
          Address.create({ ...address, ProviderID }, { transaction })
        );
        await Promise.all(addressPromises);
      }

      // Update Equipments
      if (Equipments) {
        // Fetch existing equipments for the Provider
        const existingEquipments = await Equipment.findAll({
          where: { OwnedBy: ProviderID },
          transaction,
        });

        const existingEquipmentMap = {};
        existingEquipments.forEach((eq) => {
          existingEquipmentMap[eq.EquipmentID] = eq;
        });

        // IDs of equipments sent in the request
        const incomingEquipmentIDs = Equipments
          .filter((eq) => eq.EquipmentID)
          .map((eq) => eq.EquipmentID);

        // Delete equipments that are not in the incoming request
        const equipmentsToDelete = existingEquipments.filter(
          (eq) => !incomingEquipmentIDs.includes(eq.EquipmentID)
        );

        if (equipmentsToDelete.length > 0) {
          const deleteIDs = equipmentsToDelete.map((eq) => eq.EquipmentID);
          await Equipment.destroy({
            where: { EquipmentID: deleteIDs },
            transaction,
          });
        }

        // Update existing and create new equipments
        for (const equipment of Equipments) {
          if (equipment.EquipmentID && existingEquipmentMap[equipment.EquipmentID]) {
            // Update existing equipment
            await Equipment.update(
              {
                Name: equipment.Name,
                Type: equipment.Type,
                Description: equipment.Description,
                Capacity: equipment.Capacity,
                OwnedBy: ProviderID,
              },
              {
                where: { EquipmentID: equipment.EquipmentID },
                transaction,
              }
            );
          } else {
            // Create new equipment
            await Equipment.create(
              {
                EquipmentID: equipment.EquipmentID || undefined, // Let Sequelize generate if undefined
                Name: equipment.Name,
                Type: equipment.Type,
                Description: equipment.Description,
                Capacity: equipment.Capacity,
                OwnedBy: ProviderID,
              },
              { transaction }
            );
          }
        }
      }
      
      // Update Services
      if (ServiceIDs) {
        // Set the new list of Services
        await serviceProvider.setServices(ServiceIDs, { transaction });
      } else {
        // If no ServiceIDs provided, remove all associations
        await serviceProvider.setServices([], { transaction });
      }

      // Commit the transaction
      await transaction.commit();

      res.json({ message: 'ServiceProvider updated successfully' });
    } catch (error) {
      console.error('Error updating ServiceProvider:', error);
      await transaction.rollback();
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },


  
   deleteServiceProvider: async (req, res) => {
    const { ProviderID } = req.params;

    // Start a transaction to ensure data integrity
    const transaction = await sequelize.transaction();

    try {
      // Find the ServiceProvider
      const serviceProvider = await ServiceProvider.findOne({
        where: { ProviderID },
        transaction,
      });

      if (!serviceProvider) {
        await transaction.rollback();
        return res.status(404).json({ error: 'ServiceProvider not found' });
      }

      // Delete associated Addresses
      await Address.destroy({
        where: { ProviderID },
        transaction,
      });

      // Delete associated Equipments
      await Equipment.destroy({
        where: { OwnedBy: ProviderID },
        transaction,
      });

      // Remove associations with Services (Many-to-Many)
      await serviceProvider.setServices([], { transaction });

      // Update associated Farmers
      await Farmer.update(
        { ProviderId: null },
        { where: { ProviderId: ProviderID }, transaction }
      );

      // Finally, delete the ServiceProvider
      await serviceProvider.destroy({ transaction });

      // Commit the transaction
      await transaction.commit();

      res.json({ message: 'ServiceProvider deleted successfully' });
    } catch (error) {
      console.error('Error deleting ServiceProvider:', error);
      await transaction.rollback();
      res.status(500).json({ error: 'An error occurred while deleting the ServiceProvider.' });
    }
  },

  
};
