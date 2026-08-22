import InsightModel from '../models/insightModel.js';

/**
 * GET /api/insights
 * Get all insights for authenticated user
 */
export async function getInsights(req, res, next) {
  try {
    const insights = await InsightModel.findAllByUserId(req.user.id);
    return res.status(200).json({
      status: 'ok',
      count: insights.length,
      data: insights,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/insights
 * Create a new insight record
 */
export async function createInsight(req, res, next) {
  try {
    const { title, description, confidenceScore, evidenceCount, type, isDemoData } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Insight title is required.',
      });
    }

    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Insight description/explanation is required.',
      });
    }

    const newInsight = await InsightModel.create({
      userId: req.user.id,
      title: title.trim(),
      description: description.trim(),
      confidenceScore,
      evidenceCount,
      type,
      isDemoData,
    });

    return res.status(201).json({
      status: 'ok',
      message: 'Insight recorded successfully.',
      data: newInsight,
    });
  } catch (err) {
    next(err);
  }
}
