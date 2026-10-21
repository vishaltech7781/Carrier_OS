import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { prisma } from '../config/db';
import { aiClient } from '../services/aiClient';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const mongoState = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';

  let mysqlState = 'Disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    mysqlState = 'Connected';
  } catch (e) {
    mysqlState = 'Error: ' + (e as Error).message;
  }

  const aiStatus = await aiClient.checkHealth();

  res.json({
    status: 'online',
    service: 'careeros-backend-api',
    timestamp: new Date().toISOString(),
    databases: {
      mongodb: mongoState,
      mysql: mysqlState,
    },
    aiService: {
      status: aiStatus.online ? 'Connected' : 'Unavailable (Fallback Active)',
      details: aiStatus.details,
    },
  });
});

export default router;

