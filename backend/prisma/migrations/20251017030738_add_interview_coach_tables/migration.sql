-- CreateTable
CREATE TABLE "interview_questions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "visa_type" VARCHAR(50) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "difficulty" VARCHAR(20) NOT NULL,
    "question" TEXT NOT NULL,
    "context_tips" JSONB NOT NULL,
    "red_flags" JSONB NOT NULL,
    "ideal_elements" JSONB NOT NULL,
    "example_good_answer" TEXT NOT NULL,
    "example_bad_answer" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "interview_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mock_interviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "visa_type" VARCHAR(50) NOT NULL,
    "user_answer" TEXT NOT NULL,
    "answer_audio_url" VARCHAR(500),
    "transcription" TEXT,
    "duration_seconds" INTEGER,
    "ai_feedback" JSONB NOT NULL,
    "score" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mock_interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "visa_type" VARCHAR(50) NOT NULL,
    "session_name" VARCHAR(255),
    "questions_attempted" INTEGER NOT NULL,
    "average_score" DECIMAL(3,2) NOT NULL,
    "duration_minutes" INTEGER,
    "started_at" TIMESTAMP(6) NOT NULL,
    "completed_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_interview_progress" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "visa_type" VARCHAR(50) NOT NULL,
    "questions_practiced" INTEGER NOT NULL DEFAULT 0,
    "average_score" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "weakest_category" VARCHAR(50),
    "strongest_category" VARCHAR(50),
    "readiness_score" INTEGER NOT NULL DEFAULT 0,
    "last_practice_date" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "user_interview_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_feedback_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "mock_interview_id" UUID NOT NULL,
    "feedback_text" TEXT NOT NULL,
    "key_strengths" TEXT[],
    "areas_for_improvement" TEXT[],
    "suggestions" TEXT,
    "consistency_with_sop" BOOLEAN NOT NULL,
    "red_flags_detected" TEXT[],
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_feedback_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "interview_questions_visa_type_idx" ON "interview_questions"("visa_type");

-- CreateIndex
CREATE INDEX "interview_questions_category_idx" ON "interview_questions"("category");

-- CreateIndex
CREATE INDEX "interview_questions_difficulty_idx" ON "interview_questions"("difficulty");

-- CreateIndex
CREATE INDEX "mock_interviews_user_id_idx" ON "mock_interviews"("user_id");

-- CreateIndex
CREATE INDEX "mock_interviews_visa_type_idx" ON "mock_interviews"("visa_type");

-- CreateIndex
CREATE INDEX "mock_interviews_score_idx" ON "mock_interviews"("score");

-- CreateIndex
CREATE INDEX "interview_sessions_user_id_idx" ON "interview_sessions"("user_id");

-- CreateIndex
CREATE INDEX "interview_sessions_visa_type_idx" ON "interview_sessions"("visa_type");

-- CreateIndex
CREATE INDEX "user_interview_progress_user_id_idx" ON "user_interview_progress"("user_id");

-- CreateIndex
CREATE INDEX "user_interview_progress_visa_type_idx" ON "user_interview_progress"("visa_type");

-- CreateIndex
CREATE UNIQUE INDEX "user_interview_progress_user_id_visa_type_key" ON "user_interview_progress"("user_id", "visa_type");

-- CreateIndex
CREATE INDEX "interview_feedback_history_mock_interview_id_idx" ON "interview_feedback_history"("mock_interview_id");

-- AddForeignKey
ALTER TABLE "mock_interviews" ADD CONSTRAINT "mock_interviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_interviews" ADD CONSTRAINT "mock_interviews_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "interview_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_interview_progress" ADD CONSTRAINT "user_interview_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_feedback_history" ADD CONSTRAINT "interview_feedback_history_mock_interview_id_fkey" FOREIGN KEY ("mock_interview_id") REFERENCES "mock_interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
