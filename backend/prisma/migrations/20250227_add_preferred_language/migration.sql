-- AddColumn: preferred_language to users table
-- Safe: adds column with default value 'en' so existing rows are not broken.

ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "preferred_language" VARCHAR(10) NOT NULL DEFAULT 'en';
