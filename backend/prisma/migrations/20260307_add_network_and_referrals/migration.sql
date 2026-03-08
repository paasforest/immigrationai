-- AlterTable professional_profiles: add network/referral fields
ALTER TABLE "professional_profiles" ADD COLUMN IF NOT EXISTS "professional_type" VARCHAR(50);
ALTER TABLE "professional_profiles" ADD COLUMN IF NOT EXISTS "available_for_referrals" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "professional_profiles" ADD COLUMN IF NOT EXISTS "available_for_co_counsel" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS "professional_profiles_professional_type_idx" ON "professional_profiles"("professional_type");
CREATE INDEX IF NOT EXISTS "professional_profiles_available_for_referrals_idx" ON "professional_profiles"("available_for_referrals");
CREATE INDEX IF NOT EXISTS "professional_profiles_available_for_co_counsel_idx" ON "professional_profiles"("available_for_co_counsel");

-- CreateTable case_referrals
CREATE TABLE IF NOT EXISTS "case_referrals" (
    "id" TEXT NOT NULL,
    "referrer_id" UUID NOT NULL,
    "recipient_id" UUID NOT NULL,
    "intake_id" TEXT,
    "case_id" UUID,
    "note" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "client_notified" BOOLEAN NOT NULL DEFAULT false,
    "responded_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "case_referrals_pkey" PRIMARY KEY ("id")
);

-- Add FKs (case_intakes.id is TEXT/cuid in Prisma)
ALTER TABLE "case_referrals" ADD CONSTRAINT "case_referrals_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "case_referrals" ADD CONSTRAINT "case_referrals_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "case_referrals" ADD CONSTRAINT "case_referrals_intake_id_fkey" FOREIGN KEY ("intake_id") REFERENCES "case_intakes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "case_referrals" ADD CONSTRAINT "case_referrals_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "case_referrals_referrer_id_idx" ON "case_referrals"("referrer_id");
CREATE INDEX IF NOT EXISTS "case_referrals_recipient_id_idx" ON "case_referrals"("recipient_id");
CREATE INDEX IF NOT EXISTS "case_referrals_status_idx" ON "case_referrals"("status");
CREATE INDEX IF NOT EXISTS "case_referrals_intake_id_idx" ON "case_referrals"("intake_id");
CREATE INDEX IF NOT EXISTS "case_referrals_case_id_idx" ON "case_referrals"("case_id");
