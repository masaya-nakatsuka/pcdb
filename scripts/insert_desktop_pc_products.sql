-- Specsy desktop-pc product INSERT SQL generated on 2026-06-19
-- Manual-review seed generated without PA-API credentials; review prices before running in Supabase SQL Editor.
BEGIN;

ALTER TABLE am_pc_data ADD COLUMN IF NOT EXISTS condition_label text;
ALTER TABLE am_pc_data ADD COLUMN IF NOT EXISTS availability text;
ALTER TABLE am_pc_data ADD COLUMN IF NOT EXISTS is_used boolean DEFAULT false;
ALTER TABLE am_pc_data ADD COLUMN IF NOT EXISTS is_refurbished boolean DEFAULT false;
ALTER TABLE am_pc_data ADD COLUMN IF NOT EXISTS gpu text;
ALTER TABLE am_pc_data ADD COLUMN IF NOT EXISTS gpu_class text;
ALTER TABLE am_pc_data ADD COLUMN IF NOT EXISTS gpu_score integer;
ALTER TABLE am_pc_data ADD COLUMN IF NOT EXISTS has_dgpu boolean DEFAULT false;

INSERT INTO am_pc_data (id, form_factor, display_size, brand, name, condition_label, availability, is_used, is_refurbished, price, real_price, cpu, gpu, gpu_class, gpu_score, has_dgpu, ram, rom, battery, battery_wh_normalized, weight, url, af_url, img_url, imp_img_url, fetched_at, is_active)
SELECT (SELECT COALESCE(MAX(id), 0) + 1 FROM am_pc_data), 'Desktop', NULL, 'NEWLEAGUE', 'NEWLEAGUE Desktop PC Core i5-14400 16GB 512GB Windows 11 Pro Slim Tower', '新品', 'UNKNOWN', false, false, 99800, 99800, 'Core i5', 'Integrated', 'integrated', 2, false, 16, 512, NULL, NULL, NULL, 'https://www.amazon.co.jp/dp/B0F28KWT5P', 'https://www.amazon.co.jp/dp/B0F28KWT5P?tag=nmsuteado2-22&linkCode=osi&th=1&psc=1', NULL, NULL, '2026-06-19', true
WHERE NOT EXISTS (SELECT 1 FROM am_pc_data WHERE (url ILIKE '%B0F28KWT5P%' OR af_url ILIKE '%B0F28KWT5P%'));

INSERT INTO am_pc_data (id, form_factor, display_size, brand, name, condition_label, availability, is_used, is_refurbished, price, real_price, cpu, gpu, gpu_class, gpu_score, has_dgpu, ram, rom, battery, battery_wh_normalized, weight, url, af_url, img_url, imp_img_url, fetched_at, is_active)
SELECT (SELECT COALESCE(MAX(id), 0) + 1 FROM am_pc_data), 'Desktop', NULL, 'NEWLEAGUE', 'NEWLEAGUE Desktop PC Ryzen 5 5600GT 16GB 512GB Windows 11 Pro Middle Tower', '新品', 'UNKNOWN', false, false, 79800, 79800, 'Ryzen 5', 'Integrated', 'integrated', 2, false, 16, 512, NULL, NULL, NULL, 'https://www.amazon.co.jp/dp/B0FQB5359D', 'https://www.amazon.co.jp/dp/B0FQB5359D?tag=nmsuteado2-22&linkCode=osi&th=1&psc=1', NULL, NULL, '2026-06-19', true
WHERE NOT EXISTS (SELECT 1 FROM am_pc_data WHERE (url ILIKE '%B0FQB5359D%' OR af_url ILIKE '%B0FQB5359D%'));

INSERT INTO am_pc_data (id, form_factor, display_size, brand, name, condition_label, availability, is_used, is_refurbished, price, real_price, cpu, gpu, gpu_class, gpu_score, has_dgpu, ram, rom, battery, battery_wh_normalized, weight, url, af_url, img_url, imp_img_url, fetched_at, is_active)
SELECT (SELECT COALESCE(MAX(id), 0) + 1 FROM am_pc_data), 'Desktop', NULL, 'NEWLEAGUE', 'NEWLEAGUE Gaming Desktop PC Ryzen 5 5500 RTX 3050 16GB 512GB Windows 11 Pro', '新品', 'UNKNOWN', false, false, 119800, 119800, 'Ryzen 5', 'RTX 3050', 'dgpu', 6, true, 16, 512, NULL, NULL, NULL, 'https://www.amazon.co.jp/dp/B0CQSRWLRG', 'https://www.amazon.co.jp/dp/B0CQSRWLRG?tag=nmsuteado2-22&linkCode=osi&th=1&psc=1', NULL, NULL, '2026-06-19', true
WHERE NOT EXISTS (SELECT 1 FROM am_pc_data WHERE (url ILIKE '%B0CQSRWLRG%' OR af_url ILIKE '%B0CQSRWLRG%'));

INSERT INTO am_pc_data (id, form_factor, display_size, brand, name, condition_label, availability, is_used, is_refurbished, price, real_price, cpu, gpu, gpu_class, gpu_score, has_dgpu, ram, rom, battery, battery_wh_normalized, weight, url, af_url, img_url, imp_img_url, fetched_at, is_active)
SELECT (SELECT COALESCE(MAX(id), 0) + 1 FROM am_pc_data), 'Desktop', NULL, 'NEWLEAGUE', 'NEWLEAGUE Gaming Desktop PC Core i5-12400F RTX 3060 16GB 512GB Windows 11 Pro', '新品', 'UNKNOWN', false, false, 139800, 139800, 'Core i5', 'RTX 3060', 'dgpu', 7, true, 16, 512, NULL, NULL, NULL, 'https://www.amazon.co.jp/dp/B0CQSR8PBS', 'https://www.amazon.co.jp/dp/B0CQSR8PBS?tag=nmsuteado2-22&linkCode=osi&th=1&psc=1', NULL, NULL, '2026-06-19', true
WHERE NOT EXISTS (SELECT 1 FROM am_pc_data WHERE (url ILIKE '%B0CQSR8PBS%' OR af_url ILIKE '%B0CQSR8PBS%'));

INSERT INTO am_pc_data (id, form_factor, display_size, brand, name, condition_label, availability, is_used, is_refurbished, price, real_price, cpu, gpu, gpu_class, gpu_score, has_dgpu, ram, rom, battery, battery_wh_normalized, weight, url, af_url, img_url, imp_img_url, fetched_at, is_active)
SELECT (SELECT COALESCE(MAX(id), 0) + 1 FROM am_pc_data), 'Desktop', NULL, 'mouse', 'mouse Desktop PC Core i5-13400 16GB 500GB Windows 11 Slim', '新品', 'UNKNOWN', false, false, 129800, 129800, 'Core i5', 'Integrated', 'integrated', 2, false, 16, 500, NULL, NULL, NULL, 'https://www.amazon.co.jp/dp/B0C539V73J', 'https://www.amazon.co.jp/dp/B0C539V73J?tag=nmsuteado2-22&linkCode=osi&th=1&psc=1', NULL, NULL, '2026-06-19', true
WHERE NOT EXISTS (SELECT 1 FROM am_pc_data WHERE (url ILIKE '%B0C539V73J%' OR af_url ILIKE '%B0C539V73J%'));

INSERT INTO am_pc_data (id, form_factor, display_size, brand, name, condition_label, availability, is_used, is_refurbished, price, real_price, cpu, gpu, gpu_class, gpu_score, has_dgpu, ram, rom, battery, battery_wh_normalized, weight, url, af_url, img_url, imp_img_url, fetched_at, is_active)
SELECT (SELECT COALESCE(MAX(id), 0) + 1 FROM am_pc_data), 'Desktop', NULL, 'NEWLEAGUE', 'NEWLEAGUE Desktop PC Core Ultra 7 265 16GB 512GB Windows 11 Pro Middle Tower', '新品', 'UNKNOWN', false, false, 159800, 159800, 'Core Ultra 7', 'Integrated', 'integrated', 2, false, 16, 512, NULL, NULL, NULL, 'https://www.amazon.co.jp/dp/B0G1Y9VKNL', 'https://www.amazon.co.jp/dp/B0G1Y9VKNL?tag=nmsuteado2-22&linkCode=osi&th=1&psc=1', NULL, NULL, '2026-06-19', true
WHERE NOT EXISTS (SELECT 1 FROM am_pc_data WHERE (url ILIKE '%B0G1Y9VKNL%' OR af_url ILIKE '%B0G1Y9VKNL%'));

COMMIT;
