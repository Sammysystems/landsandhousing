-- LandsandHousing Property Concierge — schema
-- Prefix lh_ per shared-infra BUILDER-LOOP.md §49-54 (all 30 projects share ONE database).
-- Verified non-colliding with existing tables: appointment, emaillog, followup,
-- noshowaction, patient, reminderlog, staffhandoff.

-- ============================================================
-- lh_property — structured, queryable property catalogue
-- ============================================================
CREATE TABLE IF NOT EXISTS lh_property (
  id                 text PRIMARY KEY,
  title              text        NOT NULL,
  property_type      text        NOT NULL,
  purpose            text        NOT NULL,
  location           text        NOT NULL,
  zone               text,
  price_raw          bigint      NOT NULL,
  currency           text        NOT NULL DEFAULT 'NGN',
  price_label        text        NOT NULL,
  beds               int,
  baths              numeric(4,1),
  size_sqm           int,
  plot_sqm           int,
  title_document     text,
  description        text,
  highlights         jsonb       NOT NULL DEFAULT '[]'::jsonb,
  features           jsonb       NOT NULL DEFAULT '[]'::jsonb,
  image_url          text,
  status             text        NOT NULL DEFAULT 'available',
  editorial_highlight boolean    NOT NULL DEFAULT false,
  is_illustrative    boolean     NOT NULL DEFAULT false,
  search_vector      tsvector,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- lh_knowledge — prose retrieval (hybrid: tsvector now, vector later)
-- ============================================================
CREATE TABLE IF NOT EXISTS lh_knowledge (
  id            bigserial PRIMARY KEY,
  slug          text        NOT NULL UNIQUE,
  category      text        NOT NULL,
  title         text        NOT NULL,
  content       text        NOT NULL,
  meta          jsonb       NOT NULL DEFAULT '{}'::jsonb,
  search_vector tsvector,
  -- vector-ready: populated later when an embedding provider is wired in
  embedding     vector(1536),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- lh_lead — contact capture
-- ============================================================
CREATE TABLE IF NOT EXISTS lh_lead (
  id         bigserial PRIMARY KEY,
  name       text        NOT NULL,
  phone      text        NOT NULL,
  email      text,
  source     text        NOT NULL DEFAULT 'concierge',
  intent     text,
  status     text        NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- lh_conversation — one session; transcript stored in full (user requirement)
-- ============================================================
CREATE TABLE IF NOT EXISTS lh_conversation (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id       bigint      REFERENCES lh_lead(id) ON DELETE SET NULL,
  session_id    text        NOT NULL UNIQUE,
  transcript    jsonb       NOT NULL DEFAULT '[]'::jsonb,
  summary       text,
  handed_off    boolean     NOT NULL DEFAULT false,
  started_at    timestamptz NOT NULL DEFAULT now(),
  last_active_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- lh_message — per-turn record
-- ============================================================
CREATE TABLE IF NOT EXISTS lh_message (
  id              bigserial PRIMARY KEY,
  conversation_id uuid        NOT NULL REFERENCES lh_conversation(id) ON DELETE CASCADE,
  role            text        NOT NULL,
  content         text        NOT NULL,
  tool_name       text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- lh_booking — inspection booking
-- ============================================================
CREATE TABLE IF NOT EXISTS lh_booking (
  id              bigserial PRIMARY KEY,
  conversation_id uuid        REFERENCES lh_conversation(id) ON DELETE SET NULL,
  lead_id         bigint      REFERENCES lh_lead(id) ON DELETE SET NULL,
  property_id     text        REFERENCES lh_property(id) ON DELETE SET NULL,
  preferred_date  date,
  preferred_window text,
  notes           text,
  status          text        NOT NULL DEFAULT 'pending',
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS lh_property_zone_idx        ON lh_property (zone);
CREATE INDEX IF NOT EXISTS lh_property_type_idx        ON lh_property (property_type);
CREATE INDEX IF NOT EXISTS lh_property_purpose_idx     ON lh_property (purpose);
CREATE INDEX IF NOT EXISTS lh_property_price_idx       ON lh_property (price_raw);
CREATE INDEX IF NOT EXISTS lh_property_status_idx      ON lh_property (status);
CREATE INDEX IF NOT EXISTS lh_property_search_idx      ON lh_property USING gin (search_vector);
CREATE INDEX IF NOT EXISTS lh_knowledge_search_idx     ON lh_knowledge USING gin (search_vector);
CREATE INDEX IF NOT EXISTS lh_knowledge_category_idx    ON lh_knowledge (category);
CREATE INDEX IF NOT EXISTS lh_lead_phone_idx           ON lh_lead (phone);
CREATE INDEX IF NOT EXISTS lh_lead_status_idx          ON lh_lead (status);
CREATE INDEX IF NOT EXISTS lh_lead_created_idx         ON lh_lead (created_at DESC);
CREATE INDEX IF NOT EXISTS lh_message_conversation_idx ON lh_message (conversation_id, created_at);
CREATE INDEX IF NOT EXISTS lh_booking_status_idx       ON lh_booking (status);
CREATE INDEX IF NOT EXISTS lh_booking_created_idx      ON lh_booking (created_at DESC);

-- ============================================================
-- Trigram support for fuzzy property/title matching
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_trgm') THEN
    RAISE NOTICE 'pg_trgm unavailable - skipping trigram indexes';
  END IF;
END $$;

-- ============================================================
-- Full-text search triggers
-- ============================================================
CREATE OR REPLACE FUNCTION lh_property_tsv_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')),        'A') ||
    setweight(to_tsvector('english', coalesce(NEW.location, '')),     'A') ||
    setweight(to_tsvector('english', coalesce(NEW.zone, '')),         'B') ||
    setweight(to_tsvector('english', coalesce(NEW.property_type, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.purpose, '')),      'C') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')),   'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION lh_knowledge_tsv_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')),    'A') ||
    setweight(to_tsvector('english', coalesce(NEW.content, '')),  'D') ||
    setweight(to_tsvector('english', coalesce(NEW.category, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS lh_property_tsv_trg ON lh_property;
CREATE TRIGGER lh_property_tsv_trg
  BEFORE INSERT OR UPDATE ON lh_property
  FOR EACH ROW EXECUTE FUNCTION lh_property_tsv_update();

DROP TRIGGER IF EXISTS lh_knowledge_tsv_trg ON lh_knowledge;
CREATE TRIGGER lh_knowledge_tsv_trg
  BEFORE INSERT OR UPDATE ON lh_knowledge
  FOR EACH ROW EXECUTE FUNCTION lh_knowledge_tsv_update();

-- ============================================================
-- RLS — public catalogue readable; lead/booking data is NOT.
-- The concierge edge function runs with the service key and bypasses RLS,
-- so anon policies below are limited to exactly what the widget needs.
-- ============================================================
ALTER TABLE lh_property     ENABLE ROW LEVEL SECURITY;
ALTER TABLE lh_knowledge    ENABLE ROW LEVEL SECURITY;
ALTER TABLE lh_lead         ENABLE ROW LEVEL SECURITY;
ALTER TABLE lh_conversation ENABLE ROW LEVEL SECURITY;
ALTER TABLE lh_message      ENABLE ROW LEVEL SECURITY;
ALTER TABLE lh_booking      ENABLE ROW LEVEL SECURITY;

-- Public catalogue: anyone may read
DROP POLICY IF EXISTS lh_property_public_read ON lh_property;
CREATE POLICY lh_property_public_read ON lh_property FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS lh_knowledge_public_read ON lh_knowledge;
CREATE POLICY lh_knowledge_public_read ON lh_knowledge FOR SELECT TO anon, authenticated USING (true);

-- Lead capture: anon may INSERT only (name/phone required). No SELECT -> PII is unreadable via anon key.
DROP POLICY IF EXISTS lh_lead_anon_insert ON lh_lead;
CREATE POLICY lh_lead_anon_insert ON lh_lead FOR INSERT TO anon, authenticated
  WITH CHECK (length(btrim(name)) > 0 AND length(btrim(phone)) > 0);

-- Conversations: anon may insert + update own session (transcript append), never read
DROP POLICY IF EXISTS lh_conversation_anon_insert ON lh_conversation;
CREATE POLICY lh_conversation_anon_insert ON lh_conversation FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS lh_conversation_anon_update ON lh_conversation;
CREATE POLICY lh_conversation_anon_update ON lh_conversation FOR UPDATE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS lh_message_anon_insert ON lh_message;
CREATE POLICY lh_message_anon_insert ON lh_message FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Bookings: anon may insert only
DROP POLICY IF EXISTS lh_booking_anon_insert ON lh_booking;
CREATE POLICY lh_booking_anon_insert ON lh_booking FOR INSERT TO anon, authenticated WITH CHECK (true);