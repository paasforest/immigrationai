import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { getCaseById } from '../helpers/prismaScopes';

// Default checklist items based on visa type and destination
function getDefaultChecklistItems(
  visaType: string,
  originCountry: string | null,
  destinationCountry: string | null
): Array<{ name: string; description: string | null; category: string; isRequired: boolean }> {
  const items: Array<{ name: string; description: string | null; category: string; isRequired: boolean }> = [];
  const isAfrica = originCountry && ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Ethiopia'].includes(originCountry);
  const isNigeria = originCountry === 'Nigeria';

  // UK Student Visa
  if (destinationCountry === 'United Kingdom' && visaType === 'student') {
    items.push(
      { name: 'Valid passport', description: null, category: 'identity', isRequired: true },
      { name: 'CAS number from university', description: null, category: 'educational', isRequired: true },
      { name: 'Proof of English language', description: 'IELTS, TOEFL, or equivalent', category: 'educational', isRequired: true },
      { name: 'Bank statements 28 days', description: 'Must show sufficient funds for tuition and living costs', category: 'financial', isRequired: true },
      { name: 'Academic transcripts', description: null, category: 'educational', isRequired: true },
      { name: 'ATAS certificate', description: 'If applicable for certain courses', category: 'educational', isRequired: false },
      { name: 'Tuberculosis test results', description: 'Required for certain countries', category: 'supporting', isRequired: true },
      { name: 'Parental consent', description: 'If under 18 years old', category: 'supporting', isRequired: false }
    );
  }
  // UK Skilled Worker
  else if (destinationCountry === 'United Kingdom' && visaType === 'skilled_worker') {
    items.push(
      { name: 'Valid passport', description: null, category: 'identity', isRequired: true },
      { name: 'Certificate of Sponsorship', description: null, category: 'employment', isRequired: true },
      { name: 'Proof of English language', description: null, category: 'supporting', isRequired: true },
      { name: 'Bank statements', description: null, category: 'financial', isRequired: true },
      { name: 'Qualifications certificates', description: null, category: 'educational', isRequired: true },
      { name: 'Previous visa history', description: null, category: 'travel', isRequired: false }
    );
  }
  // Canada Express Entry
  else if (destinationCountry === 'Canada' && visaType === 'skilled_worker') {
    items.push(
      { name: 'Valid passport', description: null, category: 'identity', isRequired: true },
      { name: 'Educational Credential Assessment', description: null, category: 'educational', isRequired: true },
      { name: 'IELTS or CELPIP results', description: null, category: 'educational', isRequired: true },
      { name: 'Proof of funds', description: null, category: 'financial', isRequired: true },
      { name: 'Employment records', description: null, category: 'employment', isRequired: true },
      { name: 'Police clearance certificate', description: null, category: 'supporting', isRequired: true },
      { name: 'Medical examination', description: null, category: 'supporting', isRequired: true }
    );
  }
  // Default fallback
  else {
    items.push(
      { name: 'Valid passport', description: null, category: 'identity', isRequired: true },
      { name: 'Bank statements', description: null, category: 'financial', isRequired: true },
      { name: 'Cover letter', description: null, category: 'supporting', isRequired: true },
      { name: 'Supporting documents', description: null, category: 'supporting', isRequired: true }
    );
  }

  // Africa-specific additions
  if (isAfrica) {
    items.push(
      { name: 'Birth certificate with apostille', description: null, category: 'identity', isRequired: true },
      { name: 'Sponsor letter', description: 'If applicable', category: 'financial', isRequired: false }
    );

    if (isNigeria) {
      items.push(
        { name: 'NYSC certificate', description: 'National Youth Service Corps certificate', category: 'supporting', isRequired: false },
        { name: 'Statement of account from Nigerian bank', description: null, category: 'financial', isRequired: true }
      );
    }
  }

  return items;
}

/**
 * Create a new checklist for a case
 */
export async function createChecklist(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const organizationId = req.organizationId!;
    const { caseId, name, visaType, originCountry, destinationCountry } = req.body;

    if (!caseId || !name) {
      throw new AppError('Case ID and checklist name are required', 400);
    }

    // Validate case belongs to organization
    const caseData = await getCaseById(organizationId, caseId);
    if (!caseData) {
      throw new AppError('Case not found or access denied', 404);
    }

    // Create checklist
    const checklist = await prisma.documentChecklist.create({
      data: {
        caseId,
        organizationId,
        name,
        visaType: visaType || null,
        originCountry: originCountry || null,
        destinationCountry: destinationCountry || null,
      },
    });

    // Generate default items
    const defaultItems = getDefaultChecklistItems(
      visaType || '',
      originCountry || null,
      destinationCountry || null
    );

    // Create checklist items
    const items = await Promise.all(
      defaultItems.map((item) =>
        prisma.checklistItem.create({
          data: {
            checklistId: checklist.id,
            name: item.name,
            description: item.description,
            isRequired: item.isRequired,
          },
        })
      )
    );

    // Log to audit
    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: user.id,
        action: 'checklist_created',
        resourceType: 'document_checklist',
        resourceId: checklist.id,
        metadata: {
          caseId,
          name,
          itemCount: items.length,
        },
      },
    });

    const checklistWithItems = await prisma.documentChecklist.findUnique({
      where: { id: checklist.id },
      include: {
        items: {
          include: {
            document: {
              select: {
                id: true,
                name: true,
                fileUrl: true,
              },
            },
          },
          orderBy: [
            { isCompleted: 'asc' },
            { isRequired: 'desc' },
            { createdAt: 'asc' },
          ],
        },
      },
    });

    res.status(201).json({
      success: true,
      data: checklistWithItems,
      message: 'Checklist created successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to create checklist', 500);
  }
}

/**
 * Get all checklists for a case
 */
export async function getChecklistsByCase(req: Request, res: Response): Promise<void> {
  try {
    const organizationId = req.organizationId!;
    const { caseId } = req.params;

    // Validate case belongs to organization
    const caseData = await getCaseById(organizationId, caseId);
    if (!caseData) {
      throw new AppError('Case not found or access denied', 404);
    }

    const checklists = await prisma.documentChecklist.findMany({
      where: {
        caseId,
        organizationId,
      },
      include: {
        items: {
          include: {
            document: {
              select: {
                id: true,
                name: true,
                fileUrl: true,
                status: true,
              },
            },
          },
          orderBy: [
            { isCompleted: 'asc' },
            { isRequired: 'desc' },
            { createdAt: 'asc' },
          ],
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate completion percentage for each checklist
    const checklistsWithStats = checklists.map((checklist) => {
      const totalItems = checklist.items.length;
      const completedItems = checklist.items.filter((item) => item.isCompleted).length;
      const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      return {
        ...checklist,
        completionPercentage,
        completedItems,
        totalItems,
      };
    });

    res.json({
      success: true,
      data: checklistsWithStats,
      message: 'Checklists retrieved successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to retrieve checklists', 500);
  }
}

/**
 * Update a checklist item
 */
export async function updateChecklistItem(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const organizationId = req.organizationId!;
    const { id } = req.params;
    const { isCompleted, documentId, notes } = req.body;

    // Get checklist item
    const item = await prisma.checklistItem.findUnique({
      where: { id },
      include: {
        checklist: {
          select: {
            id: true,
            organizationId: true,
            caseId: true,
          },
        },
      },
    });

    if (!item) {
      throw new AppError('Checklist item not found', 404);
    }

    // Validate checklist belongs to organization
    if (item.checklist.organizationId !== organizationId) {
      throw new AppError('Access denied', 403);
    }

    // Validate document belongs to same case if provided
    if (documentId) {
      const document = await prisma.caseDocument.findFirst({
        where: {
          id: documentId,
          caseId: item.checklist.caseId,
          organizationId,
        },
      });

      if (!document) {
        throw new AppError('Document not found or does not belong to this case', 404);
      }
    }

    // Update item
    const updateData: any = {};
    if (isCompleted !== undefined) updateData.isCompleted = isCompleted;
    if (documentId !== undefined) updateData.documentId = documentId;
    if (notes !== undefined) updateData.notes = notes;
    if (isCompleted) {
      updateData.completedAt = new Date();
    } else {
      updateData.completedAt = null;
    }

    const updatedItem = await prisma.checklistItem.update({
      where: { id },
      data: updateData,
      include: {
        document: {
          select: {
            id: true,
            name: true,
            fileUrl: true,
            status: true,
          },
        },
        checklist: {
          select: {
            id: true,
            caseId: true,
          },
        },
      },
    });

    // Calculate checklist completion percentage
    const allItems = await prisma.checklistItem.findMany({
      where: { checklistId: item.checklist.id },
    });
    const totalItems = allItems.length;
    const completedItems = allItems.filter((i) => i.isCompleted).length;
    const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    // Log to audit
    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: user.id,
        action: 'checklist_item_updated',
        resourceType: 'checklist_item',
        resourceId: id,
        metadata: {
          checklistId: item.checklist.id,
          isCompleted,
          documentId,
        },
      },
    });

    res.json({
      success: true,
      data: {
        item: updatedItem,
        checklist: {
          id: item.checklist.id,
          completionPercentage,
          completedItems,
          totalItems,
        },
      },
      message: 'Checklist item updated successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to update checklist item', 500);
  }
}

/**
 * Delete a checklist
 * Only org_admin can delete
 */
export async function deleteChecklist(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const organizationId = req.organizationId!;
    const organizationRole = req.organizationRole!;
    const { id } = req.params;

    // Only org_admin can delete
    if (organizationRole !== 'org_admin') {
      throw new AppError('Only organization administrators can delete checklists', 403);
    }

    // Get checklist
    const checklist = await prisma.documentChecklist.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!checklist) {
      throw new AppError('Checklist not found or access denied', 404);
    }

    // Delete checklist (cascade will delete items)
    await prisma.documentChecklist.delete({
      where: { id },
    });

    // Log to audit
    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: user.id,
        action: 'checklist_deleted',
        resourceType: 'document_checklist',
        resourceId: id,
        metadata: { name: checklist.name },
      },
    });    res.json({
      success: true,
      data: { id },
      message: 'Checklist deleted successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to delete checklist', 500);
  }
}