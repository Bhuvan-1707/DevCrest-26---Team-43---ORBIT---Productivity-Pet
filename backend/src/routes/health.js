import express from 'express';

const router = express.Router();

/**
 * GET /api/health
 * Health check endpoint for ORBIT Backend API.
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'ORBIT API',
  });
});

export default router;
