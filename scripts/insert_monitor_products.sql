-- Specsy monitor product INSERT SQL generated on 2026-06-19
-- Run scripts/create-monitor-data-table.sql first.
-- Manual-review seed generated without PA-API credentials; review prices before running in Supabase SQL Editor.
BEGIN;

INSERT INTO am_monitor_data (brand, name, size_inch, resolution, refresh_rate_hz, panel_type, has_usb_c, usb_c_power_delivery_w, price, real_price, url, af_url, img_url, fetched_at, is_active)
SELECT 'Dell', 'Dell S2725QC-A 27-inch 4K USB-C Monitor 120Hz IPS 65W', 27, '3840x2160', 120, 'IPS', true, 65, 44646, 44646, 'https://www.amazon.co.jp/dp/B0F23FWBJL', 'https://www.amazon.co.jp/dp/B0F23FWBJL?tag=nmsuteado2-22&linkCode=osi&th=1&psc=1', NULL, '2026-06-19', true
WHERE NOT EXISTS (SELECT 1 FROM am_monitor_data WHERE (url ILIKE '%B0F23FWBJL%' OR af_url ILIKE '%B0F23FWBJL%'));

INSERT INTO am_monitor_data (brand, name, size_inch, resolution, refresh_rate_hz, panel_type, has_usb_c, usb_c_power_delivery_w, price, real_price, url, af_url, img_url, fetched_at, is_active)
SELECT 'Dell', 'Dell S2725DS-A 27-inch QHD Monitor 100Hz IPS', 27, '2560x1440', 100, 'IPS', false, NULL, 34800, 34800, 'https://www.amazon.co.jp/dp/B0CXXKGVYK', 'https://www.amazon.co.jp/dp/B0CXXKGVYK?tag=nmsuteado2-22&linkCode=osi&th=1&psc=1', NULL, '2026-06-19', true
WHERE NOT EXISTS (SELECT 1 FROM am_monitor_data WHERE (url ILIKE '%B0CXXKGVYK%' OR af_url ILIKE '%B0CXXKGVYK%'));

INSERT INTO am_monitor_data (brand, name, size_inch, resolution, refresh_rate_hz, panel_type, has_usb_c, usb_c_power_delivery_w, price, real_price, url, af_url, img_url, fetched_at, is_active)
SELECT 'JAPANNEXT', 'JAPANNEXT JN-IPS27Q-C6 27-inch WQHD USB-C Monitor 100Hz IPS 65W', 27, '2560x1440', 100, 'IPS', true, 65, 33980, 33980, 'https://www.amazon.co.jp/dp/B0FG2KB4D7', 'https://www.amazon.co.jp/dp/B0FG2KB4D7?tag=nmsuteado2-22&linkCode=osi&th=1&psc=1', NULL, '2026-06-19', true
WHERE NOT EXISTS (SELECT 1 FROM am_monitor_data WHERE (url ILIKE '%B0FG2KB4D7%' OR af_url ILIKE '%B0FG2KB4D7%'));

INSERT INTO am_monitor_data (brand, name, size_inch, resolution, refresh_rate_hz, panel_type, has_usb_c, usb_c_power_delivery_w, price, real_price, url, af_url, img_url, fetched_at, is_active)
SELECT 'JAPANNEXT', 'JAPANNEXT JN-i245G144F 24.5-inch FHD Gaming Monitor 144Hz IPS', 24.5, '1920x1080', 144, 'IPS', false, NULL, 19980, 19980, 'https://www.amazon.co.jp/dp/B0F4X5M6CV', 'https://www.amazon.co.jp/dp/B0F4X5M6CV?tag=nmsuteado2-22&linkCode=osi&th=1&psc=1', NULL, '2026-06-19', true
WHERE NOT EXISTS (SELECT 1 FROM am_monitor_data WHERE (url ILIKE '%B0F4X5M6CV%' OR af_url ILIKE '%B0F4X5M6CV%'));

INSERT INTO am_monitor_data (brand, name, size_inch, resolution, refresh_rate_hz, panel_type, has_usb_c, usb_c_power_delivery_w, price, real_price, url, af_url, img_url, fetched_at, is_active)
SELECT 'PHILIPS', 'PHILIPS 24E1N2300AE 23.8-inch FHD USB-C Monitor 120Hz IPS 65W', 23.8, '1920x1080', 120, 'IPS', true, 65, 18300, 18300, 'https://www.amazon.co.jp/dp/B0FCQPC9FQ', 'https://www.amazon.co.jp/dp/B0FCQPC9FQ?tag=nmsuteado2-22&linkCode=osi&th=1&psc=1', NULL, '2026-06-19', true
WHERE NOT EXISTS (SELECT 1 FROM am_monitor_data WHERE (url ILIKE '%B0FCQPC9FQ%' OR af_url ILIKE '%B0FCQPC9FQ%'));

INSERT INTO am_monitor_data (brand, name, size_inch, resolution, refresh_rate_hz, panel_type, has_usb_c, usb_c_power_delivery_w, price, real_price, url, af_url, img_url, fetched_at, is_active)
SELECT 'KOORUI', 'KOORUI N07 27-inch 4K Monitor 60Hz IPS', 27, '3840x2160', 60, 'IPS', false, NULL, 24800, 24800, 'https://www.amazon.co.jp/dp/B0CQ8RQBV8', 'https://www.amazon.co.jp/dp/B0CQ8RQBV8?tag=nmsuteado2-22&linkCode=osi&th=1&psc=1', NULL, '2026-06-19', true
WHERE NOT EXISTS (SELECT 1 FROM am_monitor_data WHERE (url ILIKE '%B0CQ8RQBV8%' OR af_url ILIKE '%B0CQ8RQBV8%'));

COMMIT;
