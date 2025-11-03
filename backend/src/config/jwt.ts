import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// SECURITY: JWT secrets are REQUIRED - no defaults allowed
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_EXPIRE = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

// CRITICAL: Fail fast if secrets are not set (prevents security breach)
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('FATAL SECURITY ERROR: JWT_SECRET must be set in environment variables and be at least 32 characters long');
}

if (!REFRESH_TOKEN_SECRET || REFRESH_TOKEN_SECRET.length < 32) {
  throw new Error('FATAL SECURITY ERROR: REFRESH_TOKEN_SECRET must be set in environment variables and be at least 32 characters long');
}

if (JWT_SECRET === REFRESH_TOKEN_SECRET) {
  throw new Error('FATAL SECURITY ERROR: JWT_SECRET and REFRESH_TOKEN_SECRET must be different');
}

export interface JWTPayload {
  userId: string;
  email: string;
}

// Generate access token
export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  } as jwt.SignOptions);
};

// Generate refresh token
export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRE,
  } as jwt.SignOptions);
};

// Verify access token
export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};

// Verify refresh token
export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as JWTPayload;
};


