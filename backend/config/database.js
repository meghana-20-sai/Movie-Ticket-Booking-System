import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  const mongoURI = process.env.MONGODB_URI;

  if (mongoURI && mongoURI.trim() !== '') {
    try {
      const conn = await mongoose.connect(mongoURI);
      isConnected = true;
      console.log(`[Database] Connected to MongoDB Atlas/Instance: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.warn(`[Database] Could not connect to configured MONGODB_URI: ${err.message}. Initializing in-memory fallback...`);
    }
  }

  // Graceful in-memory fallback so the application works out of the box
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    const conn = await mongoose.connect(uri);
    isConnected = true;
    console.log(`[Database] Connected to In-Memory MongoDB instance at ${uri}`);
  } catch (memErr) {
    console.error(`[Database] Failed to connect to any MongoDB instance:`, memErr);
    process.exit(1);
  }
};
