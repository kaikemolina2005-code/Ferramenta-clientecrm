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
import tasksRoutes from './routes/tasks.js';
import typebotRoutes from './routes/typebotWebhook.js';
import facebookRoutes from './routes/facebookWebhook.js';
import { socketService } from './socket/service.js';
import { sequenceScheduler } from './scheduler/sequenceScheduler.js';
import { automationScheduler } from './scheduler/automationScheduler.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
socketService.initialize(server);

const PORT = process.env.PORT || 3000;

// Origens permitidas: FRONTEND_URL em produção + localhost em desenvolvimento
const allowedOrigins = new Set<string>();
if (process.env.FRONTEND_URL) {
  allowedOrigins.add(process.env.FRONTEND_URL.trim().replace(/\/$/, ''));
}
if (process.env.NODE_ENV !== 'production') {
  // Permite qualquer porta local apenas fora de produção
  allowedOrigins.add('http://localhost:5173');
  allowedOrigins.add('http://127.0.0.1:5173');
}

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Requisições sem origin (ex: curl, Postman, chamadas server-side) são permitidas
    if (!origin) {
      return callback(null, true);
    }
    const normalizedOrigin = origin.trim().replace(/\/$/, '');
    if (allowedOrigins.has(normalizedOrigin)) {
      return callback(null, true);
    }
    // Permite previews da Vercel do mesmo projeto (ex: *-git-main-*.vercel.app)
    if (/^https:\/\/ferramenta-advocacia(-[a-z0-9-]+)?\.vercel\.app$/.test(normalizedOrigin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin '${origin}' not allowed`));
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
app.use('/api/tasks', tasksRoutes);
app.use('/api/typebot', typebotRoutes);
app.use('/api/facebook', facebookRoutes);

// Error handling
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

/**
 * Migração leve e idempotente: garante que as colunas novas do Lead existam.
 * Usa ADD COLUMN IF NOT EXISTS, então é seguro rodar a cada boot e não quebra
 * se as colunas já existirem (evita depender do prisma migrate em produção).
 */
async function ensureLeadColumns() {
  try {
    const { prisma } = await import('./services/prisma.js');
    const columns = [
      'neighborhood',
      'nationality',
      'maritalStatus',
      'profession',
    ];
    for (const col of columns) {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "${col}" TEXT`
      );
    }

    // Tabela genérica de configurações compartilhadas (ex: colunas do CRM)
    await prisma.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS "AppSetting" ("key" TEXT PRIMARY KEY, "value" TEXT)`
    );

    console.log('✅ Colunas do Lead e AppSetting verificadas/criadas');
  } catch (error) {
    console.error('⚠️ Erro ao garantir colunas do Lead:', error);
  }
}

server.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);

  // Garante colunas novas antes de servir requisições que as utilizam
  await ensureLeadColumns();

  // Inicia o scheduler de email sequences
  sequenceScheduler.start();

  // Inicia o scheduler de automação (Passo 10)
  automationScheduler.start();
});
