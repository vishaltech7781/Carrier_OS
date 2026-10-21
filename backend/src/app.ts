import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';

import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import resumeRoutes from './routes/resume.routes';
import jobRoutes from './routes/job.routes';
import roadmapRoutes from './routes/roadmap.routes';
import dsaRoutes from './routes/dsa.routes';
import interviewRoutes from './routes/interview.routes';
import analyticsRoutes from './routes/analytics.routes';
import resourceRoutes from './routes/resource.routes';
import adminRoutes from './routes/admin.routes';
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();

// Security and utility middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Static folder for uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Root info
app.get('/', (req: Request, res: Response) => {
  res.json({
    app: 'CareerOS AI — Personal Career Intelligence Platform API Gateway',
    version: '1.0.0',
    documentation: '/api/v1/health',
    status: 'operational',
  });
});

// Versioned API Routes
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/resume', resumeRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/roadmap', roadmapRoutes);
app.use('/api/v1/dsa', dsaRoutes);
app.use('/api/v1/interviews', interviewRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/resources', resourceRoutes);
app.use('/api/v1/admin', adminRoutes);

// Centralized Error Handling
app.use(errorHandler);

export default app;

