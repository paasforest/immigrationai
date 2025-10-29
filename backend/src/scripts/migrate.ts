import fs from 'fs';
import path from 'path';
import { pool, query } from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

const MIGRATIONS_DIR = path.join(__dirname, '../../migrations');

async function runMigrations() {
  try {
    console.log('🔄 Starting database migrations...\n');

    // Create migrations tracking table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get all migration files
    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    console.log(`Found ${files.length} migration files\n`);

    // Get already executed migrations
    const result = await query('SELECT filename FROM migrations');
    const executedMigrations = new Set(result.rows.map((row) => row.filename));

    // Run pending migrations
    for (const file of files) {
      if (executedMigrations.has(file)) {
        console.log(`⏭️  Skipping ${file} (already executed)`);
        continue;
      }

      console.log(`⚙️  Running ${file}...`);

      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      try {
        // Execute migration
        await query(sql);

        // Record migration
        await query('INSERT INTO migrations (filename) VALUES ($1)', [file]);

        console.log(`✅ Completed ${file}\n`);
      } catch (error: any) {
        console.error(`❌ Failed to run ${file}:`, error.message);
        throw error;
      }
    }

    console.log('✨ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();


