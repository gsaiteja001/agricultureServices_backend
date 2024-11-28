
const ServiceProvider = require('../models/ServiceProvider');
const Address = require('../models/Address');
const Equipment = require('../models/Equipment');
const Service = require('../models/Service');

const Farmer = require('../models/farmer');

module.exports = {
  // Create a new ServiceProvider
  createServiceProvider: async (req, res) => {
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

      // Create the ServiceProvider
      const serviceProvider = await ServiceProvider.create({
        ProviderID,
        Name,
        ContactInfo,
        Availability,
        Experience,
        Certifications,
        Ratings,
      });

      // Associate Addresses
      if (Addresses && Addresses.length > 0) {
        const addressPromises = Addresses.map((address) =>
          Address.create({ ...address, ProviderID })
        );
        await Promise.all(addressPromises);
      }

      // Associate Equipments
      if (Equipments && Equipments.length > 0) {
        const equipmentPromises = Equipments.map((equipment) =>
          Equipment.create({ ...equipment, OwnedBy: ProviderID })
        );
        await Promise.all(equipmentPromises);
      }

      // Associate Services
      if (ServiceIDs && ServiceIDs.length > 0) {
        await serviceProvider.addServices(ServiceIDs);
      }

      // Update Farmer's ProviderId if farmerId is provided
      if (farmerId) {
        try {
          const farmer = await Farmer.findOne({ farmerId: farmerId });
          if (!farmer) {
            // If farmer not found, optionally handle it
            return res.status(404).json({ error: 'Farmer not found' });
          }

          // Update ProviderId
          farmer.ProviderId = ProviderID;
          await farmer.save();
        } catch (error) {
          console.error('Error updating Farmer ProviderId:', error);
          // Optionally, you might want to rollback the ServiceProvider creation
          return res.status(500).json({ error: 'Failed to update Farmer ProviderId' });
        }
      }

      res.status(201).json({
        message: 'ServiceProvider created successfully',
        data: serviceProvider,
      });
    } catch (error) {
      console.error('Error creating ServiceProvider:', error);
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
