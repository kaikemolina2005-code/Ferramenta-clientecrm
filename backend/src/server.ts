import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import authRoutes from './routes/auth.js';
import leadsRoutes from './routes/leads.js';
import kanbanRoutes from './routes/kanban.js';
import documentsRoutes from './routes/documents.js';
import whatsappRoutes from './routes/whatsapp.js';
import aiRoutes from './routes/ai.js';
import webhooksRoutes from './routes/webhooks.js';
import sequencesRoutes from './routes/sequences.js';
import automationRoutes from './routes/automation.js';
import reportsRoutes from './routes/reports.js';
import { socketService } from './socket/service.js';
import { sequenceScheduler } from './scheduler/sequenceScheduler.js';
import { automationScheduler } from './scheduler/automationScheduler.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
socketService.initialize(server);

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Permitir localhost em qualquer porta para desenvolvimento
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route (for production monitoring)
app.get('/health', async (_req, res) => {
  try {
    // Import Prisma
    const { prisma } = await import('./services/prisma.js').catch(() => ({ prisma: null }));
    
    // Check database connection
    let dbHealthy = false;
    if (prisma) {
      try {
        await prisma.$queryRaw`SELECT 1`;
        dbHealthy = true;
      } catch (err) {
        dbHealthy = false;
      }
    }

    const health = {
      status: dbHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      database: dbHealthy ? 'connected' : 'disconnected',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      version: '1.0.0',
    };

    const statusCode = dbHealthy ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/kanban', kanbanRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/sequences', sequencesRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/reports', reportsRoutes);

// Error handling
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
  
  // Inicia o scheduler de email sequences
  sequenceScheduler.start();
  
  // Inicia o scheduler de automação (Passo 10)
  automationScheduler.start();
});
