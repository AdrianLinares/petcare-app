import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  try {
    console.log('Starting database migration...');

    const schemaPath = join(__dirname, '../../database/schema.sql');
    const schemaSql = readFileSync(schemaPath, 'utf8');

    await pool.query(schemaSql);

    console.log('✓ Database migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
