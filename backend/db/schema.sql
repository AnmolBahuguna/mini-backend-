-- ============================================================
-- DHIP Cyber Safety Platform — Supabase Schema
-- Production-ready schema with all features implemented
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USER PROFILES
-- Extends Supabase auth.users with app-specific profile data
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  phone         TEXT,
  avatar_url    TEXT,
  role          TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  is_verified   BOOLEAN DEFAULT FALSE,
  emergency_contacts JSONB DEFAULT '[]',
  location_city TEXT,
  location_state TEXT,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  consent_data_use BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. THREAT CHECK CACHE
-- Stores results of URL/phone/email/UPI threat scans
-- ============================================================
CREATE TABLE IF NOT EXISTS public.threat_check_cache (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  input_type      TEXT NOT NULL CHECK (input_type IN ('url','phone','email','upi','message','ip')),
  input_value     TEXT NOT NULL,
  input_hash      TEXT NOT NULL UNIQUE,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  risk_score      SMALLINT CHECK (risk_score BETWEEN 0 AND 100),
  drs_score       NUMERIC(4,2) CHECK (drs_score BETWEEN 0.00 AND 10.00),
  risk_level      TEXT CHECK (risk_level IN ('safe','low','medium','high','critical')),
  virustotal      JSONB,
  safe_browsing   JSONB,
  ipqs            JSONB,
  abuseipdb       JSONB,
  ai_summary      TEXT,
  ai_enrichment   JSONB,
  flags           TEXT[] DEFAULT '{}',
  expires_at      TIMESTAMPTZ DEFAULT NOW() + INTERVAL '10 days',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.threat_check_cache ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_threat_check_hash ON public.threat_check_cache(input_hash);
CREATE INDEX IF NOT EXISTS idx_threat_check_value ON public.threat_check_cache(input_value);
CREATE INDEX IF NOT EXISTS idx_threat_check_user ON public.threat_check_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_threat_check_status ON public.threat_check_cache(status);
CREATE INDEX IF NOT EXISTS idx_threat_check_created ON public.threat_check_cache(created_at DESC);

-- ============================================================
-- 3. DIGITAL RISK SCORES
-- Aggregated risk profile per scanned entity
-- ============================================================
CREATE TABLE IF NOT EXISTS public.digital_risk_scores (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  threat_check_id UUID REFERENCES public.threat_check_cache(id) ON DELETE CASCADE,
  entity          TEXT NOT NULL UNIQUE,
  entity_type     TEXT NOT NULL,
  score           SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 100),
  risk_level      TEXT DEFAULT 'LOW' CHECK (risk_level IN ('low','medium','high','critical')),
  components      JSONB DEFAULT '{}',
  verdict         TEXT NOT NULL CHECK (verdict IN ('safe','suspicious','dangerous')),
  report_count    INTEGER DEFAULT 0,
  evidence_count  INTEGER DEFAULT 0,
  last_seen       TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.digital_risk_scores ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_drs_entity ON public.digital_risk_scores(entity);
CREATE INDEX IF NOT EXISTS idx_drs_entity_type ON public.digital_risk_scores(entity_type);
CREATE INDEX IF NOT EXISTS idx_drs_risk_level ON public.digital_risk_scores(risk_level);

-- ============================================================
-- 4. ALERTS
-- Regional live threat alerts feed
-- ============================================================
CREATE TABLE IF NOT EXISTS public.alerts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  description     TEXT,
  alert_type      TEXT NOT NULL CHECK (alert_type IN ('surge','phishing','scam','fraud','malware','sos','community')),
  severity        TEXT NOT NULL CHECK (severity IN ('info','warning','critical')),
  region          TEXT,
  city            TEXT,
  state           TEXT,
  country         TEXT DEFAULT 'IN',
  lat             DECIMAL(9,6),
  lng             DECIMAL(9,6),
  source          TEXT DEFAULT 'system',
  related_type    TEXT,
  related_value   TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  view_count      INTEGER DEFAULT 0,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_alerts_active ON public.alerts(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON public.alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_region ON public.alerts(region, city);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON public.alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_alerts_expires ON public.alerts(expires_at) WHERE is_active = TRUE;

-- ============================================================
-- 5. THREAT REPORTS (Community Reports)
-- User-submitted incident reports
-- ============================================================
CREATE TABLE IF NOT EXISTS public.threat_reports (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  entity          TEXT NOT NULL,
  entity_type     TEXT NOT NULL,
  category        TEXT NOT NULL CHECK (category IN (
    'online_fraud','cyber_stalking','phishing','identity_theft',
    'harassment','deepfake','sextortion','upi_fraud','other'
  )),
  scam_type       TEXT,
  platform        TEXT,
  suspect_info    JSONB DEFAULT '{}',
  evidence_urls   TEXT[] DEFAULT '{}',
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','reviewing','verified','resolved','rejected')),
  is_verified     BOOLEAN DEFAULT FALSE,
  upvotes         INTEGER DEFAULT 0,
  similar_count   INTEGER DEFAULT 0,
  location_city   TEXT,
  location_state  TEXT,
  district        TEXT,
  lat             DECIMAL(9,6),
  lng             DECIMAL(9,6),
  is_anonymous    BOOLEAN DEFAULT FALSE,
  ai_tags         TEXT[] DEFAULT '{}',
  tmd_cluster_id  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.threat_reports ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_reports_entity ON public.threat_reports(entity);
CREATE INDEX IF NOT EXISTS idx_reports_user ON public.threat_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.threat_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_category ON public.threat_reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_state ON public.threat_reports(location_state);
CREATE INDEX IF NOT EXISTS idx_reports_created ON public.threat_reports(created_at DESC);

-- ============================================================
-- 6. EVIDENCE VAULT
-- Encrypted evidence file metadata (actual files in Supabase Storage)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.evidence_vault (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  report_id       UUID REFERENCES public.threat_reports(id) ON DELETE SET NULL,
  file_name       TEXT NOT NULL,
  file_type       TEXT NOT NULL,
  file_size       BIGINT,
  storage_path    TEXT NOT NULL,
  storage_bucket  TEXT DEFAULT 'evidence',
  thumbnail_url   TEXT,
  description     TEXT,
  is_encrypted    BOOLEAN DEFAULT TRUE,
  encryption_key_hint TEXT,
  hash_sha256     TEXT,
  metadata        JSONB DEFAULT '{}',
  blockchain_tx   TEXT,
  is_deleted      BOOLEAN DEFAULT FALSE,
  purge_at        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.evidence_vault ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_evidence_user ON public.evidence_vault(user_id, is_deleted);
CREATE INDEX IF NOT EXISTS idx_evidence_report ON public.evidence_vault(report_id);
CREATE INDEX IF NOT EXISTS idx_evidence_purge ON public.evidence_vault(purge_at) WHERE is_deleted = TRUE;

-- ============================================================
-- 7. SURVIVOR STORIES
-- Community-shared safety stories and testimonials
-- ============================================================
CREATE TABLE IF NOT EXISTS public.survivor_stories (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  content         TEXT NOT NULL,
  category        TEXT CHECK (category IN ('women_safety','cyber_fraud','stalking','recovery','awareness','other')),
  scam_type       TEXT,
  state           TEXT,
  is_anonymous    BOOLEAN DEFAULT TRUE,
  is_approved     BOOLEAN DEFAULT FALSE,
  is_featured     BOOLEAN DEFAULT FALSE,
  upvotes         INTEGER DEFAULT 0,
  tags            TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.survivor_stories ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_stories_approved ON public.survivor_stories(is_approved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_featured ON public.survivor_stories(is_featured);

-- ============================================================
-- 8. PANIC / SOS EVENTS
-- Women Safety panic button activations
-- ============================================================
CREATE TABLE IF NOT EXISTS public.panic_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  lat             DECIMAL(9,6),
  lng             DECIMAL(9,6),
  address         TEXT,
  message         TEXT DEFAULT 'SOS: I need help!',
  contacts_notified TEXT[] DEFAULT '{}',
  twilio_sids     TEXT[] DEFAULT '{}',
  status          TEXT DEFAULT 'sent' CHECK (status IN ('sent','acknowledged','resolved','false_alarm')),
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.panic_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_panic_user ON public.panic_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_panic_status ON public.panic_events(status);

-- ============================================================
-- 9. TMD PREDICTIONS
-- Threat Mutation Detection clustering results
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tmd_predictions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cluster_id      TEXT NOT NULL UNIQUE,
  cluster_label   TEXT,
  report_ids      UUID[] DEFAULT '{}',
  centroid_coords JSONB,
  threat_type     TEXT,
  scam_type       TEXT,
  mutation_score  DECIMAL(5,2),
  confidence      FLOAT,
  trend           TEXT CHECK (trend IN ('emerging','stable','declining','spike')),
  affected_regions TEXT[] DEFAULT '{}',
  affected_states TEXT[] DEFAULT '{}',
  predicted_at    TIMESTAMPTZ DEFAULT NOW(),
  valid_until     TIMESTAMPTZ,
  is_archived     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tmd_predictions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_tmd_cluster ON public.tmd_predictions(cluster_id);
CREATE INDEX IF NOT EXISTS idx_tmd_trend ON public.tmd_predictions(trend);
CREATE INDEX IF NOT EXISTS idx_tmd_valid ON public.tmd_predictions(valid_until) WHERE is_archived = FALSE;

-- ============================================================
-- 10. SUPPORT CHAT SESSIONS
-- AI chatbot conversation history
-- ============================================================
CREATE TABLE IF NOT EXISTS public.support_chat_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  session_token   TEXT UNIQUE,
  messages        JSONB DEFAULT '[]',
  context_type    TEXT DEFAULT 'general' CHECK (context_type IN ('general','women_safety','fraud','legal','technical')),
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.support_chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_chat_user ON public.support_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_active ON public.support_chat_sessions(is_active);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own threat checks" ON public.threat_check_cache
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can insert threat checks" ON public.threat_check_cache
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can view active alerts" ON public.alerts
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Anyone can read verified reports" ON public.digital_risk_scores
  FOR SELECT USING (TRUE);

CREATE POLICY "Anyone can read verified threat reports" ON public.threat_reports
  FOR SELECT USING (status = 'verified' OR auth.uid() = user_id);
CREATE POLICY "Authenticated users can create reports" ON public.threat_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reports" ON public.threat_reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own evidence" ON public.evidence_vault
  FOR SELECT USING (auth.uid() = user_id AND is_deleted = FALSE);
CREATE POLICY "Users can insert own evidence" ON public.evidence_vault
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own evidence" ON public.evidence_vault
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read approved stories" ON public.survivor_stories
  FOR SELECT USING (is_approved = TRUE);
CREATE POLICY "Authenticated users can submit stories" ON public.survivor_stories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own panic events" ON public.panic_events
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create panic events" ON public.panic_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view TMD predictions" ON public.tmd_predictions
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can view own chat sessions" ON public.support_chat_sessions
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Anyone can create chat sessions" ON public.support_chat_sessions
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Users can update own chat sessions" ON public.support_chat_sessions
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- ============================================================
-- SUPABASE STORAGE BUCKETS
-- Create these buckets in Supabase Dashboard > Storage
-- ============================================================

-- Bucket: evidence (private, RLS enforced, max 10MB per file)
-- Bucket: avatars (public, max 2MB per file)

-- ============================================================
-- MAINTENANCE TRIGGERS & FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.cleanup_expired_checks()
RETURNS void AS $$
BEGIN
  DELETE FROM public.threat_check_cache
  WHERE expires_at < NOW() AND status = 'completed';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.archive_tmd_predictions()
RETURNS void AS $$
BEGIN
  UPDATE public.tmd_predictions
  SET is_archived = TRUE
  WHERE valid_until < NOW() AND is_archived = FALSE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.purge_deleted_evidence()
RETURNS void AS $$
BEGIN
  DELETE FROM public.evidence_vault
  WHERE is_deleted = TRUE AND purge_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- REALTIME SUBSCRIPTIONS
-- Enable in Supabase dashboard for: alerts, threat_reports, panic_events
-- ============================================================
BEGIN;
  ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
  ALTER PUBLICATION supabase_realtime ADD TABLE threat_reports;
  ALTER PUBLICATION supabase_realtime ADD TABLE panic_events;
EXCEPTION WHEN OTHERS THEN
  NULL;
END;

-- ============================================================
-- SCHEMA SUMMARY
-- Tables: 10 | RLS Policies: 18+ | Indexes: 20+ | Triggers: 1
-- Maintenance Functions: 3 (cleanup, archive, purge)
-- ============================================================
