import prisma from '../config/prisma';

export const databaseService = {
  // Users
  createUser: async (email: string, passwordHash: string, fullName: string) => {
    return prisma.user.create({
      data: { 
        email, 
        passwordHash, 
        fullName 
      }
    });
  },

  getUserByEmail: async (email: string) => {
    return prisma.user.findUnique({ 
      where: { email } 
    });
  },

  getUserById: async (id: string) => {
    return prisma.user.findUnique({ 
      where: { id } 
    });
  },

  updateUser: async (id: string, data: any) => {
    return prisma.user.update({
      where: { id },
      data
    });
  },

  // Documents
  createDocument: async (userId: string, type: string, title: string, content: string) => {
    return prisma.document.create({
      data: {
        userId,
        type,
        title,
        generatedOutput: content,
        status: 'draft'
      }
    });
  },

  getUserDocuments: async (userId: string) => {
    return prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  },

  getDocumentById: async (id: string) => {
    return prisma.document.findUnique({
      where: { id }
    });
  },

  updateDocument: async (id: string, data: any) => {
    return prisma.document.update({
      where: { id },
      data
    });
  },

  // API Usage
  logApiUsage: async (userId: string, feature: string, tokensUsed: number, costUsd: number) => {
    return prisma.apiUsage.create({
      data: { 
        userId, 
        feature, 
        tokensUsed, 
        costUsd 
      }
    });
  },

  getUserUsage: async (userId: string) => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);

    return prisma.apiUsage.aggregate({
      where: {
        userId,
        timestamp: { gte: startOfMonth }
      },
      _sum: { tokensUsed: true, costUsd: true },
      _count: true
    });
  },

  // Refresh Tokens
  createRefreshToken: async (userId: string, token: string, expiresAt: Date) => {
    return prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt
      }
    });
  },

  getRefreshToken: async (token: string) => {
    return prisma.refreshToken.findFirst({
      where: { token },
      include: { user: true }
    });
  },

  deleteRefreshToken: async (token: string) => {
    return prisma.refreshToken.deleteMany({
      where: { token }
    });
  },

  deleteUserRefreshTokens: async (userId: string) => {
    return prisma.refreshToken.deleteMany({
      where: { userId }
    });
  },

  // Password Reset
  createPasswordResetToken: async (userId: string, token: string, expiresAt: Date) => {
    return prisma.passwordResetToken.create({
      data: {
        userId,
        token,
        expiresAt
      }
    });
  },

  getPasswordResetToken: async (token: string) => {
    return prisma.passwordResetToken.findFirst({
      where: { token },
      include: { user: true }
    });
  },

  deletePasswordResetToken: async (token: string) => {
    return prisma.passwordResetToken.deleteMany({
      where: { token }
    });
  },

  // Subscriptions
  createSubscription: async (userId: string, plan: string, status: string, stripeCustomerId?: string) => {
    return prisma.subscription.create({
      data: {
        userId,
        plan,
        status,
        stripeCustomerId
      }
    });
  },

  getUserSubscription: async (userId: string) => {
    return prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  },

  updateSubscription: async (id: string, data: any) => {
    return prisma.subscription.update({
      where: { id },
      data
    });
  },

  // Checklists
  createChecklist: async (userId: string, country: string, visaType: string, items: any[]) => {
    return prisma.checklist.create({
      data: {
        country,
        visaType,
        requirements: items as any
      }
    });
  },

  getUserChecklists: async (userId: string) => {
    return prisma.checklist.findMany({
      where: {},
      orderBy: { lastUpdated: 'desc' as const }
    });
  },

  updateChecklist: async (id: string, data: any) => {
    return prisma.checklist.update({
      where: { id },
      data
    });
  }
};

