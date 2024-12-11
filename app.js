// server.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const bodyParser = require('body-parser'); 
const path = require('path');

const axios = require('axios'); 
const jwt = require('jsonwebtoken'); 

const { body, validationResult } = require('express-validator'); 

const app = express();

// Environment Variables
const PORT = process.env.PORT || 8086;
const mongo_uri = process.env.MONGO_URI || "mongodb+srv://teja:teja@cluster0.bgdbs80.mongodb.net/kissanfarm?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB
const connectMongoose = async () => {
  try {
    await mongoose.connect(mongo_uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useCreateIndex: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1); // Exit process with failure
  }
};

// Middlewares
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// // Configure Multer for file uploads (if needed)
// app.use(multer().any()); 

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:3001','https://kisan-admin-dmngu3ijc-saiteja1911s-projects.vercel.app','https://kisan-admin-ooxoefs84-saiteja1911s-projects.vercel.app/services'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}));

// Import Routes
const serviceRoutes = require('./routes/serviceRoutes');

const serviceProvidersRoute = require('./routes/serviceProviders');
const equipmentRoute = require('./routes/equipment');
const serviceRequestsRoutes = require('./routes/serviceRequests');
const cropsRoutes = require('./routes/crops'); 


// Use Routes
app.use('/api', serviceRoutes);

app.use('/api/serviceProviders', serviceProvidersRoute);
app.use('/api/equipment', equipmentRoute);
app.use('/api/service-requests', serviceRequestsRoutes);
app.use('/api/crops', cropsRoutes);


// Define a Root Route for Testing
app.get('/', (req, res) => {
  res.send('Welcome to the Kissan Farm API');
});

// Start Server after Connecting to MongoDB
const startServer = async () => {
  await connectMongoose();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}...`);
  });
};

startServer();
