import pool from '../config/database.js';

// In-memory fallback repository when DB is offline during development/testing
const memoryUsers = new Map();
let memoryIdCounter = 1;
let isDbActive = true;

// Helper to execute query with quick fallback
const safeQuery = async (queryFn, fallbackFn) => {
  if (!isDbActive) return fallbackFn();
  try {
    return await Promise.race([
      queryFn(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 1000))
    ]);
  } catch (err) {
    isDbActive = false;
    return fallbackFn();
  }
};

export const UserModel = {
  findByEmail: async (email) => {
    return safeQuery(
      async () => {
        const rows = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows && rows.length > 0) return rows[0];
        return null;
      },
      () => {
        for (const u of memoryUsers.values()) {
          if (u.email.toLowerCase() === email.toLowerCase()) {
            return u;
          }
        }
        return null;
      }
    );
  },

  findById: async (id) => {
    return safeQuery(
      async () => {
        const rows = await pool.query(
          'SELECT id, email, name, avatar, role, level, streak, created_at FROM users WHERE id = ?',
          [id]
        );
        if (rows && rows.length > 0) return rows[0];
        return null;
      },
      () => {
        const user = memoryUsers.get(Number(id));
        if (user) {
          const { password_hash, ...userWithoutPassword } = user;
          return userWithoutPassword;
        }
        return null;
      }
    );
  },

  create: async ({ email, password_hash, name, role, level, avatar }) => {
    const userRole = role || 'Software Engineer & Learner';
    const userLevel = level || 'Adaptive Phase 1';
    const userAvatar = avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;

    return safeQuery(
      async () => {
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
      () => {
        const insertId = memoryIdCounter++;
        const newUser = {
          id: insertId,
          email,
          password_hash,
          name,
          avatar: userAvatar,
          role: userRole,
          level: userLevel,
          streak: 0,
          created_at: new Date().toISOString(),
        };
        memoryUsers.set(insertId, newUser);
        const { password_hash: _, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
      }
    );
  },
};

export default UserModel;
