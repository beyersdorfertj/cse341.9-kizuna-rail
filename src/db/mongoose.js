
import mongoose from 'mongoose';

const connectToMongoose = async (options = {}) => {
  const connectionString = options.connectionString || process.env.MONGODB_URI;
  const databaseName =
    options.databaseName || process.env.MONGODB_DB_NAME;

  if (!connectionString) {
    throw new Error('MONGODB_URI is required.');
  }

  try {
    await mongoose.connect(connectionString, {
      dbName: databaseName || undefined,
    });

    console.log('Mongoose connected to MongoDB');
  } catch (error) {
    console.error('Mongoose connection failed:', error.message);
    throw error;
  }
};

export { connectToMongoose };
