-- Specsy generic CPU model UPDATE SQL generated on 2026-06-19
-- Purpose: replace broad CPU labels such as `Ryzen 5` with the specific model found in the current product listing.
-- Review candidates before running this in Supabase SQL Editor.
-- Guarded by id + current broad cpu label + ASIN in url/af_url.

BEGIN;

UPDATE am_pc_data
SET cpu = 'Core i3-6100U'
WHERE id = 66
  AND cpu = 'Core i3'
  AND (url ILIKE '%B0H11LDFRX%' OR af_url ILIKE '%B0H11LDFRX%');

UPDATE am_pc_data
SET cpu = 'Ryzen 7 170'
WHERE id = 68
  AND cpu = 'Ryzen 7'
  AND (url ILIKE '%B0G6CFC2Z2%' OR af_url ILIKE '%B0G6CFC2Z2%');

UPDATE am_pc_data
SET cpu = 'Core i5-1334U'
WHERE id = 71
  AND cpu = 'Core i5'
  AND (url ILIKE '%B0G57XGX81%' OR af_url ILIKE '%B0G57XGX81%');

UPDATE am_pc_data
SET cpu = 'Core i5-8210Y'
WHERE id = 72
  AND cpu = 'Core i5'
  AND (url ILIKE '%B0G3X4V2VK%' OR af_url ILIKE '%B0G3X4V2VK%');

UPDATE am_pc_data
SET cpu = 'Core i7-5500U'
WHERE id = 73
  AND cpu = 'Core i7'
  AND (url ILIKE '%B0G3NRDBK6%' OR af_url ILIKE '%B0G3NRDBK6%');

UPDATE am_pc_data
SET cpu = 'Ryzen 5 3550H'
WHERE id = 75
  AND cpu = 'Ryzen 5'
  AND (url ILIKE '%B0FGXL4BTS%' OR af_url ILIKE '%B0FGXL4BTS%');

UPDATE am_pc_data
SET cpu = 'Ryzen 5 3500U'
WHERE id = 76
  AND cpu = 'Ryzen 5'
  AND (url ILIKE '%B0G3NRKMJS%' OR af_url ILIKE '%B0G3NRKMJS%');

UPDATE am_pc_data
SET cpu = 'Ryzen 5 7530U'
WHERE id = 77
  AND cpu = 'Ryzen 5'
  AND (url ILIKE '%B0FCCM4TX1%' OR af_url ILIKE '%B0FCCM4TX1%');

UPDATE am_pc_data
SET cpu = 'Ryzen 5 40'
WHERE id = 78
  AND cpu = 'Ryzen 5'
  AND (url ILIKE '%B0GL1N6RCH%' OR af_url ILIKE '%B0GL1N6RCH%');

UPDATE am_pc_data
SET cpu = 'Ryzen 5 7520U'
WHERE id = 79
  AND cpu = 'Ryzen 5'
  AND (url ILIKE '%B0GGBBN53G%' OR af_url ILIKE '%B0GGBBN53G%');

UPDATE am_pc_data
SET cpu = 'Ryzen 5 7520U'
WHERE id = 80
  AND cpu = 'Ryzen 5'
  AND (url ILIKE '%B0GY8PLVC1%' OR af_url ILIKE '%B0GY8PLVC1%');

UPDATE am_pc_data
SET cpu = 'Ryzen 7 7730U'
WHERE id = 81
  AND cpu = 'Ryzen 7'
  AND (url ILIKE '%B0FCCMLDDM%' OR af_url ILIKE '%B0FCCMLDDM%');

UPDATE am_pc_data
SET cpu = 'Ryzen 7 7735HS'
WHERE id = 82
  AND cpu = 'Ryzen 7'
  AND (url ILIKE '%B0GGBVBCJM%' OR af_url ILIKE '%B0GGBVBCJM%');

UPDATE am_pc_data
SET cpu = 'Ryzen 7 8840HS'
WHERE id = 83
  AND cpu = 'Ryzen 7'
  AND (url ILIKE '%B0GGBQ79JM%' OR af_url ILIKE '%B0GGBQ79JM%');

UPDATE am_pc_data
SET cpu = 'Ryzen 7 170'
WHERE id = 84
  AND cpu = 'Ryzen 7'
  AND (url ILIKE '%B0G6CY1J9Z%' OR af_url ILIKE '%B0G6CY1J9Z%');

-- Not updated: the current product text does not expose a reliable detailed CPU model.
-- id=69 ASIN=B0GZKJMMDR cpu=Core i3
-- id=70 ASIN=B0FW4DV6V4 cpu=Core i5
-- id=74 ASIN=B0H2PG6QHC cpu=Core i7

COMMIT;
