-- Add uploadedByRole and isEmbassyPackage to case_documents
ALTER TABLE "case_documents" ADD COLUMN IF NOT EXISTS "uploaded_by_role" VARCHAR(50) NOT NULL DEFAULT 'professional';
ALTER TABLE "case_documents" ADD COLUMN IF NOT EXISTS "is_embassy_package" BOOLEAN NOT NULL DEFAULT false;

-- Create index on is_embassy_package for fast embassy package queries
CREATE INDEX IF NOT EXISTS "case_documents_is_embassy_package_idx" ON "case_documents"("is_embassy_package");
