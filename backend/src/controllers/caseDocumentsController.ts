import { Request, Response } from 'express';
import { documentService } from '../services/documentService';
import { visaRulesService } from '../services/visaRulesService';
import { AppError } from '../middleware/errorHandler';
import { query } from '../config/database';

/**
 * Generate document for a specific case
 */
export async function generateCaseDocument(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const { caseId, documentType, inputData } = req.body;

    if (!caseId || !documentType) {
      throw new AppError('Case ID and document type are required', 400);
    }

    // Verify user has access to the case
    const caseAccess = await query(
      `SELECT c.id, c.applicant_name, c.destination_country, c.visa_type, c.organization_id
       FROM cases c
       WHERE c.id = $1 
       AND (c.assigned_to = $2 OR c.organization_id = $3)`,
      [caseId, user.id, user.organizationId]
    );

    if (caseAccess.rows.length === 0) {
      throw new AppError('Case not found or access denied', 404);
    }

    const caseData = caseAccess.rows[0];

    // Add case context to input data
    const enhancedInputData = {
      ...inputData,
      caseId,
      fullName: inputData.fullName || caseData.applicant_name,
      targetCountry: inputData.targetCountry || caseData.destination_country,
    };

    let result;
    switch (documentType) {
      case 'sop':
        result = await documentService.generateSOP(user.id, enhancedInputData);
        break;
      case 'cover_letter':
        result = await documentService.generateCoverLetter(user.id, enhancedInputData);
        break;
      default:
        throw new AppError('Invalid document type', 400);
    }

    // Link document to case
    await query(
      `UPDATE documents SET case_id = $1 WHERE id = $2`,
      [caseId, result.id]
    );

    res.json({
      success: true,
      data: result,
      message: 'Document generated and linked to case',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to generate document', 500);
  }
}

/**
 * Get document checklist for a case
 */
export async function getCaseDocumentChecklist(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const { caseId } = req.params;

    if (!caseId) {
      throw new AppError('Case ID is required', 400);
    }

    // Verify user has access to the case
    const caseAccess = await query(
      `SELECT c.id, c.destination_country, c.visa_type, c.applicant_name
       FROM cases c
       WHERE c.id = $1 
       AND (c.assigned_to = $2 OR c.organization_id = $3)`,
      [caseId, user.id, user.organizationId]
    );

    if (caseAccess.rows.length === 0) {
      throw new AppError('Case not found or access denied', 404);
    }

    const caseData = caseAccess.rows[0];

    // Get document checklist based on visa type
    const checklist = visaRulesService.getDocumentChecklist(
      caseData.visa_type || 'uk_skilled_worker',
      caseData.destination_country
    );

    // Get existing documents for this case
    const existingDocs = await query(
      `SELECT d.id, d.type, d.title, d.status, d.source, d.created_at
       FROM documents d
       WHERE d.case_id = $1
       ORDER BY d.created_at DESC`,
      [caseId]
    );

    // Get uploaded case documents
    const uploadedDocs = await query(
      `SELECT cd.id, cd.name, cd.type, cd.status, cd.uploaded_at
       FROM case_documents cd
       WHERE cd.case_id = $1
       ORDER BY cd.uploaded_at DESC`,
      [caseId]
    );

    res.json({
      success: true,
      data: {
        checklist,
        existingDocuments: existingDocs.rows,
        uploadedDocuments: uploadedDocs.rows,
        case: {
          id: caseData.id,
          applicantName: caseData.applicant_name,
          destinationCountry: caseData.destination_country,
          visaType: caseData.visa_type,
        },
      },
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to get checklist', 500);
  }
}

/**
 * Get case documents (both generated and uploaded)
 */
export async function getCaseDocuments(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const { caseId } = req.params;
    const { source } = req.query; // 'client' | 'system' | 'all'

    if (!caseId) {
      throw new AppError('Case ID is required', 400);
    }

    // Verify user has access to the case
    const caseAccess = await query(
      `SELECT c.id, c.organization_id
       FROM cases c
       WHERE c.id = $1 
       AND (c.assigned_to = $2 OR c.organization_id = $3)`,
      [caseId, user.id, user.organizationId]
    );

    if (caseAccess.rows.length === 0) {
      throw new AppError('Case not found or access denied', 404);
    }

    let documents = [];

    // Get generated documents
    if (!source || source === 'system' || source === 'all') {
      const generatedDocs = await query(
        `SELECT d.id, d.type, d.title, d.status, d.source, d.created_at, d.updated_at
         FROM documents d
         WHERE d.case_id = $1
         ORDER BY d.created_at DESC`,
        [caseId]
      );
      documents.push(...generatedDocs.rows.map(doc => ({ ...doc, category: 'system' })));
    }

    // Get uploaded documents
    if (!source || source === 'client' || source === 'all') {
      const uploadedDocs = await query(
        `SELECT cd.id, cd.name as title, cd.type, cd.status, cd.uploaded_at as created_at, cd.updated_at
         FROM case_documents cd
         WHERE cd.case_id = $1
         ORDER BY cd.uploaded_at DESC`,
        [caseId]
      );
      documents.push(...uploadedDocs.rows.map(doc => ({ ...doc, category: 'client', source: 'client' })));
    }

    // Sort by created date
    documents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json({
      success: true,
      data: {
        documents,
      },
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to get documents', 500);
  }
}

/**
 * Generate eligibility report for a case
 */
export async function generateCaseEligibilityReport(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const { caseId } = req.params;

    if (!caseId) {
      throw new AppError('Case ID is required', 400);
    }

    // Verify user has access to the case
    const caseAccess = await query(
      `SELECT c.id, c.destination_country, c.visa_type, c.applicant_name, c.applicant_country
       FROM cases c
       WHERE c.id = $1 
       AND (c.assigned_to = $2 OR c.organization_id = $3)`,
      [caseId, user.id, user.organizationId]
    );

    if (caseAccess.rows.length === 0) {
      throw new AppError('Case not found or access denied', 404);
    }

    const caseData = caseAccess.rows[0];

    // Generate eligibility report based on case data
    const checklist = visaRulesService.getDocumentChecklist(
      caseData.visa_type || 'uk_skilled_worker',
      caseData.destination_country
    );

    const report = {
      caseId,
      applicantName: caseData.applicant_name,
      destinationCountry: caseData.destination_country,
      visaType: caseData.visa_type,
      keyRequirements: checklist.keyRequirements,
      processingTime: checklist.processingTime,
      requiredDocuments: {
        clientUploads: checklist.clientUploads,
        systemGenerated: checklist.systemGenerated,
      },
      recommendations: [
        'Start gathering required documents early',
        'Ensure all translations are certified if required',
        'Keep copies of all submitted documents',
        'Consider premium processing if time-sensitive',
      ],
      nextSteps: [
        'Review document checklist',
        'Upload required documents',
        'Generate system documents',
        'Submit application',
      ],
    };

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to generate eligibility report', 500);
  }
}
