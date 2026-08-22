import dotenv from 'dotenv';

dotenv.config();

/**
 * Centralized Backend Configuration
 */
export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'orbit_jwt_secret_key_dev_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    name: process.env.DB_NAME || 'orbit_db',
    user: process.env.DB_USER || 'orbit_user',
    password: process.env.DB_PASSWORD || '',
  },
};

export default config;
