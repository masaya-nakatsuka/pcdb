# Category product SQL generation

Use this when adding products for `/pc-list/mini-pc`, `/pc-list/desktop`, or `/monitor-list`.

1. Put Amazon Creators API credentials in `.env.amazon`.

```bash
cp .env.amazon.example .env.amazon
```

2. Dry-run candidates first.

```bash
python3 scripts/generate-category-products.py monitor --dry-run
python3 scripts/generate-category-products.py mini-pc --dry-run
python3 scripts/generate-category-products.py desktop-pc --dry-run
```

3. Generate SQL after checking the candidate list.

```bash
python3 scripts/generate-category-products.py monitor --max-add 20
python3 scripts/generate-category-products.py mini-pc --max-add 20
python3 scripts/generate-category-products.py desktop-pc --max-add 20
```

4. Validate generated SQL before opening Supabase.

```bash
python3 scripts/validate-category-products-sql.py \
  scripts/insert_monitor_products.sql \
  scripts/insert_mini_pc_products.sql \
  scripts/insert_desktop_pc_products.sql
```

5. For monitors, run `scripts/create-monitor-data-table.sql` in Supabase SQL Editor before running `scripts/insert_monitor_products.sql`.

6. Check production after deploy or DB insertion.

```bash
python3 scripts/check-category-pages.py
python3 scripts/check-category-pages.py --expect-data
npm run production:check
npm run production:check -- --expect-category-data
```

The generated SQL skips rows when the ASIN already appears in `url` or `af_url`.

`production:check` also verifies the home page, cafe PC API rows, product-link URLs, and the deployed external-link marker CSS/JS assets.
