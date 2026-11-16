const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not set. Set it to your MongoDB connection string.');
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully.');
  } catch (error) {
    throw new Error(
      'Unable to connect to MongoDB. Verify MONGODB_URI and database availability.',
      { cause: error }
    );
  }
};

module.exports = connectDB;