import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import UserModel from '../models/userModel.js';

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

// Helper to format user payload without sensitive fields
const sanitizeUser = (user) => {
  const { password_hash, ...safeUser } = user;
  return safeUser;
};

/**
 * POST /api/auth/register
 */
export async function register(req, res, next) {
  try {
    const { email, password, name, role, level } = req.body;

    // 1. Input validation
    if (!email || !password || !name) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email, and password are required fields.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters long.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email address format.',
      });
    }

    // 2. Reject duplicate email accounts
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'User account with this email already exists.',
      });
    }

    // 3. Hash password securely (bcrypt salt rounds = 10)
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 4. Create user
    const newUser = await UserModel.create({
      email,
      password_hash,
      name,
      role,
      level,
    });

    // 5. Generate authentication token
    const token = generateToken(newUser);

    return res.status(201).json({
      status: 'ok',
      message: 'User registered successfully.',
      token,
      user: sanitizeUser(newUser),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // 1. Input validation
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required.',
      });
    }

    // 2. Fetch user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.',
      });
    }

    // 3. Verify password securely
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.',
      });
    }

    // 4. Generate authentication token
    const token = generateToken(user);

    return res.status(200).json({
      status: 'ok',
      message: 'Logged in successfully.',
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 */
export async function getMe(req, res) {
  return res.status(200).json({
    status: 'ok',
    user: sanitizeUser(req.user),
  });
}
