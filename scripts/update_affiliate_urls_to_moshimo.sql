-- Specsy affiliate URL normalization generated on 2026-06-22
-- Purpose: store Moshimo Amazon click URLs in af_url for all product tables.
-- Keep url as the plain Amazon product URL for ASIN extraction and diagnostics.

BEGIN;

WITH pc_targets AS (
  SELECT
    id,
    COALESCE(
      substring(url from '/dp/([A-Z0-9]{10})'),
      substring(af_url from '/dp/([A-Z0-9]{10})'),
      substring(af_url from '%2Fdp%2F([A-Z0-9]{10})'),
      substring(af_url from 'url=https%3A%2F%2Fwww.amazon.co.jp%2Fdp%2F([A-Z0-9]{10})')
    ) AS asin
  FROM am_pc_data
)
UPDATE am_pc_data AS product
SET af_url = 'https://af.moshimo.com/af/c/click?a_id=5146445&p_id=170&pc_id=185&pl_id=4062&url=https%3A%2F%2Fwww.amazon.co.jp%2Fdp%2F' || pc_targets.asin
FROM pc_targets
WHERE product.id = pc_targets.id
  AND pc_targets.asin IS NOT NULL
  AND product.af_url IS DISTINCT FROM 'https://af.moshimo.com/af/c/click?a_id=5146445&p_id=170&pc_id=185&pl_id=4062&url=https%3A%2F%2Fwww.amazon.co.jp%2Fdp%2F' || pc_targets.asin;

WITH monitor_targets AS (
  SELECT
    id,
    COALESCE(
      substring(url from '/dp/([A-Z0-9]{10})'),
      substring(af_url from '/dp/([A-Z0-9]{10})'),
      substring(af_url from '%2Fdp%2F([A-Z0-9]{10})'),
      substring(af_url from 'url=https%3A%2F%2Fwww.amazon.co.jp%2Fdp%2F([A-Z0-9]{10})')
    ) AS asin
  FROM am_monitor_data
)
UPDATE am_monitor_data AS product
SET af_url = 'https://af.moshimo.com/af/c/click?a_id=5146445&p_id=170&pc_id=185&pl_id=4062&url=https%3A%2F%2Fwww.amazon.co.jp%2Fdp%2F' || monitor_targets.asin
FROM monitor_targets
WHERE product.id = monitor_targets.id
  AND monitor_targets.asin IS NOT NULL
  AND product.af_url IS DISTINCT FROM 'https://af.moshimo.com/af/c/click?a_id=5146445&p_id=170&pc_id=185&pl_id=4062&url=https%3A%2F%2Fwww.amazon.co.jp%2Fdp%2F' || monitor_targets.asin;

WITH tablet_targets AS (
  SELECT
    id,
    COALESCE(
      asin,
      substring(url from '/dp/([A-Z0-9]{10})'),
      substring(af_url from '/dp/([A-Z0-9]{10})'),
      substring(af_url from '%2Fdp%2F([A-Z0-9]{10})'),
      substring(af_url from 'url=https%3A%2F%2Fwww.amazon.co.jp%2Fdp%2F([A-Z0-9]{10})')
    ) AS product_asin
  FROM am_tablet_data
)
UPDATE am_tablet_data AS product
SET af_url = 'https://af.moshimo.com/af/c/click?a_id=5146445&p_id=170&pc_id=185&pl_id=4062&url=https%3A%2F%2Fwww.amazon.co.jp%2Fdp%2F' || tablet_targets.product_asin
FROM tablet_targets
WHERE product.id = tablet_targets.id
  AND tablet_targets.product_asin IS NOT NULL
  AND product.af_url IS DISTINCT FROM 'https://af.moshimo.com/af/c/click?a_id=5146445&p_id=170&pc_id=185&pl_id=4062&url=https%3A%2F%2Fwww.amazon.co.jp%2Fdp%2F' || tablet_targets.product_asin;

COMMIT;
