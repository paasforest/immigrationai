import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

/**
 * Scoped query helpers that automatically inject organizationId
 * Prevents forgetting to filter by organization in queries
 */

// ============================================
// CASE HELPERS
// ============================================

export async function getCasesByOrg(
  orgId: string,
  filters?: {
    status?: string;
    assignedProfessionalId?: string;
    applicantId?: string;
    visaType?: string;
    search?: string;
  }
) {
  const where: Prisma.CaseWhereInput = {
    organizationId: orgId,
    ...(filters?.status && { status: filters.status }),
    ...(filters?.assignedProfessionalId && { assignedProfessionalId: filters.assignedProfessionalId }),
    ...(filters?.applicantId && { applicantId: filters.applicantId }),
    ...(filters?.visaType && { visaType: filters.visaType }),
    ...(filters?.search && {
      OR: [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { referenceNumber: { contains: filters.search, mode: 'insensitive' } },
        { notes: { contains: filters.search, mode: 'insensitive' } },
      ],
    }),
  };

  return prisma.case.findMany({
    where,
    include: {
      assignedProfessional: {
        select: { id: true, fullName: true, email: true },
      },
      applicant: {
        select: { id: true, fullName: true, email: true },
      },
      _count: {
        select: {
          caseDocuments: true,
          tasks: true,
          messages: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getCaseById(orgId: string, caseId: string) {
  return prisma.case.findFirst({
    where: {
      id: caseId,
      organizationId: orgId, // Security: Only return if belongs to org
    },
    include: {
      organization: {
        select: { id: true, name: true, slug: true },
      },
      assignedProfessional: {
        select: { id: true, fullName: true, email: true, phone: true },
      },
      applicant: {
        select: { id: true, fullName: true, email: true, phone: true },
      },
      caseDocuments: {
        orderBy: { createdAt: 'desc' },
      },
      tasks: {
        include: {
          assignedTo: {
            select: { id: true, fullName: true, email: true },
          },
          createdBy: {
            select: { id: true, fullName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      messages: {
        include: {
          sender: {
            select: { id: true, fullName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      checklists: {
        include: {
          items: true,
        },
      },
    },
  });
}

export async function createCase(orgId: string, data: Prisma.CaseCreateInput) {
  // Ensure organizationId is set
  const caseData: Prisma.CaseCreateInput = {
    ...data,
    organization: {
      connect: { id: orgId },
    },
  };

  return prisma.case.create({
    data: caseData,
    include: {
      organization: true,
      assignedProfessional: true,
      applicant: true,
    },
  });
}

export async function updateCase(
  orgId: string,
  caseId: string,
  data: Prisma.CaseUpdateInput
) {
  // First verify case belongs to org
  const existingCase = await prisma.case.findFirst({
    where: {
      id: caseId,
      organizationId: orgId,
    },
  });

  if (!existingCase) {
    throw new Error('Case not found or access denied');
  }

  return prisma.case.update({
    where: { id: caseId },
    data,
    include: {
      organization: true,
      assignedProfessional: true,
      applicant: true,
    },
  });
}

export async function deleteCase(orgId: string, caseId: string) {
  // First verify case belongs to org
  const existingCase = await prisma.case.findFirst({
    where: {
      id: caseId,
      organizationId: orgId,
    },
  });

  if (!existingCase) {
    throw new Error('Case not found or access denied');
  }

  return prisma.case.delete({
    where: { id: caseId },
  });
}

// ============================================
// DOCUMENT HELPERS
// ============================================

export async function getDocumentsByCase(orgId: string, caseId: string) {
  return prisma.caseDocument.findMany({
    where: {
      caseId,
      organizationId: orgId, // Security: Only return if belongs to org
    },
    include: {
      uploadedBy: {
        select: { id: true, fullName: true, email: true },
      },
      checklistItems: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

// ============================================
// TASK HELPERS
// ============================================

export async function getTasksByCase(orgId: string, caseId: string) {
  return prisma.task.findMany({
    where: {
      caseId,
      organizationId: orgId, // Security: Only return if belongs to org
    },
    include: {
      assignedTo: {
        select: { id: true, fullName: true, email: true },
      },
      createdBy: {
        select: { id: true, fullName: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// ============================================
// MESSAGE HELPERS
// ============================================

export async function getMessagesByCase(orgId: string, caseId: string) {
  return prisma.message.findMany({
    where: {
      caseId,
      organizationId: orgId, // Security: Only return if belongs to org
    },
    include: {
      sender: {
        select: { id: true, fullName: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// ============================================
// USER HELPERS
// ============================================

export async function getUsersByOrg(orgId: string) {
  return prisma.user.findMany({
    where: {
      organizationId: orgId,
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      avatarUrl: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}
