-- Add account_number column to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "account_number" VARCHAR(50);

-- Create unique index on account_number
CREATE UNIQUE INDEX IF NOT EXISTS "users_account_number_key" ON "users"("account_number");

-- Add pending_payments table for tracking payment instructions
CREATE TABLE IF NOT EXISTS "pending_payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "account_number" VARCHAR(50) NOT NULL,
    "plan" VARCHAR(50) NOT NULL,
    "billing_cycle" VARCHAR(20) NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(6),
    
    CONSTRAINT "pending_payments_pkey" PRIMARY KEY ("id")
);

-- Create unique index on account_number in pending_payments for ON CONFLICT
CREATE UNIQUE INDEX IF NOT EXISTS "pending_payments_account_number_key" ON "pending_payments"("account_number");

-- Add payments table if it doesn't exist
CREATE TABLE IF NOT EXISTS "payments" (
    "id" VARCHAR(255) NOT NULL,
    "user_id" UUID NOT NULL,
    "plan" VARCHAR(50) NOT NULL,
    "billing_cycle" VARCHAR(20) NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'ZAR',
    "payment_method" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "transaction_id" VARCHAR(255),
    "amount_paid" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "pending_payments" ADD CONSTRAINT "pending_payments_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS "pending_payments_user_id_idx" ON "pending_payments"("user_id");
CREATE INDEX IF NOT EXISTS "pending_payments_status_idx" ON "pending_payments"("status");
CREATE INDEX IF NOT EXISTS "payments_user_id_idx" ON "payments"("user_id");
CREATE INDEX IF NOT EXISTS "payments_status_idx" ON "payments"("status");



