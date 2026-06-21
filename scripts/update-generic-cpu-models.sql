-- Specsy generic CPU model UPDATE SQL generated on 2026-06-20
-- Purpose:
--   1. Replace broad CPU labels such as `Core i7` / `Ryzen 7` with exact models.
--   2. Deactivate rows whose product text exposes only a CPU generation/family,
--      because their benchmark score cannot be measured reliably.
-- Guarded by id/current cpu label and ASIN in url/af_url where available.

BEGIN;

-- Exact CPU model fixes.
UPDATE am_pc_data
SET cpu = 'Core i3-6100U'
WHERE id = 66
  AND cpu = 'Core i3'
  AND (url ILIKE '%B0H11LDFRX%' OR af_url ILIKE '%B0H11LDFRX%');

UPDATE am_pc_data
SET cpu = 'Core Ultra 5 125H'
WHERE id = 67
  AND cpu = 'Core Ultra 5'
  AND (url ILIKE '%B0FQ6PCF9R%' OR af_url ILIKE '%B0FQ6PCF9R%');

UPDATE am_pc_data
SET cpu = 'Ryzen 7 170'
WHERE id = 68
  AND cpu = 'Ryzen 7'
  AND (url ILIKE '%B0G6CFC2Z2%' OR af_url ILIKE '%B0G6CFC2Z2%');

UPDATE am_pc_data
SET cpu = 'Core i3-6100U'
WHERE id = 69
  AND cpu = 'Core i3'
  AND (url ILIKE '%B0GZKJMMDR%' OR af_url ILIKE '%B0GZKJMMDR%');

UPDATE am_pc_data
SET cpu = 'Core i5-1335U'
WHERE id = 70
  AND cpu = 'Core i5'
  AND (url ILIKE '%B0FW4DV6V4%' OR af_url ILIKE '%B0FW4DV6V4%');

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
SET cpu = 'Core i7-6600U'
WHERE id = 74
  AND cpu = 'Core i7'
  AND (url ILIKE '%B0H2PG6QHC%' OR af_url ILIKE '%B0H2PG6QHC%');

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

UPDATE am_pc_data
SET cpu = 'Core i5-5300U'
WHERE id = 94
  AND cpu = 'Core i5'
  AND (url ILIKE '%B0G3WJXJ7B%' OR af_url ILIKE '%B0G3WJXJ7B%');

UPDATE am_pc_data
SET cpu = 'Core i5-7200U'
WHERE id = 100
  AND cpu = 'Core i5'
  AND (url ILIKE '%B0H2YLBCPK%' OR af_url ILIKE '%B0H2YLBCPK%');

UPDATE am_pc_data
SET cpu = 'Ryzen 7 PRO 8845HS'
WHERE id = 132
  AND cpu = 'Ryzen 7'
  AND (url ILIKE '%B0H23V52NQ%' OR af_url ILIKE '%B0H23V52NQ%');

-- Rows to keep out of scoring until the exact CPU model is confirmed.
UPDATE am_pc_data
SET is_active = false
WHERE id = 98
  AND cpu = 'Core i5'
  AND (url ILIKE '%B0GZPTS1HQ%' OR af_url ILIKE '%B0GZPTS1HQ%');

UPDATE am_pc_data
SET is_active = false
WHERE id = 134
  AND cpu = 'Core i5'
  AND (url ILIKE '%B0C2PYPLCR%' OR af_url ILIKE '%B0C2PYPLCR%');

UPDATE am_pc_data
SET is_active = false
WHERE id = 136
  AND cpu = 'Core i7'
  AND (url ILIKE '%B0GZVT8ZB2%' OR af_url ILIKE '%B0GZVT8ZB2%');

UPDATE am_pc_data
SET is_active = false
WHERE id = 138
  AND cpu = 'Core i5'
  AND (url ILIKE '%B0G18PFV8V%' OR af_url ILIKE '%B0G18PFV8V%');

UPDATE am_pc_data
SET is_active = false
WHERE id = 139
  AND cpu = 'Core i5'
  AND (url ILIKE '%B0H3V947MT%' OR af_url ILIKE '%B0H3V947MT%');

COMMIT;
