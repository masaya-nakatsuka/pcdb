# Category product SQL generation

Use this when adding products for `/pc-list/mini-pc`, `/pc-list/desktop`, or `/monitor-list`.

1. Put Amazon Creators API credentials in `.env.amazon`.

```bash
cp .env.amazon.example .env.amazon
npm run category:ready -- --skip-production
```

2. Dry-run candidates first.

```bash
npm run category:test
python3 scripts/generate-category-products.py monitor --dry-run --review-output scripts/review_monitor_products.csv
python3 scripts/generate-category-products.py mini-pc --dry-run --review-output scripts/review_mini_pc_products.csv
python3 scripts/generate-category-products.py desktop-pc --dry-run --review-output scripts/review_desktop_pc_products.csv
npm run category:review
npm run category:ready -- --skip-production
```

3. Generate SQL after checking the candidate list.

```bash
python3 scripts/generate-category-products.py monitor --max-add 20
python3 scripts/generate-category-products.py mini-pc --max-add 20
python3 scripts/generate-category-products.py desktop-pc --max-add 20
```

The generator writes the matching `scripts/review_*_products.csv` automatically when it writes SQL, then validates both outputs. It exits without writing SQL or an automatic review CSV when no valid candidates are found. Run the dry-run command first if you need to tune keywords or filters.

4. Re-validate generated SQL and matching review CSVs before opening Supabase.

```bash
python3 scripts/validate-category-products-sql.py \
  scripts/insert_monitor_products.sql \
  scripts/insert_mini_pc_products.sql \
  scripts/insert_desktop_pc_products.sql
npm run category:ready -- --skip-production
```

5. For monitors, run `scripts/create-monitor-data-table.sql` in Supabase SQL Editor before running `scripts/insert_monitor_products.sql`.

6. Check production after deploy or DB insertion.

```bash
python3 scripts/check-category-pages.py
python3 scripts/check-category-pages.py --expect-data
npm run production:check
npm run production:check -- --expect-category-data
npm run category:ready -- --expect-data
```

The generated SQL skips rows when the ASIN already appears in `url` or `af_url`.
Use the review CSV to check ASINs, prices, inferred specs, and accidental accessories before running generated SQL in Supabase. Regenerate the SQL and review CSV together when you change keywords, max rows, or category filters; the default non-dry-run command does this automatically.

`production:check` also verifies the home page, cafe PC API rows, Mini PC/Desktop/Monitor category API rows, product-link URLs, and the deployed external-link marker CSS/JS assets.
`generate-category-products.py` validates generated SQL and review CSVs after writing them. Use `--skip-output-validation` only when debugging the validators themselves.
`category:ready` checks `.env.amazon`, generated SQL validation, matching review CSV validation, SQL/review ASIN consistency, monitor table SQL presence, and category API row counts without printing credential values. If SQL exists for a category, the matching review CSV must exist, pass validation, and contain the same ASIN set as the SQL.
`category:review` validates review CSV rows for duplicate ASINs, required inferred specs, suspicious category words, prices, and ASIN-bearing detail URLs.
`category:test` checks product parsing, target/exclusion filters, generated SQL, and SQL validation without Amazon API credentials.
