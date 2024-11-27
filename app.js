require('dotenv').config();
const express = require('express');
const sequelize = require('./config/database');

const connectMongoose = require('./config/mongoose');


const cors = require('cors');


// Import models
const Service = require('./models/Service');
const ServiceProvider = require('./models/ServiceProvider');
const ServiceProvider_Service = require('./models/ServiceProvider_Service');
const Equipment = require('./models/Equipment');
const ServiceOffering = require('./models/ServiceOffering');
const ServiceProvider_Equipment = require('./models/ServiceProvider_Equipment');
const Equipment_Crop = require('./models/Equipment_Crop');
const Crop = require('./models/Crop');
const Address = require('./models/Address');

// Define associations
// ServiceProvider and Address
ServiceProvider.belongsTo(Address, { foreignKey: 'AddressID' });
Address.hasOne(ServiceProvider, { foreignKey: 'AddressID' });

// ServiceProvider and Service (many-to-many)
ServiceProvider.belongsToMany(Service, {
  through: ServiceProvider_Service,
  foreignKey: 'ProviderID',
  otherKey: 'ServiceID',
});
Service.belongsToMany(ServiceProvider, {
  through: ServiceProvider_Service,
  foreignKey: 'ServiceID',
  otherKey: 'ProviderID',
});

// ServiceProvider and Equipment (many-to-many)
ServiceProvider.belongsToMany(Equipment, {
  through: ServiceProvider_Equipment,
  foreignKey: 'ProviderID',
  otherKey: 'EquipmentID',
});
Equipment.belongsToMany(ServiceProvider, {
  through: ServiceProvider_Equipment,
  foreignKey: 'EquipmentID',
  otherKey: 'ProviderID',
});

// Equipment and Crop (many-to-many)
Equipment.belongsToMany(Crop, {
  through: Equipment_Crop,
  foreignKey: 'EquipmentID',
  otherKey: 'CropID',
});
Crop.belongsToMany(Equipment, {
  through: Equipment_Crop,
  foreignKey: 'CropID',
  otherKey: 'EquipmentID',
});

// ServiceOffering relationships
ServiceOffering.belongsTo(ServiceProvider, { foreignKey: 'ProviderID' });
ServiceProvider.hasMany(ServiceOffering, { foreignKey: 'ProviderID' });

ServiceOffering.belongsTo(Service, { foreignKey: 'ServiceID' });
Service.hasMany(ServiceOffering, { foreignKey: 'ServiceID' });

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

app.use(cors());

app.use(cors({
    origin: 'http://localhost:3001',
    credentials: false,
  }));
// Import routes
const serviceRoutes = require('./routes/serviceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const serviceProvidersRoute = require('./routes/serviceProviders');
const equipmentRoute = require('./routes/equipment');


// Use routes
app.use('/api', serviceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/serviceProviders', serviceProvidersRoute);
app.use('/api/equipment', equipmentRoute);

const serviceRequestsRoutes = require('./routes/serviceRequests');

// Routes
app.use('/api/service-requests', serviceRequestsRoutes);



// // Route handler for getting a specific service provider
// app.get('/api/serviceProviders/:id', async (req, res) => {
//   try {
//     const serviceProvider = await ServiceProvider.findByPk(req.params.id, {
//       include: [
//         {
//           model: Service,
//           through: { attributes: [] },
//         },
//         {
//           model: Equipment,
//           through: { attributes: [] },
//         },
//         Address,
//       ],
//     });
//     if (serviceProvider) {
//       res.json(serviceProvider);
//     } else {
//       res.status(404).json({ error: 'ServiceProvider not found' });
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


// app.get('/api/equipment/:id', async (req, res) => {
//     try {
//       const equipment = await Equipment.findByPk(req.params.id, {
//         include: [
//           {
//             model: ServiceProvider,
//             through: { attributes: [] }, 
//             include: [Address], 
//           },
//           {
//             model: Crop,
//             through: { attributes: [] },
//           },
//         ],
//       });
  
//       if (equipment) {
//         res.json(equipment);
//       } else {
//         res.status(404).json({ error: 'Equipment not found' });
//       }
//     } catch (error) {
//       console.error('Error fetching equipment details:', error);
//       res.status(500).json({ error: error.message });
//     }
//   });




// 1. Get all services along with their service providers
app.get('/services', async (req, res) => {
  try {
    const services = await Service.findAll({
      include: [
        {
          model: ServiceProvider,
          through: { attributes: [] },
        },
      ],
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Get a specific service with its service providers and their equipment
app.get('/api/services/:id', async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id, {
      include: [
        {
          model: ServiceProvider,
          through: { attributes: [] },
          include: [
            {
              model: Equipment,
              through: { attributes: [] },
            },
            Address,
          ],
        },
      ],
    });
    if (service) {
      res.json(service);
    } else {
      res.status(404).json({ error: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// // 3. Get all equipment with the crops they are used for
// app.get('/api/equipment', async (req, res) => {
//   try {
//     const equipmentList = await Equipment.findAll({
//       include: [
//         {
//           model: Crop,
//           through: { attributes: [] },
//         },
//       ],
//     });
//     res.json(equipmentList);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// 4. Get a specific equipment item with its associated crops
app.get('/api/equipment/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findByPk(req.params.id, {
      include: [
        {
          model: Crop,
          through: { attributes: [] },
        },
        {
          model: ServiceProvider,
          through: { attributes: [] },
        },
      ],
    });
    if (equipment) {
      res.json(equipment);
    } else {
      res.status(404).json({ error: 'Equipment not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Get all crops with equipment that can be used on them
app.get('/api/crops', async (req, res) => {
  try {
    const crops = await Crop.findAll({
      include: [
        {
          model: Equipment,
          through: { attributes: [] },
        },
      ],
    });
    res.json(crops);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Get a specific crop with its associated equipment
app.get('/api/crops/:id', async (req, res) => {
  try {
    const crop = await Crop.findByPk(req.params.id, {
      include: [
        {
          model: Equipment,
          through: { attributes: [] },
          include: [
            {
              model: ServiceProvider,
              through: { attributes: [] },
            },
          ],
        },
      ],
    });
    if (crop) {
      res.json(crop);
    } else {
      res.status(404).json({ error: 'Crop not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Get all service offerings with service provider and service details
app.get('/api/serviceOfferings', async (req, res) => {
  try {
    const serviceOfferings = await ServiceOffering.findAll({
      include: [
        {
          model: ServiceProvider,
          include: [Address],
        },
        Service,
      ],
    });
    res.json(serviceOfferings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Get a specific service offering with detailed information
app.get('/api/serviceOfferings/:id', async (req, res) => {
  try {
    const serviceOffering = await ServiceOffering.findByPk(req.params.id, {
      include: [
        {
          model: ServiceProvider,
          include: [Address],
        },
        Service,
      ],
    });
    if (serviceOffering) {
      res.json(serviceOffering);
    } else {
      res.status(404).json({ error: 'ServiceOffering not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


const startServer = async () => {
  try {
    // Synchronize Sequelize models
    await sequelize.sync();
    console.log('Database synchronized');

    // Connect to MongoDB
    await connectMongoose();

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1); // Exit process with failure
  }
};

// Start the server
startServer();
