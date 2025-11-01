-- Add role column to users table for admin access control
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" VARCHAR(50) DEFAULT 'user';

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users"("role");

-- Add verified_by and verification_notes to payments table if not exists
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "verified_by" UUID;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "verification_notes" TEXT;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "verified_at" TIMESTAMP(6);

-- Create index for verified_by
CREATE INDEX IF NOT EXISTS "payments_verified_by_idx" ON "payments"("verified_by");

