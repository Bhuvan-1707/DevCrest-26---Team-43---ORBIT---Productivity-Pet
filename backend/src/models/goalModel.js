import pool from '../config/database.js';

// In-memory goals repository fallback for local dev/test when DB is offline
const memoryGoals = new Map();
let memoryGoalIdCounter = 1;
let isDbActive = true;

// Helper for quick fallback
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

export const GoalModel = {
  findAllByUserId: async (userId) => {
    return safeQuery(
      async () => {
        const rows = await pool.query(
          'SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC',
          [userId]
        );
        return rows;
      },
      () => {
        const userGoals = [];
        for (const goal of memoryGoals.values()) {
          if (Number(goal.user_id) === Number(userId)) {
            userGoals.push(goal);
          }
        }
        return userGoals.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
    );
  },

  findById: async (id, userId) => {
    return safeQuery(
      async () => {
        const rows = await pool.query(
          'SELECT * FROM goals WHERE id = ? AND user_id = ?',
          [id, userId]
        );
        if (rows && rows.length > 0) {
          return rows[0];
        }
        return null;
      },
      () => {
        const goal = memoryGoals.get(Number(id));
        if (goal && Number(goal.user_id) === Number(userId)) {
          return goal;
        }
        return null;
      }
    );
  },

  create: async ({ userId, title, description, progress, completedMilestones, totalMilestones, nextMilestone, targetDate, status }) => {
    const goalTitle = title;
    const goalDesc = description || null;
    const goalProgress = progress !== undefined ? Number(progress) : 0;
    const completedM = completedMilestones !== undefined ? Number(completedMilestones) : 0;
    const totalM = totalMilestones !== undefined ? Number(totalMilestones) : 1;
    const nextM = nextMilestone || null;
    const target = targetDate || null;
    const goalStatus = status || 'active';

    return safeQuery(
      async () => {
        const result = await pool.query(
          `INSERT INTO goals (user_id, title, description, progress, completed_milestones, total_milestones, next_milestone, target_date, status) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, goalTitle, goalDesc, goalProgress, completedM, totalM, nextM, target, goalStatus]
        );
        const insertId = result.insertId ? Number(result.insertId) : Date.now();
        return {
          id: insertId,
          user_id: Number(userId),
          title: goalTitle,
          description: goalDesc,
          progress: goalProgress,
          completed_milestones: completedM,
          total_milestones: totalM,
          next_milestone: nextM,
          target_date: target,
          status: goalStatus,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      },
      () => {
        const insertId = memoryGoalIdCounter++;
        const newGoal = {
          id: insertId,
          user_id: Number(userId),
          title: goalTitle,
          description: goalDesc,
          progress: goalProgress,
          completed_milestones: completedM,
          total_milestones: totalM,
          next_milestone: nextM,
          target_date: target,
          status: goalStatus,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        memoryGoals.set(insertId, newGoal);
        return newGoal;
      }
    );
  },

  update: async (id, userId, updates) => {
    return safeQuery(
      async () => {
        const current = await GoalModel.findById(id, userId);
        if (!current) return null;

        const nextTitle = updates.title !== undefined ? updates.title : current.title;
        const nextDesc = updates.description !== undefined ? updates.description : current.description;
        const nextProgress = updates.progress !== undefined ? Number(updates.progress) : current.progress;
        const nextCompletedM = updates.completedMilestones !== undefined ? Number(updates.completedMilestones) : (updates.completed_milestones !== undefined ? Number(updates.completed_milestones) : current.completed_milestones);
        const nextTotalM = updates.totalMilestones !== undefined ? Number(updates.totalMilestones) : (updates.total_milestones !== undefined ? Number(updates.total_milestones) : current.total_milestones);
        const nextNextM = updates.nextMilestone !== undefined ? updates.nextMilestone : (updates.next_milestone !== undefined ? updates.next_milestone : current.next_milestone);
        const nextTarget = updates.targetDate !== undefined ? updates.targetDate : (updates.target_date !== undefined ? updates.target_date : current.target_date);
        const nextStatus = updates.status !== undefined ? updates.status : current.status;

        await pool.query(
          `UPDATE goals 
           SET title = ?, description = ?, progress = ?, completed_milestones = ?, total_milestones = ?, next_milestone = ?, target_date = ?, status = ?
           WHERE id = ? AND user_id = ?`,
          [nextTitle, nextDesc, nextProgress, nextCompletedM, nextTotalM, nextNextM, nextTarget, nextStatus, id, userId]
        );

        return {
          ...current,
          title: nextTitle,
          description: nextDesc,
          progress: nextProgress,
          completed_milestones: nextCompletedM,
          total_milestones: nextTotalM,
          next_milestone: nextNextM,
          target_date: nextTarget,
          status: nextStatus,
          updated_at: new Date().toISOString(),
        };
      },
      () => {
        const current = memoryGoals.get(Number(id));
        if (!current || Number(current.user_id) !== Number(userId)) return null;

        const updatedGoal = {
          ...current,
          ...updates,
          progress: updates.progress !== undefined ? Number(updates.progress) : current.progress,
          completed_milestones: updates.completedMilestones !== undefined ? Number(updates.completedMilestones) : (updates.completed_milestones !== undefined ? Number(updates.completed_milestones) : current.completed_milestones),
          total_milestones: updates.totalMilestones !== undefined ? Number(updates.totalMilestones) : (updates.total_milestones !== undefined ? Number(updates.total_milestones) : current.total_milestones),
          updated_at: new Date().toISOString(),
        };
        memoryGoals.set(Number(id), updatedGoal);
        return updatedGoal;
      }
    );
  },

  delete: async (id, userId) => {
    return safeQuery(
      async () => {
        const result = await pool.query(
          'DELETE FROM goals WHERE id = ? AND user_id = ?',
          [id, userId]
        );
        return result.affectedRows > 0;
      },
      () => {
        const goal = memoryGoals.get(Number(id));
        if (goal && Number(goal.user_id) === Number(userId)) {
          memoryGoals.delete(Number(id));
          return true;
        }
        return false;
      }
    );
  },
};

export default GoalModel;
