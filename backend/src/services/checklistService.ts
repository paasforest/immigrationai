import { databaseService } from './databaseService';
import { openaiService } from './openaiService';
import { generateChecklistPrompt } from '../prompts/checklistPrompt';
import { Checklist } from '../types';
import { AppError } from '../middleware/errorHandler';
import { query } from '../config/database';

export class ChecklistService {
  // Get or generate checklist
  async getChecklist(country: string, visaType: string, forceRefresh: boolean = false): Promise<Checklist> {
    // If force refresh, skip cache and generate new
    if (forceRefresh) {
      // Delete old checklist if exists
      await query(
        'DELETE FROM checklists WHERE country = $1 AND visa_type = $2',
        [country, visaType]
      );
      return await this.generateChecklist(country, visaType);
    }

    // Try to get from database first
    const result = await query(
      'SELECT * FROM checklists WHERE country = $1 AND visa_type = $2',
      [country, visaType]
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    }

    // If not found, generate with AI
    return await this.generateChecklist(country, visaType);
  }

  // Generate new checklist with AI
  async generateChecklist(country: string, visaType: string): Promise<Checklist> {
    const prompt = generateChecklistPrompt(country, visaType);

    // Call OpenAI
    const result = await openaiService.callOpenAI(prompt, 1500);

    // Parse JSON response
    let checklistData;
    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        checklistData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response');
      }
    } catch (error) {
      throw new AppError('Failed to parse checklist data', 500);
    }

    // Save to database (upsert - update if exists, insert if not)
    const saveResult = await query(
      `INSERT INTO checklists (country, visa_type, requirements, last_updated)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (country, visa_type)
       DO UPDATE SET requirements = $3, last_updated = NOW()
       RETURNING *`,
      [country, visaType, JSON.stringify(checklistData.requirements)]
    );

    return saveResult.rows[0];
  }

  // Get all available checklists
  async getAllChecklists(page: number = 1, limit: number = 20): Promise<{
    checklists: Checklist[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await query('SELECT COUNT(*) FROM checklists');
    const total = parseInt(countResult.rows[0].count);

    // Get checklists
    const result = await query(
      `SELECT country, visa_type, last_updated
       FROM checklists
       ORDER BY country, visa_type
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return {
      checklists: result.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export const checklistService = new ChecklistService();


