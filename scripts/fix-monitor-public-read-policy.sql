-- Fix /api/monitor-list returning [] after monitor rows were inserted.
-- Run this in Supabase SQL Editor for the same project used by production.

BEGIN;

ALTER TABLE public.am_monitor_data ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.am_monitor_data TO anon, authenticated;

DROP POLICY IF EXISTS "Allow public read active monitor products" ON public.am_monitor_data;
CREATE POLICY "Allow public read active monitor products"
  ON public.am_monitor_data
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

COMMIT;

SELECT
  COUNT(*) AS total_rows,
  COUNT(*) FILTER (WHERE is_active = true) AS active_rows
FROM public.am_monitor_data;
