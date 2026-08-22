import MemoryModel from '../models/memoryModel.js';

export const ALLOWED_MEMORY_TYPES = ['live', 'trusted', 'evidence'];

/**
 * GET /api/memories
 * Get all memories for authenticated user (supports ?type=live|trusted|evidence)
 */
export async function getMemories(req, res, next) {
  try {
    const { type } = req.query;
    const memories = await MemoryModel.findAllByUserId(req.user.id, type);
    return res.status(200).json({
      status: 'ok',
      count: memories.length,
      data: memories,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/memories
 * Create a new memory record
 */
export async function createMemory(req, res, next) {
  try {
    const { type, contentText, category, confidenceRating, isValidated, sessionDate, focusScore } = req.body;

    const memoryType = (type || 'live').toLowerCase();
    if (!ALLOWED_MEMORY_TYPES.includes(memoryType)) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid memory type '${type}'. Allowed types: live, trusted, evidence.`,
      });
    }

    if (!contentText || typeof contentText !== 'string' || !contentText.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Memory contentText is required.',
      });
    }

    const newMemory = await MemoryModel.create({
      userId: req.user.id,
      type: memoryType,
      contentText: contentText.trim(),
      category,
      confidenceRating,
      isValidated,
      sessionDate,
      focusScore,
    });

    return res.status(201).json({
      status: 'ok',
      message: 'Memory created successfully.',
      data: newMemory,
    });
  } catch (err) {
    next(err);
  }
}
