-- Specsy mini-pc product INSERT SQL generated on 2026-06-19
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
SELECT (SELECT COALESCE(MAX(id), 0) + 1 FROM am_pc_data), 'MiniPC', NULL, 'MINISFORUM', 'MINISFORUM UM880Plus AMD Ryzen 7 8845HS Mini PC 32GB 1TB Windows 11 Pro Radeon 780M', '新品', 'UNKNOWN', false, false, 123199, 123199, 'Ryzen 7 8845HS', 'Radeon 780M', 'integrated', 4, false, 32, 1024, NULL, NULL, NULL, 'https://www.amazon.co.jp/dp/B0FVFVWNRD', 'https://www.amazon.co.jp/dp/B0FVFVWNRD?tag=nmsuteado2-22&linkCode=osi&th=1&psc=1', NULL, NULL, '2026-06-19', true
WHERE NOT EXISTS (SELECT 1 FROM am_pc_data WHERE (url ILIKE '%B0FVFVWNRD%' OR af_url ILIKE '%B0FVFVWNRD%'));

INSERT INTO am_pc_data (id, form_factor, display_size, brand, name, condition_label, availability, is_used, is_refurbished, price, real_price, cpu, gpu, gpu_class, gpu_score, has_dgpu, ram, rom, battery, battery_wh_normalized, weight, url, af_url, img_url, imp_img_url, fetched_at, is_active)
SELECT (SELECT COALESCE(MAX(id), 0) + 1 FROM am_pc_data), 'MiniPC', NULL, 'MINISFORUM', 'MINISFORUM X1 Lite-255 AMD Ryzen 7 255 Mini PC 32GB 1TB Windows 11 Pro Radeon 780M', '新品', 'UNKNOWN', false, false, 129980, 129980, 'Ryzen 7 170', 'Radeon 780M', 'integrated', 4, false, 32, 1024, NULL, NULL, NULL, 'https://www.amazon.co.jp/dp/B0GQRXTXZ2', 'https://www.amazon.co.jp/dp/B0GQRXTXZ2?tag=nmsuteado2-22&linkCode=osi&th=1&psc=1', NULL, NULL, '2026-06-19', true
WHERE NOT EXISTS (SELECT 1 FROM am_pc_data WHERE (url ILIKE '%B0GQRXTXZ2%' OR af_url ILIKE '%B0GQRXTXZ2%'));

INSERT INTO am_pc_data (id, form_factor, display_size, brand, name, condition_label, availability, is_used, is_refurbished, price, real_price, cpu, gpu, gpu_class, gpu_score, has_dgpu, ram, rom, battery, battery_wh_normalized, weight, url, af_url, img_url, imp_img_url, fetched_at, is_active)
SELECT (SELECT COALESCE(MAX(id), 0) + 1 FROM am_pc_data), 'MiniPC', NULL, 'Beelink', 'Beelink SER8 AMD Ryzen 7 8745HS Mini PC 24GB 1TB Windows 11 Radeon 780M', '新品', 'UNKNOWN', false, false, 92980, 92980, 'Ryzen 7 8845HS', 'Radeon 780M', 'integrated', 4, false, 24, 1024, NULL, NULL, NULL, 'https://www.amazon.co.jp/dp/B0DLFXVH8G', 'https://www.amazon.co.jp/dp/B0DLFXVH8G?tag=nmsuteado2-22&linkCode=osi&th=1&psc=1', NULL, NULL, '2026-06-19', true
WHERE NOT EXISTS (SELECT 1 FROM am_pc_data WHERE (url ILIKE '%B0DLFXVH8G%' OR af_url ILIKE '%B0DLFXVH8G%'));

INSERT INTO am_pc_data (id, form_factor, display_size, brand, name, condition_label, availability, is_used, is_refurbished, price, real_price, cpu, gpu, gpu_class, gpu_score, has_dgpu, ram, rom, battery, battery_wh_normalized, weight, url, af_url, img_url, imp_img_url, fetched_at, is_active)
SELECT (SELECT COALESCE(MAX(id), 0) + 1 FROM am_pc_data), 'MiniPC', NULL, 'GMKtec', 'GMKtec Mini PC N100 Windows 11 Pro 16GB 1TB Intel UHD Graphics', '新品', 'UNKNOWN', false, false, 26980, 26980, 'N100', 'Intel UHD Graphics', 'integrated', 2, false, 16, 1024, NULL, NULL, NULL, 'https://www.amazon.co.jp/dp/B0CXPNHHNW', 'https://www.amazon.co.jp/dp/B0CXPNHHNW?tag=nmsuteado2-22&linkCode=osi&th=1&psc=1', NULL, NULL, '2026-06-19', true
WHERE NOT EXISTS (SELECT 1 FROM am_pc_data WHERE (url ILIKE '%B0CXPNHHNW%' OR af_url ILIKE '%B0CXPNHHNW%'));

INSERT INTO am_pc_data (id, form_factor, display_size, brand, name, condition_label, availability, is_used, is_refurbished, price, real_price, cpu, gpu, gpu_class, gpu_score, has_dgpu, ram, rom, battery, battery_wh_normalized, weight, url, af_url, img_url, imp_img_url, fetched_at, is_active)
SELECT (SELECT COALESCE(MAX(id), 0) + 1 FROM am_pc_data), 'MiniPC', NULL, 'AskHand', 'AskHand Mini PC N100 Windows 11 16GB 512GB Intel UHD Graphics', '新品', 'UNKNOWN', false, false, 22980, 22980, 'N100', 'Intel UHD Graphics', 'integrated', 2, false, 16, 512, NULL, NULL, NULL, 'https://www.amazon.co.jp/dp/B0C9DSY4MC', 'https://www.amazon.co.jp/dp/B0C9DSY4MC?tag=nmsuteado2-22&linkCode=osi&th=1&psc=1', NULL, NULL, '2026-06-19', true
WHERE NOT EXISTS (SELECT 1 FROM am_pc_data WHERE (url ILIKE '%B0C9DSY4MC%' OR af_url ILIKE '%B0C9DSY4MC%'));

INSERT INTO am_pc_data (id, form_factor, display_size, brand, name, condition_label, availability, is_used, is_refurbished, price, real_price, cpu, gpu, gpu_class, gpu_score, has_dgpu, ram, rom, battery, battery_wh_normalized, weight, url, af_url, img_url, imp_img_url, fetched_at, is_active)
SELECT (SELECT COALESCE(MAX(id), 0) + 1 FROM am_pc_data), 'MiniPC', NULL, 'Beelink', 'Beelink SER5 Ryzen 5 5500U Mini PC 32GB 500GB Windows 11 Radeon Graphics', '新品', 'UNKNOWN', false, false, 59980, 59980, 'Ryzen 5', 'Integrated', 'integrated', 2, false, 32, 500, NULL, NULL, NULL, 'https://www.amazon.co.jp/dp/B0FHGRM8ZF', 'https://www.amazon.co.jp/dp/B0FHGRM8ZF?tag=nmsuteado2-22&linkCode=osi&th=1&psc=1', NULL, NULL, '2026-06-19', true
WHERE NOT EXISTS (SELECT 1 FROM am_pc_data WHERE (url ILIKE '%B0FHGRM8ZF%' OR af_url ILIKE '%B0FHGRM8ZF%'));

COMMIT;
