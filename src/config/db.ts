import mongoose from 'mongoose';
import config from './index';

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }

  try {
    const conn = await mongoose.connect(config.mongoUri);
    isConnected = conn.connections[0].readyState === 1;
    console.log(
      `MongoDB Connected successfully: ${conn.connection.host} (DB: ${conn.connection.name})`
    );
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

export default connectDB;
