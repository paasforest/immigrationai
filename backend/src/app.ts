import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import prisma from './config/prisma';

// Import routes
import authRoutes from './routes/auth.routes';
import documentRoutes from './routes/documents.routes';
import checklistRoutes from './routes/checklists.routes';
import billingRoutes from './routes/billing.routes';
import aiRoutes from './routes/ai.routes';
import feedbackRoutes from './routes/feedback.routes';
import usageRoutes from './routes/usage.routes';
import paymentRoutes from './routes/payments.routes';
// import paymentProofRoutes from './routes/paymentProof.routes'; // Temporarily disabled
import adminRoutes from './routes/admin.routes';
import interviewCoachRoutes from './routes/interview-coach.routes';
import uploadRoutes from './routes/upload.routes';
import analyticsRoutes from './routes/analytics.routes';
import teamRoutes from './routes/team.routes';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 4000;
let isShuttingDown = false;

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// ROUTES
// ============================================================================

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/payments', paymentRoutes);
// app.use('/api/payments', paymentProofRoutes); // Temporarily disabled
app.use('/api/admin', adminRoutes);
app.use('/api', aiRoutes); // AI-powered features
app.use('/api', feedbackRoutes); // Feedback & Learning system
app.use('/api/interview-coach', interviewCoachRoutes); // Interview Coach system
app.use('/api/upload', uploadRoutes); // File upload to Supabase Storage
app.use('/api', analyticsRoutes); // Analytics dashboard
app.use('/api', teamRoutes); // Team management

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: true,
    message,
    statusCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: true,
    message: 'Route not found',
    statusCode: 404
  });
});

// ============================================================================
// GRACEFUL SHUTDOWN (SINGLE HANDLER - CRITICAL FIX)
// ============================================================================

let server: any;

async function gracefulShutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    console.log('Shutdown already in progress...');
    return;
  }

  isShuttingDown = true;
  console.log(`\n[${signal}] Shutting down gracefully...`);

  // Close HTTP server
  if (server) {
    await new Promise<void>((resolve) => {
      server.close(() => {
        console.log('HTTP server closed');
        resolve();
      });
    });
  }

  // Disconnect Prisma
  try {
    await prisma.$disconnect();
    console.log('Prisma disconnected');
  } catch (error) {
    console.error('Error disconnecting Prisma:', error);
  }

  // Exit process
  process.exit(0);
}

// Register single shutdown handler
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// ============================================================================
// START SERVER
// ============================================================================

async function startServer(): Promise<void> {
  try {
    // Test database connection
    console.log('Testing database connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');

    // Start listening
    server = app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║         🚀 Immigration AI Backend Started            ║
║                                                       ║
║  Server: http://localhost:${PORT}                    ║
║  Environment: ${process.env.NODE_ENV || 'development'}${' '.repeat(21)}║
║  Health Check: http://localhost:${PORT}/health      ║
╚═══════════════════════════════════════════════════════╝
      `);
    });

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.error('Try: lsof -i :' + PORT);
      } else {
        console.error('Server error:', error);
      }
      gracefulShutdown('server error');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;