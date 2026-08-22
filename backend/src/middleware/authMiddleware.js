import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import UserModel from '../models/userModel.js';

/**
 * Authentication Middleware for Protected API Routes
 * Verifies JWT token from Authorization header (Bearer <token>).
 */
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Access token required. Please log in.',
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token. User no longer exists.',
      });
    }

    // Attach authenticated user to request object (excluding password hash)
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired access token.',
    });
  }
}

export default authenticateToken;
