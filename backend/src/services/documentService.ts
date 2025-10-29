import { databaseService } from './databaseService';
import { Document } from '../types';
import { AppError } from '../middleware/errorHandler';
import { query } from '../config/database';
import { openaiService } from './openaiService';
import { generateSOPPrompt } from '../prompts/sopPrompt';
import { generateCoverLetterPrompt } from '../prompts/coverLetterPrompt';
import { generateReviewerPrompt } from '../prompts/reviewerPrompt';
import {
  SOPInputData,
  CoverLetterInputData,
  ReviewSOPInputData,
} from '../types';

export class DocumentService {
  // Generate SOP
  async generateSOP(userId: string, inputData: SOPInputData): Promise<{
    id: string;
    content: string;
    tokensUsed: number;
  }> {
    // Check user limits
    const limitsCheck = await openaiService.checkUserLimits(userId);
    if (!limitsCheck.allowed) {
      throw new AppError(limitsCheck.reason || 'Limit exceeded', 403);
    }

    // Generate prompt
    const prompt = generateSOPPrompt(inputData);

    // Call OpenAI
    const result = await openaiService.callOpenAI(prompt);

    // Save to database
    const saveResult = await query(
      `INSERT INTO documents (user_id, type, title, input_data, generated_output, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        userId,
        'sop',
        `SOP - ${inputData.targetCountry}`,
        JSON.stringify(inputData),
        result.content,
        'completed',
      ]
    );

    const documentId = saveResult.rows[0].id;

    // Log usage
    await openaiService.logUsage(userId, 'sop_generation', result.tokensUsed, result.cost);

    return {
      id: documentId,
      content: result.content,
      tokensUsed: result.tokensUsed,
    };
  }

  // Generate Cover Letter
  async generateCoverLetter(userId: string, inputData: CoverLetterInputData): Promise<{
    id: string;
    content: string;
    tokensUsed: number;
  }> {
    // Check user limits
    const limitsCheck = await openaiService.checkUserLimits(userId);
    if (!limitsCheck.allowed) {
      throw new AppError(limitsCheck.reason || 'Limit exceeded', 403);
    }

    // Generate prompt
    const prompt = generateCoverLetterPrompt(inputData);

    // Call OpenAI
    const result = await openaiService.callOpenAI(prompt);

    // Save to database
    const saveResult = await query(
      `INSERT INTO documents (user_id, type, title, input_data, generated_output, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        userId,
        'cover_letter',
        `Cover Letter - ${inputData.targetCountry}`,
        JSON.stringify(inputData),
        result.content,
        'completed',
      ]
    );

    const documentId = saveResult.rows[0].id;

    // Log usage
    await openaiService.logUsage(userId, 'cover_letter_generation', result.tokensUsed, result.cost);

    return {
      id: documentId,
      content: result.content,
      tokensUsed: result.tokensUsed,
    };
  }

  // Review SOP
  async reviewSOP(userId: string, inputData: ReviewSOPInputData): Promise<any> {
    // Check user limits
    const limitsCheck = await openaiService.checkUserLimits(userId);
    if (!limitsCheck.allowed) {
      throw new AppError(limitsCheck.reason || 'Limit exceeded', 403);
    }

    // Generate prompt
    const prompt = generateReviewerPrompt(inputData);

    // Call OpenAI
    const result = await openaiService.callOpenAI(prompt, 1500);

    // Parse JSON response
    let reviewData;
    try {
      // Try to extract JSON from response
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        reviewData = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON, create structured response from text
        reviewData = {
          overallScore: 75,
          suggestions: result.content.split('\n').filter(line => line.trim()),
          summary: result.content,
        };
      }
    } catch (error) {
      reviewData = {
        overallScore: 75,
        suggestions: [result.content],
        summary: result.content,
      };
    }

    // Save review to database
    const saveResult = await query(
      `INSERT INTO documents (user_id, type, title, input_data, generated_output, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        userId,
        'review',
        'SOP Review',
        JSON.stringify(inputData),
        JSON.stringify(reviewData),
        'completed',
      ]
    );

    // Log usage
    await openaiService.logUsage(userId, 'sop_review', result.tokensUsed, result.cost);

    return reviewData;
  }

  // Get user's documents (with pagination)
  async getUserDocuments(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ documents: Document[]; total: number; page: number; totalPages: number }> {
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) FROM documents WHERE user_id = $1',
      [userId]
    );
    const total = parseInt(countResult.rows[0].count);

    // Get documents
    const result = await query(
      `SELECT id, user_id, type, title, status, created_at, updated_at
       FROM documents
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return {
      documents: result.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get single document
  async getDocument(userId: string, documentId: string): Promise<Document> {
    const result = await query(
      'SELECT * FROM documents WHERE id = $1 AND user_id = $2',
      [documentId, userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Document not found', 404);
    }

    return result.rows[0];
  }

  // Delete document
  async deleteDocument(userId: string, documentId: string): Promise<void> {
    const result = await query(
      'DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING id',
      [documentId, userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Document not found', 404);
    }
  }
}

export const documentService = new DocumentService();


