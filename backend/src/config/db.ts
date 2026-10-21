import mongoose from 'mongoose';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export const connectMongoDB = async (): Promise<boolean> => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careeros_ai';
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✔ Connected to MongoDB at:', mongoUri);
    return true;
  } catch (error) {
    console.error('✘ MongoDB Connection Warning:', (error as Error).message);
    console.warn('Note: MongoDB document storage may be unavailable. Ensure mongod service is running.');
    return false;
  }
};

