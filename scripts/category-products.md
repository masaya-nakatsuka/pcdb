# Category product SQL generation

Use this when adding products for `/pc-list/mini-pc`, `/pc-list/desktop`, `/monitor-list`, or `/tablet-list`.

1. Confirm the planned order, output files, and search keywords.

```bash
npm run category:plan
npm run category:plan -- monitor
```

Start with `monitor` first unless there is a reason to prioritize PC categories.

2. Put Amazon Creators API credentials in `.env.amazon`.

```bash
cp .env.amazon.example .env.amazon
npm run category:ready -- --skip-production
```

3. Dry-run candidates first.

```bash
npm run category:test
python3 scripts/generate-category-products.py monitor --dry-run --review-output scripts/review_monitor_products.csv
python3 scripts/generate-category-products.py tablet --dry-run --review-output scripts/review_tablet_products.csv
python3 scripts/generate-category-products.py mini-pc --dry-run --review-output scripts/review_mini_pc_products.csv
python3 scripts/generate-category-products.py desktop-pc --dry-run --review-output scripts/review_desktop_pc_products.csv
npm run category:review
npm run category:review:strict
npm run category:ready:strict -- --skip-production
npm run category:ready -- --skip-production
```

4. Generate SQL after checking the candidate list.

```bash
python3 scripts/generate-category-products.py monitor --pages 2 --max-add 40
python3 scripts/generate-category-products.py tablet --pages 2 --max-add 30
python3 scripts/generate-category-products.py mini-pc --pages 2 --max-add 40
python3 scripts/generate-category-products.py desktop-pc --pages 2 --max-add 40
```

The generator writes the matching `scripts/review_*_products.csv` automatically when it writes SQL, then validates both outputs. It exits without writing SQL or an automatic review CSV when no valid candidates are found. Run the dry-run command first if you need to tune keywords or filters.
PC candidates must expose a specific CPU model such as `Core i5-1335U` or `Ryzen 7 PRO 8845HS`; broad labels such as `Core i7` or `Ryzen 7` are intentionally rejected because scoring cannot benchmark them reliably.
If strict review finds a weak candidate, rerun generation with `--exclude-asin B0XXXXXXXX` or `--exclude-file path/to/excluded-asins.txt` instead of editing generated SQL by hand.

5. Re-validate generated SQL and matching review CSVs before opening Supabase.

```bash
python3 scripts/validate-category-products-sql.py \
  scripts/insert_monitor_products.sql \
  scripts/insert_tablet_products.sql \
  scripts/insert_mini_pc_products.sql \
  scripts/insert_desktop_pc_products.sql
npm run category:ready -- --skip-production
npm run category:review:strict
npm run category:ready:strict -- --skip-production
```

6. For monitors, run `scripts/create-monitor-data-table.sql` in Supabase SQL Editor before running `scripts/insert_monitor_products.sql`. For tablets, run `scripts/create-tablet-data-table.sql` before `scripts/insert_tablet_products.sql`.

If monitor rows were inserted but `/api/monitor-list` still returns `[]`, run:

```bash
scripts/fix-monitor-public-read-policy.sql
```

This adds the public read policy used by the production anon key and prints total/active row counts.

7. Check production after deploy or DB insertion.

```bash
python3 scripts/check-category-pages.py
python3 scripts/check-category-pages.py --expect-data
npm run production:check
npm run production:check -- --expect-category-data
npm run category:ready -- --expect-data
```

8. Refresh current prices after product insertion.

```bash
npm run prices:refresh
```

This reads `/api/pc-list?listing=all&device=all` and `/api/monitor-list`, fetches current Amazon offer prices by ASIN, and writes `scripts/update_product_prices.sql`. Run that SQL in Supabase after reviewing the summary. By default, unavailable products only get `fetched_at`/availability refreshed; use `-- --deactivate-unavailable` only when you intentionally want no-price rows set inactive.

After refreshing prices, review and run `scripts/update-generic-cpu-models.sql` for legacy rows that still have broad CPU labels. It updates rows with confirmed exact CPU models and keeps rows inactive when only the CPU generation/family is known.

The generated SQL skips rows when the ASIN already appears in `url` or `af_url`.
Use the review CSV to check ASINs, prices, inferred specs, and accidental accessories before running generated SQL in Supabase. Tablet rows intentionally require Android/iPad, SoC, storage, and display size; RAM, OS version, and battery fields may warn because Amazon listings often omit them. Regenerate the SQL and review CSV together when you change keywords, max rows, or category filters; the default non-dry-run command does this automatically.

`production:check` also verifies the home page, cafe PC API rows, Mini PC/Desktop/Monitor category API rows, product-link URLs, and the deployed external-link marker CSS/JS assets.
`category:plan` prints the category order, page URL, SQL path, review CSV path, search keywords, dry-run command, generate command, and final validation commands without calling Amazon APIs.
`generate-category-products.py` validates generated SQL and review CSVs after writing them. Use `--skip-output-validation` only when debugging the validators themselves.
`category:ready` checks `.env.amazon`, generated SQL validation, matching review CSV validation, SQL/review ASIN consistency, monitor table SQL presence, and category API row counts without printing credential values. If SQL exists for a category, the matching review CSV must exist, pass validation, and contain the same ASIN set as the SQL.
`category:ready:strict` runs the same readiness checks with review CSV quality warnings treated as blockers. Use it before opening Supabase.
`category:review` validates review CSV rows for duplicate ASINs, required inferred specs, suspicious category words, prices, and ASIN-bearing detail URLs. It also prints quality warnings for monitor rows that are missing comparison fields such as resolution, refresh rate, panel type, or USB-C power delivery.
`category:review:strict` treats review CSV quality warnings as errors. Run it before opening Supabase; if it fails, refine keywords or inspect/edit candidates instead of inserting weak comparison rows.
`category:test` checks product parsing, target/exclusion filters, generated SQL, and SQL validation without Amazon API credentials.
