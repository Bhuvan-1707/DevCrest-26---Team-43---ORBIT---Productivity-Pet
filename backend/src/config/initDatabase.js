import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Safe Database Schema Initialization Mechanism
 * Executes DDL schema setup using CREATE TABLE IF NOT EXISTS.
 * Preserves existing database records and prevents accidental data destruction.
 */
export async function initDatabase() {
  const schemaPath = path.join(__dirname, '../../database/schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    console.error(`[ORBIT Database Init Error] Schema file missing at: ${schemaPath}`);
    return false;
  }

  let conn;
  try {
    const rawSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Split SQL file into discrete statements while ignoring comments and empty lines
    const sqlStatements = rawSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => {
        if (!stmt) return false;
        // Ignore single line comments or empty lines
        if (stmt.startsWith('--') && !stmt.includes('\n')) return false;
        return true;
      });

    conn = await pool.getConnection();

    for (const stmt of sqlStatements) {
      if (stmt) {
        await conn.query(stmt);
      }
    }

    console.log('[ORBIT Database] Database schema initialized successfully (CREATE IF NOT EXISTS)');
    return true;
  } catch (err) {
    console.error('[ORBIT Database Init Error] Schema initialization failed:', err.message || err);
    return false;
  } finally {
    if (conn) conn.release();
  }
}

export default initDatabase;
