-- Androidタブレット/iPad比較用の商品テーブル
-- 実行例: Supabase SQL Editorでこのファイルを実行

CREATE TABLE IF NOT EXISTS am_tablet_data (
  id BIGSERIAL PRIMARY KEY,
  asin TEXT UNIQUE,
  brand TEXT,
  name TEXT,
  series TEXT,
  os_family TEXT CHECK (os_family IN ('android', 'ipad')),
  os_version TEXT,
  soc TEXT,
  soc_score INTEGER CHECK (soc_score IS NULL OR (soc_score >= 0 AND soc_score <= 35)),
  ram_gb NUMERIC,
  rom_gb NUMERIC,
  display_size_inch NUMERIC,
  resolution TEXT,
  refresh_rate_hz INTEGER,
  battery_life_hours NUMERIC,
  battery_capacity_mah INTEGER,
  weight_g INTEGER,
  has_cellular BOOLEAN,
  price INTEGER,
  real_price INTEGER,
  url TEXT,
  af_url TEXT,
  img_url TEXT,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_am_tablet_data_active_price
  ON am_tablet_data (is_active, real_price, price);

CREATE INDEX IF NOT EXISTS idx_am_tablet_data_os_family
  ON am_tablet_data (os_family);

ALTER TABLE am_tablet_data ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'am_tablet_data'
      AND policyname = 'Allow public read access to active tablets'
  ) THEN
    CREATE POLICY "Allow public read access to active tablets"
      ON am_tablet_data
      FOR SELECT
      USING (is_active = true);
  END IF;
END $$;
