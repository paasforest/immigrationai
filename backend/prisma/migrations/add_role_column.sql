-- Migration: Add role column to users table
-- This enables admin functionality

-- Add role column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user';
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
  END IF;
END $$;

-- Update any existing test users to admin (optional)
-- UPDATE users SET role = 'admin' WHERE email = 'admin@immigrationai.co.za';

COMMENT ON COLUMN users.role IS 'User role: user or admin';


