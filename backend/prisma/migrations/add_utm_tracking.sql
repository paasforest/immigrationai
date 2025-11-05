-- UTM Tracking Table for Marketing Attribution
-- Tracks where users come from (ProConnectSA, etc.)

CREATE TABLE IF NOT EXISTS user_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  utm_source VARCHAR(100),      -- e.g., 'proconnectsa'
  utm_medium VARCHAR(100),       -- e.g., 'website', 'email'
  utm_campaign VARCHAR(100),     -- e.g., 'immigration_integration'
  utm_content VARCHAR(255),      -- e.g., 'hero_banner'
  utm_term VARCHAR(255),         -- e.g., 'visa_assistance'
  referrer VARCHAR(500),         -- Full referrer URL
  landing_page VARCHAR(500),     -- First page visited
  session_id VARCHAR(100),       -- Browser session ID
  ip_address VARCHAR(45),        -- User IP address
  user_agent TEXT,               -- Browser/device info
  converted BOOLEAN DEFAULT FALSE,   -- Did they subscribe/upgrade?
  converted_at TIMESTAMP,        -- When they converted
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_user_tracking_user_id ON user_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tracking_utm_source ON user_tracking(utm_source);
CREATE INDEX IF NOT EXISTS idx_user_tracking_utm_campaign ON user_tracking(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_user_tracking_converted ON user_tracking(converted);
CREATE INDEX IF NOT EXISTS idx_user_tracking_created_at ON user_tracking(created_at);

-- Comments
COMMENT ON TABLE user_tracking IS 'Tracks UTM parameters and referrals for marketing attribution';
COMMENT ON COLUMN user_tracking.utm_source IS 'Traffic source (e.g., proconnectsa, google, facebook)';
COMMENT ON COLUMN user_tracking.utm_medium IS 'Marketing medium (e.g., website, email, social)';
COMMENT ON COLUMN user_tracking.utm_campaign IS 'Campaign name (e.g., immigration_integration)';
COMMENT ON COLUMN user_tracking.converted IS 'Whether user upgraded to paid plan';

