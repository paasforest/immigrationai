import { PrismaClient } from '@prisma/client';

// Global variable to store Prisma instance
declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error'],
    errorFormat: 'pretty'
  });
} else {
  // In development, use global variable to prevent multiple instances
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['warn', 'error'],
      errorFormat: 'pretty'
    });
  }
  prisma = global.prisma;
}

export default prisma;