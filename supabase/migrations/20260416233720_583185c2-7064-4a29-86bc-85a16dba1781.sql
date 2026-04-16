
CREATE TABLE public.price_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL UNIQUE,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  type TEXT NOT NULL,
  year_bucket INT NOT NULL,
  km_bucket INT NOT NULL,
  min_price INT NOT NULL,
  max_price INT NOT NULL,
  recommended_price INT NOT NULL,
  reasoning TEXT NOT NULL,
  sample_size INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours')
);

CREATE INDEX idx_price_suggestions_cache_key ON public.price_suggestions(cache_key);
CREATE INDEX idx_price_suggestions_expires ON public.price_suggestions(expires_at);

ALTER TABLE public.price_suggestions ENABLE ROW LEVEL SECURITY;

-- Anyone can read cached suggestions (no PII)
CREATE POLICY "Anyone can read price suggestions"
  ON public.price_suggestions FOR SELECT
  USING (true);

-- Writes happen only via service role in edge function (no INSERT/UPDATE/DELETE policy = denied to clients)
