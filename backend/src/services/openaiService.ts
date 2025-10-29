import { openai, GPT_MODEL, MAX_TOKENS, TEMPERATURE, PRICING } from '../config/openai';
import { databaseService } from './databaseService';
import { AppError } from '../middleware/errorHandler';
import { query } from '../config/database';
import { logger } from '../utils/logger';
import { calculateOpenAICost } from '../utils/helpers';

export class OpenAIService {
  // Call OpenAI API with error handling
  async callOpenAI(
    prompt: string,
    maxTokens: number = MAX_TOKENS,
    temperature: number = TEMPERATURE,
    model: string = GPT_MODEL,
    userId?: string,
    feature: string = 'openai_call'
  ): Promise<{ content: string; tokensUsed: number; cost: number }> {
    try {
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional immigration consultant and expert writer.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: maxTokens,
        temperature,
      });

      const content = completion.choices[0]?.message?.content || '';
      const tokensUsed = completion.usage?.total_tokens || 0;
      const cost = calculateOpenAICost(tokensUsed, model);

      // Track usage in database if userId provided
      if (userId) {
        try {
          await query(
            'INSERT INTO api_usage (user_id, feature, tokens_used, cost_usd, success) VALUES ($1, $2, $3, $4, $5)',
            [userId, feature, tokensUsed, cost, true]
          );
        } catch (error) {
          logger.error('Failed to track API usage:', error);
        }
      }

      logger.info('OpenAI API call successful', {
        model,
        tokensUsed,
        cost,
        userId,
        feature,
      });

      return {
        content,
        tokensUsed,
        cost,
      };
    } catch (error: any) {
      logger.error('OpenAI API call failed', { error: error.message });
      
      if (error.status === 429) {
        throw new AppError('Rate limit exceeded. Please try again later.', 429);
      }
      
      if (error.status === 401) {
        throw new AppError('OpenAI API authentication failed', 500);
      }
      
      throw new AppError('Failed to generate content. Please try again.', 500);
    }
  }

  // Log API usage to database
  async logUsage(
    userId: string,
    feature: string,
    tokensUsed: number,
    cost: number,
    success: boolean = true
  ): Promise<void> {
    try {
      await query(
        `INSERT INTO api_usage (user_id, feature, tokens_used, cost_usd, success, timestamp)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [userId, feature, tokensUsed, cost, success]
      );
    } catch (error) {
      logger.error('Failed to log API usage', { error, userId, feature });
    }
  }

  // Get user's monthly usage
  async getUserMonthlyUsage(userId: string): Promise<{
    documents: number;
    tokensUsed: number;
    costUsd: number;
  }> {
    const result = await query(
      `SELECT 
         COUNT(*) as documents,
         COALESCE(SUM(tokens_used), 0) as tokens_used,
         COALESCE(SUM(cost_usd), 0) as cost_usd
       FROM api_usage
       WHERE user_id = $1 
       AND timestamp >= date_trunc('month', CURRENT_DATE)
       AND success = true`,
      [userId]
    );

    return {
      documents: parseInt(result.rows[0].documents),
      tokensUsed: parseInt(result.rows[0].tokens_used),
      costUsd: parseFloat(result.rows[0].cost_usd),
    };
  }

  // Check if user has exceeded limits
  async checkUserLimits(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    // Get user's plan
    const userResult = await query(
      'SELECT subscription_plan FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    const plan = userResult.rows[0].subscription_plan;

    // Get monthly usage
    const usage = await this.getUserMonthlyUsage(userId);

    // Check limits based on plan - Updated to match frontend plans
    const limits: any = {
      starter: { documents: 3, tokens: 10000 },
      entry: { documents: 5, tokens: 25000 },
      professional: { documents: -1, tokens: 500000 }, // -1 means unlimited
      enterprise: { documents: -1, tokens: -1 },
      // Legacy plans for backward compatibility
      free: { documents: 3, tokens: 10000 },
      pro: { documents: -1, tokens: 500000 },
    };

    const planLimits = limits[plan] || limits.free;

    if (planLimits.documents !== -1 && usage.documents >= planLimits.documents) {
      return {
        allowed: false,
        reason: `Monthly document limit (${planLimits.documents}) exceeded. Please upgrade your plan.`,
      };
    }

    if (planLimits.tokens !== -1 && usage.tokensUsed >= planLimits.tokens) {
      return {
        allowed: false,
        reason: `Monthly token limit (${planLimits.tokens}) exceeded. Please upgrade your plan.`,
      };
    }

    return { allowed: true };
  }
}

export const openaiService = new OpenAIService();


