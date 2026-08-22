import pool from '../config/database.js';

export const UserModel = {
  findByEmail: async (email) => {
    const rows = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows && rows.length > 0) return rows[0];
    return null;
  },

  findById: async (id) => {
    const rows = await pool.query(
      'SELECT id, email, name, avatar, role, level, streak, created_at FROM users WHERE id = ?',
      [id]
    );
    if (rows && rows.length > 0) return rows[0];
    return null;
  },

  create: async ({ email, password_hash, name, role, level, avatar }) => {
    const userRole = role || 'Software Engineer & Learner';
    const userLevel = level || 'Adaptive Phase 1';
    const userAvatar = avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;

    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name, avatar, role, level, streak) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [email, password_hash, name, userAvatar, userRole, userLevel, 0]
    );
    const insertId = result.insertId ? Number(result.insertId) : Date.now();
    return {
      id: insertId,
      email,
      name,
      avatar: userAvatar,
      role: userRole,
      level: userLevel,
      streak: 0,
    };
  },
};

export default UserModel;
