import mariadb from 'mariadb';
import config from './env.js';

/**
 * MariaDB Connection Pool with fast connection timeout
 */
export const pool = mariadb.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  connectionLimit: 10,
  connectTimeout: 10000,
  acquireTimeout: 10000,
});

/**
 * Startup Database Connectivity Verification
 */
export async function testConnection() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('[ORBIT Database] Database connected successfully');
    return true;
  } catch (err) {
    console.error(`[ORBIT Database Warning] Database connection failed (${config.db.host}:${config.db.port}/${config.db.name}):`, err.message || err);
    return false;
  } finally {
    if (conn) conn.release();
  }
}

export default pool;
