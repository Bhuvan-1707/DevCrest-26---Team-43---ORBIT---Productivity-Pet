import pool from './database.js';

export async function truncateDatabase() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('[ORBIT Database] Truncating all database tables for a clean slate...');

    // Disable foreign key checks to allow truncation in any order
    await conn.query('SET FOREIGN_KEY_CHECKS = 0;');

    const tables = [
      'observations',
      'recovery_sessions',
      'focus_sessions',
      'tasks',
      'goals',
      'experiments',
      'memories',
      'insights',
      'users'
    ];

    for (const table of tables) {
      await conn.query(`TRUNCATE TABLE ${table};`);
      console.log(`[ORBIT Database] Table '${table}' truncated.`);
    }

    // Re-enable foreign key checks
    await conn.query('SET FOREIGN_KEY_CHECKS = 1;');

    console.log('[ORBIT Database] All tables truncated successfully. Application database is brand new with zero data.');
    return true;
  } catch (err) {
    console.error('[ORBIT Database Error] Truncate operation failed:', err.message || err);
    return false;
  } finally {
    if (conn) conn.release();
  }
}

// Execute if run directly
truncateDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
