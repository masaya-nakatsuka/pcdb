#!/usr/bin/env python3
"""
Validate review CSVs produced by generate-category-products.py --review-output.

This catches obvious category mistakes before SQL is generated or pasted into
Supabase.
"""

from __future__ import annotations

import argparse
import csv
import re
import sys
from pathlib import Path

DEFAULT_FILES = [
    Path("scripts/review_mini_pc_products.csv"),
    Path("scripts/review_desktop_pc_products.csv"),
    Path("scripts/review_monitor_products.csv"),
]

REQUIRED_COLUMNS = {
    "profile",
    "asin",
    "brand",
    "title",
    "price",
    "availability",
    "cpu",
    "ram_gb",
    "rom_gb",
    "gpu",
    "gpu_class",
    "has_dgpu",
    "size_inch",
    "resolution",
    "refresh_rate_hz",
    "panel_type",
    "has_usb_c",
    "usb_c_power_delivery_w",
    "detail_url",
}

VALID_PROFILES = {"mini-pc", "desktop-pc", "monitor"}
ASIN_RE = re.compile(r"^[A-Z0-9]{10}$")

PC_SUSPICIOUS_WORDS = [
    "中古",
    "整備済",
    "整備済み",
    "再生品",
    "refurbished",
    "renewed",
    "used",
    "モニター",
    "ディスプレイ",
    "ケース",
    "フィルム",
    "スタンド",
    "ケーブル",
    "アダプタ",
    "充電器",
]

MONITOR_SUSPICIOUS_WORDS = [
    "モニターアーム",
    "モニター台",
    "ディスプレイアーム",
    "保護フィルム",
    "ケーブル",
    "変換アダプタ",
    "ノートパソコン",
    "デスクトップpc",
    "ミニpc",
    "mini pc",
]


def parse_number(value: str, field: str, row_label: str, errors: list[str]) -> float | None:
    if value == "":
        errors.append(f"{row_label}: missing {field}")
        return None
    try:
        return float(value)
    except ValueError:
        errors.append(f"{row_label}: invalid numeric {field}: {value}")
        return None


def normalized(value: str) -> str:
    return value.lower().replace("　", " ")


def validate_row(row: dict[str, str], row_number: int) -> list[str]:
    errors: list[str] = []
    row_label = f"row {row_number}"
    profile = row.get("profile", "")
    asin = row.get("asin", "").upper()
    title = row.get("title", "")
    title_lower = normalized(title)
    detail_url = row.get("detail_url", "")

    if profile not in VALID_PROFILES:
        errors.append(f"{row_label}: unsupported profile: {profile}")

    if not ASIN_RE.match(asin):
        errors.append(f"{row_label}: invalid ASIN: {asin}")
    elif asin not in detail_url:
        errors.append(f"{row_label}: detail_url does not contain ASIN {asin}")

    if not row.get("brand"):
        errors.append(f"{row_label}: missing brand")
    if not title:
        errors.append(f"{row_label}: missing title")

    price = parse_number(row.get("price", ""), "price", row_label, errors)
    if price is not None and price < 10000:
        errors.append(f"{row_label}: price is below category minimum: {price:g}")

    if profile in {"mini-pc", "desktop-pc"}:
        for word in PC_SUSPICIOUS_WORDS:
            if word in title_lower:
                errors.append(f"{row_label}: suspicious PC title word `{word}`")
                break
        for field in ("cpu", "gpu", "gpu_class"):
            if not row.get(field):
                errors.append(f"{row_label}: missing {field}")
        for field in ("ram_gb", "rom_gb"):
            value = parse_number(row.get(field, ""), field, row_label, errors)
            if value is not None and value <= 0:
                errors.append(f"{row_label}: {field} must be positive")

    if profile == "monitor":
        for word in MONITOR_SUSPICIOUS_WORDS:
            if word in title_lower:
                errors.append(f"{row_label}: suspicious monitor title word `{word}`")
                break
        size = parse_number(row.get("size_inch", ""), "size_inch", row_label, errors)
        if size is not None and not 18 <= size <= 57:
            errors.append(f"{row_label}: size_inch out of expected range: {size:g}")

    return errors


def quality_warnings(row: dict[str, str], row_number: int) -> list[str]:
    warnings: list[str] = []
    row_label = f"row {row_number}"
    profile = row.get("profile", "")

    if profile == "monitor":
        for field in ("resolution", "refresh_rate_hz", "panel_type"):
            if not row.get(field):
                warnings.append(f"{row_label}: monitor is missing comparison field {field}")
        if normalized(row.get("has_usb_c", "")) == "true" and not row.get("usb_c_power_delivery_w"):
            warnings.append(f"{row_label}: monitor has USB-C but missing usb_c_power_delivery_w")

    return warnings


def audit_csv(path: Path) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []

    with path.open(encoding="utf-8", newline="") as file:
        reader = csv.DictReader(file)
        columns = set(reader.fieldnames or [])
        missing_columns = sorted(REQUIRED_COLUMNS - columns)
        if missing_columns:
            return [f"missing columns: {', '.join(missing_columns)}"], []

        rows = list(reader)

    if not rows:
        return ["no rows"], []

    seen_asins: dict[str, int] = {}
    profiles = set()
    for row_number, row in enumerate(rows, start=2):
        asin = row.get("asin", "").upper()
        profile = row.get("profile", "")
        profiles.add(profile)
        if asin in seen_asins:
            errors.append(f"row {row_number}: duplicate ASIN {asin} also appears on row {seen_asins[asin]}")
        else:
            seen_asins[asin] = row_number
        errors.extend(validate_row(row, row_number))
        warnings.extend(quality_warnings(row, row_number))

    if len(profiles) > 1:
        errors.append(f"{path}: mixed profiles found: {', '.join(sorted(profiles))}")

    return errors, warnings


def validate_csv(path: Path) -> list[str]:
    errors, _warnings = audit_csv(path)
    return errors


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument("files", nargs="*", type=Path, help="Review CSV files to validate")
    parser.add_argument(
        "--warnings-as-errors",
        action="store_true",
        help="Fail when quality warnings are found. Useful before opening Supabase.",
    )
    return parser


def main() -> int:
    args = build_parser().parse_args()
    files = args.files or [path for path in DEFAULT_FILES if path.exists()]

    if not files:
        print("No review CSV files found. Generate them with --review-output.")
        return 0

    all_errors: list[str] = []
    all_warnings: list[str] = []
    for path in files:
        if not path.exists():
            all_errors.append(f"{path}: file not found")
            continue
        errors, warnings = audit_csv(path)
        if errors:
            all_errors.extend(f"{path}: {error}" for error in errors)
        if warnings:
            all_warnings.extend(f"{path}: {warning}" for warning in warnings)
        if not errors and not warnings:
            print(f"OK: {path}")
        elif not errors:
            print(f"OK with warnings: {path}")

    for warning in all_warnings:
        print(f"WARNING: {warning}", file=sys.stderr)

    if all_errors:
        for error in all_errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1

    if args.warnings_as_errors and all_warnings:
        for warning in all_warnings:
            print(f"ERROR: warning treated as error: {warning}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
