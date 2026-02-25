import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import prisma from './config/prisma';

// Import routes
import authRoutes from './routes/auth.routes';
import documentRoutes from './routes/documents.routes'; // AI-generated documents
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
import eligibilityRoutes from './routes/eligibility.routes';
import organizationsRoutes from './routes/organizations.routes';
import casesRoutes from './routes/cases.routes';
import caseDocumentsRoutes from './routes/case-documents.routes'; // Case file uploads
import tasksRoutes from './routes/tasks.routes';
import messagesRoutes from './routes/messages.routes';
import notificationsRoutes from './routes/notifications.routes';
import credentialsRoutes from './routes/credentials.routes';
import vacRoutes from './routes/vac.routes';
import immigrationAnalyticsRoutes from './routes/immigration-analytics.routes';
import intakeRoutes from './routes/intake.routes';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 4000;
let isShuttingDown = false;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Trust proxy for rate limiting (required behind Nginx)
app.set('trust proxy', 1);

app.use(helmet());

// SECURITY: Strict CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL].filter(Boolean) // Only production frontend
  : [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3001'
    ];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Apply general rate limiter to all routes
app.use(generalLimiter);

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// ============================================================================
// ROUTES
// ============================================================================

// Health check endpoints
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
app.get('/api/health', (req: Request, res: Response) => {
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
// Apply AI rate limiter to AI routes
app.use('/api/ai', aiLimiter);
app.use('/api', aiRoutes); // AI-powered features
app.use('/api', feedbackRoutes); // Feedback & Learning system
app.use('/api/interview-coach', interviewCoachRoutes); // Interview Coach system
app.use('/api/upload', uploadRoutes); // File upload to Supabase Storage
app.use('/uploads', express.static('uploads')); // Serve uploaded files statically
app.use('/api', analyticsRoutes); // Analytics dashboard
app.use('/api', teamRoutes); // Team management
app.use('/api/eligibility', eligibilityRoutes); // Public eligibility checks
app.use('/api/organizations', organizationsRoutes); // Organization management
app.use('/api/cases', casesRoutes); // Case management
app.use('/api/case-documents', caseDocumentsRoutes); // Case file uploads (new)
app.use('/api/tasks', tasksRoutes); // Task management
app.use('/api/messages', messagesRoutes); // Message management
app.use('/api/notifications', notificationsRoutes); // Notifications
app.use('/api/credentials', credentialsRoutes); // Credential evaluation guide
app.use('/api/vac', vacRoutes); // VAC appointment tracker
app.use('/api/immigration-analytics', immigrationAnalyticsRoutes); // Immigration analytics
app.use('/api/intake', intakeRoutes); // Marketplace intake and lead routing

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler (must be before error handler)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    code: 'NOT_FOUND',
  });
});

// Global error handler (must be last)
app.use(errorHandler);

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

// ============================================================================
// SCHEDULED TASKS
// ============================================================================

/**
 * Check for tasks due in 24 hours and create notifications
 */
async function checkTaskDeadlines(): Promise<void> {
  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find tasks due in next 24 hours that are not completed
    const tasks = await prisma.task.findMany({
      where: {
        dueDate: {
          gte: now,
          lte: tomorrow,
        },
        status: {
          not: 'completed',
        },
        assignedToId: {
          not: null,
        },
      },
      include: {
        assignedTo: {
          select: { id: true },
        },
        case: {
          select: {
            id: true,
            referenceNumber: true,
            title: true,
          },
        },
      },
    });

    // Create notifications for each task
    for (const task of tasks) {
      if (task.assignedToId) {
        // Check if notification already exists
        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId: task.assignedToId,
            type: 'deadline_approaching',
            resourceType: 'task',
            resourceId: task.id,
            createdAt: {
              gte: new Date(now.getTime() - 60 * 60 * 1000), // Within last hour
            },
          },
        });

        if (!existingNotification) {
          try {
            const { createNotification } = await import('./controllers/notificationController');
            await createNotification({
              organizationId: task.organizationId,
              userId: task.assignedToId,
              type: 'deadline_approaching',
              title: `Task due soon: ${task.title}`,
              body: `Task for case ${task.case.referenceNumber} is due in 24 hours`,
              resourceType: 'task',
              resourceId: task.id,
            });
          } catch (error) {
            console.error('Failed to create deadline notification:', error);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error checking task deadlines:', error);
  }
}

/**
 * Check for trial expirations and send emails
 */
async function checkTrialExpirations(): Promise<void> {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Check for organizations with trials ending in 7 days
    const orgs7Days = await prisma.organization.findMany({
      where: {
        trialEndsAt: {
          gte: new Date(sevenDaysFromNow.getTime() - 24 * 60 * 60 * 1000), // Within 24h of 7 days
          lte: sevenDaysFromNow,
        },
        planStatus: 'trial',
        sentTrialWarning7d: false,
      },
      include: {
        users: {
          where: {
            role: 'org_admin',
          },
          take: 1,
          select: {
            email: true,
            fullName: true,
          },
        },
      },
    });

    // Check for organizations with trials ending in 1 day
    const orgs1Day = await prisma.organization.findMany({
      where: {
        trialEndsAt: {
          gte: new Date(oneDayFromNow.getTime() - 24 * 60 * 60 * 1000), // Within 24h of 1 day
          lte: oneDayFromNow,
        },
        planStatus: 'trial',
        sentTrialWarning1d: false,
      },
      include: {
        users: {
          where: {
            role: 'org_admin',
          },
          take: 1,
          select: {
            email: true,
            fullName: true,
          },
        },
      },
    });

    // Send 7-day warning emails
    for (const org of orgs7Days) {
      if (org.users.length > 0 && org.trialEndsAt) {
        const admin = org.users[0];
        const daysRemaining = Math.ceil((org.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        try {
          const { sendTrialExpiryEmail } = await import('./services/emailService');
          const upgradeUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/immigration/billing`;
          
          await sendTrialExpiryEmail({
            toEmail: admin.email,
            toName: admin.fullName || 'Administrator',
            organizationName: org.name,
            daysRemaining,
            upgradeUrl,
          });

          // Mark as sent
          await prisma.organization.update({
            where: { id: org.id },
            data: { sentTrialWarning7d: true },
          });
        } catch (error) {
          console.error('Failed to send 7-day trial warning email:', error);
        }
      }
    }

    // Send 1-day warning emails
    for (const org of orgs1Day) {
      if (org.users.length > 0 && org.trialEndsAt) {
        const admin = org.users[0];
        const daysRemaining = Math.ceil((org.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        try {
          const { sendTrialExpiryEmail } = await import('./services/emailService');
          const upgradeUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/immigration/billing`;
          
          await sendTrialExpiryEmail({
            toEmail: admin.email,
            toName: admin.fullName || 'Administrator',
            organizationName: org.name,
            daysRemaining,
            upgradeUrl,
          });

          // Mark as sent
          await prisma.organization.update({
            where: { id: org.id },
            data: { sentTrialWarning1d: true },
          });
        } catch (error) {
          console.error('Failed to send 1-day trial warning email:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error checking trial expirations:', error);
  }
}

async function startServer(): Promise<void> {
  try {
    // Test database connection
    console.log('Testing database connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');

    // Start scheduled tasks
    // Check task deadlines every hour
    setInterval(checkTaskDeadlines, 60 * 60 * 1000);
    // Check trial expirations every 6 hours
    setInterval(checkTrialExpirations, 6 * 60 * 60 * 1000);
    
    // Run immediately on startup
    checkTaskDeadlines();
    checkTrialExpirations();

    console.log('✅ Scheduled tasks started');

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