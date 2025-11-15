-- Create eligibility_checks table to store homepage quick-assessment submissions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS eligibility_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NULL,
  email TEXT,
  country TEXT NOT NULL,
  visa_type TEXT NOT NULL,
  answers JSONB NOT NULL,
  verdict TEXT NOT NULL,
  confidence NUMERIC(5,2),
  summary TEXT,
  risk_notes TEXT,
  recommended_documents JSONB,
  recommended_steps JSONB,
  should_follow_up BOOLEAN DEFAULT FALSE,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  session_id TEXT,
  referrer TEXT,
  landing_page TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eligibility_checks_country ON eligibility_checks(country);
CREATE INDEX IF NOT EXISTS idx_eligibility_checks_visa_type ON eligibility_checks(visa_type);
CREATE INDEX IF NOT EXISTS idx_eligibility_checks_created_at ON eligibility_checks(created_at);
CREATE INDEX IF NOT EXISTS idx_eligibility_checks_utm_source ON eligibility_checks(utm_source);

