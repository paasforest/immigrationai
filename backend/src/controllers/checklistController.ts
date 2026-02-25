import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { getCaseById } from '../helpers/prismaScopes';
import { sendDocumentRequestEmail } from '../services/emailService';
import { logger } from '../utils/logger';
import { createNotification } from './notificationController';

// Default checklist items based on visa type and destination
function getDefaultChecklistItems(
  visaType: string,
  originCountry: string | null,
  destinationCountry: string | null
): Array<{ name: string; description: string | null; category: string; isRequired: boolean }> {
  const items: Array<{ name: string; description: string | null; category: string; isRequired: boolean }> = [];
  const isAfrica = originCountry && ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Ethiopia', 'Zimbabwe', 'Uganda', 'Tanzania'].includes(originCountry);
  const isNigeria = originCountry === 'Nigeria';

  // UK Student Visa
  if (destinationCountry === 'United Kingdom' && visaType === 'student') {
    items.push(
      { name: 'Valid passport', description: null, category: 'identity', isRequired: true },
      { name: 'CAS number from university', description: null, category: 'educational', isRequired: true },
      { name: 'Proof of English language proficiency', description: 'IELTS, TOEFL, or equivalent', category: 'educational', isRequired: true },
      { name: 'Bank statements - 28 consecutive days', description: 'Must show sufficient funds for tuition and living costs', category: 'financial', isRequired: true },
      { name: 'Academic transcripts and certificates', description: null, category: 'educational', isRequired: true },
      { name: 'ATAS certificate', description: 'If applicable for certain courses', category: 'educational', isRequired: false },
      { name: 'Tuberculosis test results', description: 'Required for certain countries', category: 'supporting', isRequired: false },
      { name: 'Parental consent letter', description: 'If under 18 years old', category: 'supporting', isRequired: false }
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
      { name: 'Previous visa history documents', description: null, category: 'travel', isRequired: false }
    );
  }
  // Canada Express Entry
  else if (destinationCountry === 'Canada' && visaType === 'skilled_worker') {
    items.push(
      { name: 'Valid passport', description: null, category: 'identity', isRequired: true },
      { name: 'Educational Credential Assessment (ECA)', description: null, category: 'educational', isRequired: true },
      { name: 'IELTS or CELPIP language results', description: null, category: 'educational', isRequired: true },
      { name: 'Proof of settlement funds', description: null, category: 'financial', isRequired: true },
      { name: 'Employment records and references', description: null, category: 'employment', isRequired: true },
      { name: 'Police clearance certificate', description: null, category: 'supporting', isRequired: true },
      { name: 'Medical examination results', description: null, category: 'supporting', isRequired: true }
    );
  }
  // Default fallback
  else {
    items.push(
      { name: 'Valid passport', description: null, category: 'identity', isRequired: true },
      { name: 'Bank statements 3 months', description: null, category: 'financial', isRequired: true },
      { name: 'Cover letter', description: null, category: 'supporting', isRequired: true },
      { name: 'Supporting documents', description: null, category: 'supporting', isRequired: false }
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
        { name: 'NYSC discharge or exemption certificate', description: 'National Youth Service Corps certificate', category: 'supporting', isRequired: false },
        { name: 'Statement of account from Nigerian bank', description: 'Last 6 months', category: 'financial', isRequired: true }
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
            category: item.category,
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

    res.json({
      success: true,
      data: checklistWithItems,
      message: 'Checklist created successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Failed to create checklist', { error: error.message });
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

    // Calculate completion stats for each checklist
    const checklistsWithStats = checklists.map((checklist) => {
      const totalItems = checklist.items.length;
      const completedItems = checklist.items.filter((item) => item.isCompleted).length;
      const requiredItems = checklist.items.filter((item) => item.isRequired).length;
      const completedRequiredItems = checklist.items.filter((item) => item.isRequired && item.isCompleted).length;
      const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      return {
        ...checklist,
        totalItems,
        completedItems,
        requiredItems,
        completedRequiredItems,
        completionPercentage,
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
    logger.error('Failed to retrieve checklists', { error: error.message });
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

    // Fetch the checklist item with full relations to verify access
    const checklistItem = await prisma.checklistItem.findUnique({
      where: { id },
      include: {
        checklist: {
          include: {
            case: {
              include: {
                applicant: {
                  select: {
                    id: true,
                    email: true,
                    fullName: true,
                  },
                },
              },
              select: {
                id: true,
                applicantId: true,
                title: true,
                referenceNumber: true,
                organizationId: true,
              },
            },
          },
        },
      },
    });

    if (!checklistItem) {
      throw new AppError('Checklist item not found', 404);
    }

    // Verify the case belongs to the organization
    if (checklistItem.checklist.case.organizationId !== organizationId) {
      throw new AppError('Access denied', 403);
    }

    // Validate document belongs to same case if provided
    if (documentId) {
      const document = await prisma.caseDocument.findFirst({
        where: {
          id: documentId,
          caseId: checklistItem.checklist.caseId,
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
    if (isCompleted === true) {
      updateData.completedAt = new Date();
    } else if (isCompleted === false) {
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
      where: { checklistId: checklistItem.checklist.id },
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
          checklistId: checklistItem.checklist.id,
          isCompleted,
          documentId,
        },
      },
    });

    // EMAIL HOOK: Send document request email when ALL conditions are met
    const caseData = checklistItem.checklist.case;
    const applicant = caseData.applicant;
    
    // Check all conditions for sending email
    const shouldSendEmail =
      (isCompleted === false || isCompleted === undefined) && // Item is being marked as needed (not completed)
      updatedItem.isRequired === true && // Item is required
      caseData.applicantId !== null && // Case has linked applicant
      applicant?.email && // Applicant has email address
      user.id !== caseData.applicantId; // Requester is NOT the applicant

    if (shouldSendEmail && applicant) {
      try {
        // Split fullName for email - use first part as firstName
        const firstName = applicant.fullName ? applicant.fullName.split(' ')[0] : undefined;
        const requestedBy = user.fullName || user.email;

        await sendDocumentRequestEmail({
          toEmail: applicant.email,
          toName: firstName,
          caseReference: caseData.referenceNumber,
          documentName: checklistItem.name,
          requestedBy: requestedBy,
          portalUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/portal/cases/${caseData.id}`,
        });

        logger.info('Document request email sent to applicant', {
          checklistItemId: id,
          applicantEmail: applicant.email,
        });
      } catch (emailError: any) {
        logger.error('Failed to send document request email', {
          error: emailError.message || emailError,
          checklistItemId: id,
        });
        // Do not throw — email failure must not block the API response
      }
    }

    res.json({
      success: true,
      data: {
        item: updatedItem,
        checklist: {
          id: checklistItem.checklist.id,
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
    logger.error('Failed to update checklist item', { error: error.message });
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

    // Get checklist with case to verify access
    const checklist = await prisma.documentChecklist.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        case: {
          select: {
            organizationId: true,
          },
        },
      },
    });

    if (!checklist) {
      throw new AppError('Checklist not found or access denied', 404);
    }

    // Verify case belongs to organization
    if (checklist.case.organizationId !== organizationId) {
      throw new AppError('Access denied', 403);
    }

    // Delete all checklist items first (cascade should handle this, but being explicit)
    await prisma.checklistItem.deleteMany({
      where: { checklistId: id },
    });

    // Delete checklist
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
    });

    res.json({
      success: true,
      message: 'Checklist deleted',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Failed to delete checklist', { error: error.message });
    throw new AppError(error.message || 'Failed to delete checklist', 500);
  }
}
