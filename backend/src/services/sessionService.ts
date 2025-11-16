import { query } from '../config/database';

export interface SessionEventInput {
  sessionId?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  landingPage?: string;
  userAgent?: string;
  ipAddress?: string;
}

async function ensureTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS marketing_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id VARCHAR(100),
      utm_source VARCHAR(100),
      utm_medium VARCHAR(100),
      utm_campaign VARCHAR(100),
      utm_content VARCHAR(255),
      utm_term VARCHAR(255),
      referrer VARCHAR(500),
      landing_page VARCHAR(500),
      user_agent TEXT,
      ip_address VARCHAR(45),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_marketing_sessions_created_at ON marketing_sessions(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_marketing_sessions_source ON marketing_sessions(utm_source);
    CREATE INDEX IF NOT EXISTS idx_marketing_sessions_campaign ON marketing_sessions(utm_campaign);
    CREATE INDEX IF NOT EXISTS idx_marketing_sessions_session_id ON marketing_sessions(session_id);
  `);
}

export async function recordSessionEvent(input: SessionEventInput): Promise<void> {
  await ensureTable();
  await query(
    `
      INSERT INTO marketing_sessions
        (session_id, utm_source, utm_medium, utm_campaign, utm_content, utm_term, referrer, landing_page, user_agent, ip_address)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `,
    [
      input.sessionId || null,
      input.utm_source || null,
      input.utm_medium || null,
      input.utm_campaign || null,
      input.utm_content || null,
      input.utm_term || null,
      input.referrer || null,
      input.landingPage || null,
      input.userAgent || null,
      input.ipAddress || null,
    ]
  );
}

export async function getRecentSessions(limit = 50): Promise<any[]> {
  await ensureTable();
  const res = await query(
    `SELECT * FROM marketing_sessions ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
  return res.rows;
}

export async function getSessionStats(): Promise<{
  totalSessions: number;
  bySource: Array<{ utm_source: string | null; count: number }>;
  byCampaign: Array<{ utm_campaign: string | null; count: number }>;
}> {
  await ensureTable();
  const total = await query(`SELECT COUNT(*)::int AS count FROM marketing_sessions`);
  const bySource = await query(
    `SELECT COALESCE(utm_source, 'direct') AS utm_source, COUNT(*)::int AS count
     FROM marketing_sessions
     GROUP BY COALESCE(utm_source, 'direct')
     ORDER BY count DESC`
  );
  const byCampaign = await query(
    `SELECT COALESCE(utm_campaign, 'none') AS utm_campaign, COUNT(*)::int AS count
     FROM marketing_sessions
     GROUP BY COALESCE(utm_campaign, 'none')
     ORDER BY count DESC`
  );
  return {
    totalSessions: total.rows[0]?.count || 0,
    bySource: bySource.rows,
    byCampaign: byCampaign.rows,
  };
}


