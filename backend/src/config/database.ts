import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000, // Increased from 2000ms to 30 seconds
});

// Generic query function
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // SECURITY: Only log query details in development (prevents data leakage)
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text, duration, rows: res.rowCount });
    } else {
      // In production, only log performance metrics, not sensitive query data
      console.log('Query executed', { duration, rows: res.rowCount });
    }
    
    return res;
  } catch (error) {
    // SECURITY: Don't log query text in production (may contain sensitive data)
    if (process.env.NODE_ENV === 'development') {
      console.error('Database query error:', error);
    } else {
      console.error('Database query failed');
    }
    throw error;
  }
};

// Get a client from the pool
export const getClient = async () => {
  return await pool.connect();
};

// Close the pool
export const closePool = async () => {
  await pool.end();
};

export { pool };



