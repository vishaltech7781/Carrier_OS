import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectMongoDB, prisma } from './config/db';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  console.log('--- Initializing CareerOS AI Backend Gateway ---');

  // Connect MongoDB
  await connectMongoDB();

  // Test MySQL Prisma connection
  try {
    await prisma.$connect();
    console.log('✔ Connected to MySQL Database (careeros_db) via Prisma');
  } catch (err) {
    console.error('✘ MySQL Connection Error:', (err as Error).message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 CareerOS AI Backend is active at http://localhost:${PORT}`);
    console.log(`📡 Health Check endpoint: http://localhost:${PORT}/api/v1/health`);
  });
}

bootstrap().catch(err => {
  console.error('Fatal initialization error:', err);
  process.exit(1);
});

