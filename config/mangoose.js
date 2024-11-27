// config/mongoose.js
const mongoose = require('mongoose');

const connectMongoose = async () => {
  try {
    await mongoose.connect('mongodb+srv://teja:teja@cluster0.bgdbs80.mongodb.net/kissanfarm?retryWrites=true&w=majority&appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectMongoose;
