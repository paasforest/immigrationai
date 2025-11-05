import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export interface TrackingData {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referrer?: string;
  landingPage?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class TrackingService {
  /**
   * Save UTM tracking data for a user
   */
  async saveUserTracking(userId: string, trackingData: TrackingData): Promise<void> {
    try {
      // Check if tracking already exists for this user
      const existingResult = await query(
        'SELECT id FROM user_tracking WHERE user_id = $1',
        [userId]
      );

      if (existingResult.rows.length > 0) {
        // Update existing tracking
        await query(
          `UPDATE user_tracking 
           SET utm_source = $2, 
               utm_medium = $3, 
               utm_campaign = $4, 
               utm_content = $5, 
               utm_term = $6, 
               referrer = $7, 
               landing_page = $8, 
               session_id = $9, 
               ip_address = $10, 
               user_agent = $11,
               updated_at = NOW()
           WHERE user_id = $1`,
          [
            userId,
            trackingData.utmSource,
            trackingData.utmMedium,
            trackingData.utmCampaign,
            trackingData.utmContent,
            trackingData.utmTerm,
            trackingData.referrer,
            trackingData.landingPage,
            trackingData.sessionId,
            trackingData.ipAddress,
            trackingData.userAgent,
          ]
        );
      } else {
        // Insert new tracking
        await query(
          `INSERT INTO user_tracking 
           (user_id, utm_source, utm_medium, utm_campaign, utm_content, utm_term, 
            referrer, landing_page, session_id, ip_address, user_agent)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            userId,
            trackingData.utmSource,
            trackingData.utmMedium,
            trackingData.utmCampaign,
            trackingData.utmContent,
            trackingData.utmTerm,
            trackingData.referrer,
            trackingData.landingPage,
            trackingData.sessionId,
            trackingData.ipAddress,
            trackingData.userAgent,
          ]
        );
      }

      console.log(`📊 Tracking data saved for user ${userId}:`, {
        source: trackingData.utmSource,
        campaign: trackingData.utmCampaign,
      });
    } catch (error) {
      console.error('Failed to save tracking data:', error);
      // Don't throw error - tracking failure shouldn't break signup
    }
  }

  /**
   * Get tracking data for a user
   */
  async getUserTracking(userId: string): Promise<TrackingData | null> {
    try {
      const result = await query(
        `SELECT utm_source, utm_medium, utm_campaign, utm_content, utm_term, 
                referrer, landing_page, session_id, ip_address, user_agent, 
                converted, converted_at, created_at
         FROM user_tracking 
         WHERE user_id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        utmSource: row.utm_source,
        utmMedium: row.utm_medium,
        utmCampaign: row.utm_campaign,
        utmContent: row.utm_content,
        utmTerm: row.utm_term,
        referrer: row.referrer,
        landingPage: row.landing_page,
        sessionId: row.session_id,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
      };
    } catch (error) {
      console.error('Failed to get tracking data:', error);
      return null;
    }
  }

  /**
   * Mark user as converted (e.g., upgraded to paid plan)
   */
  async markUserConverted(userId: string): Promise<void> {
    try {
      await query(
        `UPDATE user_tracking 
         SET converted = true, 
             converted_at = NOW(),
             updated_at = NOW()
         WHERE user_id = $1`,
        [userId]
      );

      console.log(`💰 User ${userId} marked as converted`);
    } catch (error) {
      console.error('Failed to mark user as converted:', error);
    }
  }

  /**
   * Get tracking analytics (for admin dashboard)
   */
  async getTrackingAnalytics(startDate?: Date, endDate?: Date) {
    try {
      const dateFilter = startDate && endDate
        ? `AND created_at BETWEEN $1 AND $2`
        : '';

      const params = startDate && endDate ? [startDate, endDate] : [];

      // Get signups by source
      const sourceResult = await query(
        `SELECT 
           utm_source, 
           COUNT(*) as signups,
           SUM(CASE WHEN converted THEN 1 ELSE 0 END) as conversions,
           ROUND(SUM(CASE WHEN converted THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric * 100, 2) as conversion_rate
         FROM user_tracking 
         WHERE utm_source IS NOT NULL ${dateFilter}
         GROUP BY utm_source
         ORDER BY signups DESC`,
        params
      );

      // Get signups by campaign
      const campaignResult = await query(
        `SELECT 
           utm_campaign, 
           COUNT(*) as signups,
           SUM(CASE WHEN converted THEN 1 ELSE 0 END) as conversions
         FROM user_tracking 
         WHERE utm_campaign IS NOT NULL ${dateFilter}
         GROUP BY utm_campaign
         ORDER BY signups DESC`,
        params
      );

      // Get total stats
      const totalResult = await query(
        `SELECT 
           COUNT(*) as total_tracked_users,
           SUM(CASE WHEN converted THEN 1 ELSE 0 END) as total_conversions,
           COUNT(CASE WHEN utm_source = 'proconnectsa' THEN 1 END) as proconnectsa_signups,
           SUM(CASE WHEN utm_source = 'proconnectsa' AND converted THEN 1 ELSE 0 END) as proconnectsa_conversions
         FROM user_tracking
         WHERE 1=1 ${dateFilter}`,
        params
      );

      return {
        bySource: sourceResult.rows,
        byCampaign: campaignResult.rows,
        totals: totalResult.rows[0],
      };
    } catch (error) {
      console.error('Failed to get tracking analytics:', error);
      throw new AppError('Failed to retrieve tracking analytics', 500);
    }
  }
}

export const trackingService = new TrackingService();

