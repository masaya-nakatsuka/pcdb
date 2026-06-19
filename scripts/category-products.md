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

4. For monitors, run `scripts/create-monitor-data-table.sql` in Supabase SQL Editor before running `scripts/insert_monitor_products.sql`.

The generated SQL skips rows when the ASIN already appears in `url` or `af_url`.
