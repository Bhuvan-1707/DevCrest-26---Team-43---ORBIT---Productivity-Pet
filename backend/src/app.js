import express from 'express';
import cors from 'cors';

// Global BigInt JSON serialization handler for MariaDB driver integration
BigInt.prototype.toJSON = function() {
  return Number(this);
};

// Import Route Modules
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import goalRoutes from './routes/goals.js';
import sessionRoutes from './routes/sessions.js';
import observationRoutes from './routes/observations.js';
import recoveryRoutes from './routes/recovery.js';
import experimentRoutes from './routes/experiments.js';
import memoryRoutes from './routes/memories.js';
import insightRoutes from './routes/insights.js';

// Import Error Middleware
import errorHandler from './middleware/errorHandler.js';

const app = express();

// 1. Enable CORS for ORBIT Frontend
app.use(cors());

// 2. Enable JSON request body parsing
app.use(express.json());

// 3. Mount API Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/observations', observationRoutes);
app.use('/api/recovery', recoveryRoutes);
app.use('/api/experiments', experimentRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/insights', insightRoutes);

// 4. Global Error Middleware
app.use(errorHandler);

export default app;
