#!/usr/bin/env python3
"""
Validate generated Specsy category product INSERT SQL before running it in Supabase.

Examples:
  python3 scripts/validate-category-products-sql.py scripts/insert_monitor_products.sql
  python3 scripts/validate-category-products-sql.py scripts/insert_mini_pc_products.sql scripts/insert_desktop_pc_products.sql
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

DEFAULT_FILES = [
    Path("scripts/insert_mini_pc_products.sql"),
    Path("scripts/insert_desktop_pc_products.sql"),
    Path("scripts/insert_monitor_products.sql"),
]

ASIN_RE = re.compile(r"(?:/dp/|%)([A-Z0-9]{10})(?:[?%'&]|$)", re.I)
GUARD_ASIN_RE = re.compile(r"WHERE NOT EXISTS\s*\([^;]*%([A-Z0-9]{10})%[^;]*\)", re.I)


def extract_asins(sql: str) -> list[str]:
    return [match.group(1).upper() for match in ASIN_RE.finditer(sql)]


def extract_guard_asins(sql: str) -> list[str]:
    return [match.group(1).upper() for match in GUARD_ASIN_RE.finditer(sql)]


def validate_sql(path: Path) -> list[str]:
    errors: list[str] = []
    sql = path.read_text(encoding="utf-8")
    inserts = re.findall(r"INSERT INTO\s+(am_pc_data|am_monitor_data)\s*\(([^)]*)\)", sql, flags=re.I)

    if not inserts:
        return [f"{path}: INSERT statement not found"]

    table_names = {table.lower() for table, _cols in inserts}
    if len(table_names) != 1:
        errors.append(f"{path}: multiple target tables found: {sorted(table_names)}")

    target = next(iter(table_names))
    if target == "am_pc_data":
        for _table, cols in inserts:
            col_names = [col.strip().lower() for col in cols.split(",")]
            for required in ("id", "form_factor", "brand", "name", "price", "cpu", "ram", "rom", "url", "af_url"):
                if required not in col_names:
                    errors.append(f"{path}: am_pc_data INSERT missing column `{required}`")
                    break
        if "(SELECT COALESCE(MAX(id), 0) + 1 FROM am_pc_data)" not in sql:
            errors.append(f"{path}: am_pc_data INSERT does not include explicit id allocator")
        if "'MiniPC'" not in sql and "'Desktop'" not in sql:
            errors.append(f"{path}: am_pc_data INSERT does not include MiniPC/Desktop form_factor")
    elif target == "am_monitor_data":
        for _table, cols in inserts:
            col_names = [col.strip().lower() for col in cols.split(",")]
            for required in ("brand", "name", "size_inch", "price", "url", "af_url"):
                if required not in col_names:
                    errors.append(f"{path}: am_monitor_data INSERT missing column `{required}`")
                    break
    else:
        errors.append(f"{path}: unsupported table `{target}`")

    if "WHERE NOT EXISTS" not in sql:
        errors.append(f"{path}: missing WHERE NOT EXISTS duplicate guard")

    if "url ILIKE" not in sql or "af_url ILIKE" not in sql:
        errors.append(f"{path}: duplicate guard should check both url and af_url")

    asins = extract_asins(sql)
    if not asins:
        errors.append(f"{path}: no ASIN found")

    guard_asins = extract_guard_asins(sql)
    duplicate_asins = sorted({asin for asin in guard_asins if guard_asins.count(asin) > 1})
    if duplicate_asins:
        errors.append(f"{path}: duplicate ASINs found: {', '.join(duplicate_asins)}")

    if "PAAPI_SECRET_KEY" in sql or "PAAPI_ACCESS_KEY" in sql:
        errors.append(f"{path}: possible API key name leaked into SQL")

    return errors


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument("files", nargs="*", type=Path, help="Generated SQL files to validate")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    files = args.files or [path for path in DEFAULT_FILES if path.exists()]

    if not files:
        print("No generated SQL files found. Pass files explicitly after generating SQL.")
        return 0

    all_errors: list[str] = []
    for path in files:
        if not path.exists():
            all_errors.append(f"{path}: file not found")
            continue
        errors = validate_sql(path)
        if errors:
            all_errors.extend(errors)
        else:
            print(f"OK: {path}")

    if all_errors:
        for error in all_errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
