-- Add product nutrition fields and metadata
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS ingredients TEXT,
  ADD COLUMN IF NOT EXISTS health_rating INTEGER,
  ADD COLUMN IF NOT EXISTS calories NUMERIC,
  ADD COLUMN IF NOT EXISTS fat NUMERIC,
  ADD COLUMN IF NOT EXISTS carbs NUMERIC,
  ADD COLUMN IF NOT EXISTS protein NUMERIC,
  ADD COLUMN IF NOT EXISTS sodium NUMERIC;

-- Ensure health_rating is between 1 and 3
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'products_health_rating_range'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_health_rating_range
      CHECK (health_rating IS NULL OR health_rating BETWEEN 1 AND 3);
  END IF;
END $$;