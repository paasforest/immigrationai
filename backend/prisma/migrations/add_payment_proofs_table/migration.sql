-- Create payment_proofs table for tracking uploaded payment proof files
CREATE TABLE IF NOT EXISTS "payment_proofs" (
    "id" VARCHAR(255) NOT NULL,
    "user_id" UUID NOT NULL,
    "account_number" VARCHAR(50),
    "file_path" VARCHAR(500),
    "file_name" VARCHAR(255),
    "file_size" INTEGER,
    "file_type" VARCHAR(100),
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "payment_proofs_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint
ALTER TABLE "payment_proofs" ADD CONSTRAINT "payment_proofs_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS "payment_proofs_user_id_idx" ON "payment_proofs"("user_id");
CREATE INDEX IF NOT EXISTS "payment_proofs_status_idx" ON "payment_proofs"("status");
CREATE INDEX IF NOT EXISTS "payment_proofs_account_number_idx" ON "payment_proofs"("account_number");

