import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import memberRoutes from './routes/members';
import packageRoutes from './routes/packages';
import attendanceRoutes from './routes/attendance';
import branchRoutes from './routes/branches';
import trainerRoutes from './routes/trainers';
import workoutRoutes from './routes/workouts';
import dietRoutes from './routes/diets';
import measurementRoutes from './routes/measurements';
import analyticsRoutes from './routes/analytics';
import staffRoutes from './routes/staff';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json());

// Make prisma available to routes
app.locals.prisma = prisma;

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/members', memberRoutes);
app.use('/api/v1/packages', packageRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/branches', branchRoutes);
app.use('/api/v1/trainers', trainerRoutes);
app.use('/api/v1/workouts', workoutRoutes);
app.use('/api/v1/diets', dietRoutes);
app.use('/api/v1/measurements', measurementRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/staff', staffRoutes);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🏋️ Gym API running on port ${PORT}`);
});

export { prisma };
