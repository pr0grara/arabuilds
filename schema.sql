-- D1 schema for contractor intake submissions.
-- Apply with:  npx wrangler d1 execute arabuilds-intake --file=./schema.sql --remote
CREATE TABLE IF NOT EXISTS intakes (
  id                     INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at             TEXT NOT NULL,          -- ISO 8601 UTC
  business_name          TEXT,
  contact_name           TEXT,
  phone                  TEXT,
  email                  TEXT,
  main_trade             TEXT,
  business_stage         TEXT,
  main_goal              TEXT,
  area_current           TEXT,
  classification         TEXT,                   -- Foundation / Growth / Operator / Not Ready
  classification_reasons TEXT,
  data                   TEXT NOT NULL           -- full submission as JSON
);

CREATE INDEX IF NOT EXISTS idx_intakes_created     ON intakes (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_intakes_class       ON intakes (classification);
CREATE INDEX IF NOT EXISTS idx_intakes_trade       ON intakes (main_trade);
