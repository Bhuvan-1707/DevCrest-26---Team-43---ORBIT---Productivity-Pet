import SessionModel from '../models/sessionModel.js';

/**
 * GET /api/sessions
 * Get all focus sessions belonging to authenticated user
 */
export async function getSessions(req, res, next) {
  try {
    const sessions = await SessionModel.findAllByUserId(req.user.id);
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
 * GET /api/sessions/:id
 * Get specific focus session by ID
 */
export async function getSessionById(req, res, next) {
  try {
    const session = await SessionModel.findById(req.params.id, req.user.id);
    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Focus session not found or access denied.',
      });
    }
    return res.status(200).json({
      status: 'ok',
      data: session,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/sessions
 * Create/Start a new focus session
 */
export async function createSession(req, res, next) {
  try {
    const { taskId, sessionCode, taskTitle, plannedDurationMinutes } = req.body;

    const newSession = await SessionModel.create({
      userId: req.user.id,
      taskId,
      sessionCode,
      taskTitle,
      plannedDurationMinutes,
    });

    return res.status(201).json({
      status: 'ok',
      message: 'Focus session started.',
      data: newSession,
      observationContext: {
        type: 'SESSION_STARTED',
        sessionId: newSession.id,
        sessionCode: newSession.session_code,
        taskTitle: newSession.task_title,
        status: 'running',
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/sessions/:id
 * Update status/duration/score of a focus session (pause, resume, complete, cancel)
 */
export async function updateSession(req, res, next) {
  try {
    const { id } = req.params;
    const existingSession = await SessionModel.findById(id, req.user.id);

    if (!existingSession) {
      return res.status(404).json({
        status: 'error',
        message: 'Focus session not found or access denied.',
      });
    }

    const { status, actualDurationMinutes, focusScore, actual_duration_minutes, focus_score } = req.body;

    const updates = {
      status: status || existingSession.status,
      actual_duration_minutes: actualDurationMinutes !== undefined ? actualDurationMinutes : (actual_duration_minutes !== undefined ? actual_duration_minutes : existingSession.actual_duration_minutes),
      focus_score: focusScore !== undefined ? focusScore : (focus_score !== undefined ? focus_score : existingSession.focus_score),
    };

    const updatedSession = await SessionModel.update(id, req.user.id, updates);

    // Map observation event type based on state transition
    let eventType = 'SESSION_UPDATED';
    if (updates.status === 'paused') eventType = 'SESSION_PAUSED';
    else if (updates.status === 'running') eventType = 'SESSION_RESUMED';
    else if (updates.status === 'completed') eventType = 'SESSION_COMPLETED';
    else if (updates.status === 'cancelled') eventType = 'SESSION_CANCELLED';

    return res.status(200).json({
      status: 'ok',
      message: `Focus session ${updatedSession.status}.`,
      data: updatedSession,
      observationContext: {
        type: eventType,
        sessionId: updatedSession.id,
        sessionCode: updatedSession.session_code,
        taskTitle: updatedSession.task_title,
        status: updatedSession.status,
        actualDurationMinutes: updatedSession.actual_duration_minutes,
        focusScore: updatedSession.focus_score,
        completedAt: updatedSession.completed_at,
      }
    });
  } catch (err) {
    next(err);
  }
}
