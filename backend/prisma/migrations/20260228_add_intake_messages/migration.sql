-- CreateTable: intake_messages (pre-case messaging between applicant and professional)
CREATE TABLE "intake_messages" (
    "id" TEXT NOT NULL,
    "intake_id" TEXT NOT NULL,
    "sender_email" VARCHAR(255) NOT NULL,
    "sender_name" VARCHAR(255) NOT NULL,
    "sender_role" VARCHAR(50) NOT NULL DEFAULT 'applicant',
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intake_messages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "intake_messages" ADD CONSTRAINT "intake_messages_intake_id_fkey"
    FOREIGN KEY ("intake_id") REFERENCES "case_intakes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "intake_messages_intake_id_idx" ON "intake_messages"("intake_id");
CREATE INDEX "intake_messages_created_at_idx" ON "intake_messages"("created_at");
