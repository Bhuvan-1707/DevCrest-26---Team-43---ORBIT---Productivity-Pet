import RecoveryModel from '../models/recoveryModel.js';

/**
 * GET /api/recovery
 * Get all recovery sessions belonging to authenticated user
 */
export async function getRecoverySessions(req, res, next) {
  try {
    const sessions = await RecoveryModel.findAllByUserId(req.user.id);
    return res.status(200).json({
      status: 'ok',
      count: sessions.length,
      data: sessions,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/recovery
 * Start / Create a micro-break recovery session
 */
export async function createRecoverySession(req, res, next) {
  try {
    const { focusSessionId, recommendedDurationMinutes, fatigueLevel, triggerReason } = req.body;

    const newSession = await RecoveryModel.create({
      userId: req.user.id,
      focusSessionId,
      recommendedDurationMinutes,
      fatigueLevel,
      triggerReason,
    });

    return res.status(201).json({
      status: 'ok',
      message: 'Recovery session started.',
      data: newSession,
      observationContext: {
        type: 'RECOVERY_STARTED',
        recoveryId: newSession.id,
        triggerReason: newSession.trigger_reason,
        fatigueLevel: newSession.fatigue_level,
        recommendedDurationMinutes: newSession.recommended_duration_minutes,
        startedAt: newSession.started_at,
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/recovery/:id
 * Update/Complete a recovery session
 */
export async function updateRecoverySession(req, res, next) {
  try {
    const { id } = req.params;
    const existingSession = await RecoveryModel.findById(id, req.user.id);

    if (!existingSession) {
      return res.status(404).json({
        status: 'error',
        message: 'Recovery session not found or access denied.',
      });
    }

    const updatedSession = await RecoveryModel.update(id, req.user.id, req.body);

    return res.status(200).json({
      status: 'ok',
      message: `Recovery session ${updatedSession.status}.`,
      data: updatedSession,
    });
  } catch (err) {
    next(err);
  }
}
