#!/usr/bin/env python3
"""
Generate price refresh SQL for Specsy products using Amazon Creators API.

The script reads currently visible product rows from the production APIs by
default, fetches current Amazon offer prices by ASIN, and writes UPDATE SQL for
Supabase. It does not print PA-API credential values.
"""

from __future__ import annotations

import argparse
import datetime as dt
import importlib.util
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Any

TODAY = dt.date.today().isoformat()
DEFAULT_BASE_URL = "https://specsy-hub.com"
GET_ITEMS_URL = "https://creatorsapi.amazon/catalog/v1/getItems"
MARKETPLACE = "www.amazon.co.jp"
ASIN_RE = re.compile(r"(?:/dp/|%2Fdp%2F)([A-Z0-9]{10})(?:[/?&%'#]|%|$)", re.I)

SOURCE_APIS = {
    "pc": "/api/pc-list?listing=all&device=all",
    "monitor": "/api/monitor-list",
}

RESOURCES = [
    "itemInfo.title",
    "offersV2.listings.price",
    "offersV2.listings.availability",
]


@dataclass(frozen=True)
class ProductRef:
    table: str
    row_id: int | None
    asin: str
    name: str
    old_price: int | None
    url: str


@dataclass(frozen=True)
class Offer:
    price: int | None
    availability: str


def load_category_generator() -> Any:
    script_path = Path(__file__).resolve().parent / "generate-category-products.py"
    spec = importlib.util.spec_from_file_location("specsy_category_products", script_path)
    if spec is None or spec.loader is None:
        raise SystemExit(f"Cannot load helper script: {script_path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


category_products = load_category_generator()


def fetch_text(url: str) -> tuple[int, str]:
    request = urllib.request.Request(url, headers={"User-Agent": "specsy-price-refresh/1.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.status, response.read().decode("utf-8", errors="replace")


def join_url(base_url: str, path: str) -> str:
    return urllib.parse.urljoin(base_url.rstrip("/") + "/", path.lstrip("/"))


def extract_asin(*values: Any) -> str | None:
    for value in values:
        if not value:
            continue
        match = ASIN_RE.search(str(value))
        if match:
            return match.group(1).upper()
    return None


def to_int(value: Any) -> int | None:
    if value is None or value == "":
        return None
    try:
        return int(round(float(value)))
    except (TypeError, ValueError):
        return None


def product_refs_from_api(base_url: str, profiles: list[str]) -> list[ProductRef]:
    refs: list[ProductRef] = []
    seen: set[tuple[str, str]] = set()

    for profile in profiles:
        path = SOURCE_APIS[profile]
        status, body = fetch_text(join_url(base_url, path))
        if status != 200:
            raise SystemExit(f"{path}: expected HTTP 200, got {status}")
        payload = json.loads(body)
        if not isinstance(payload, list):
            raise SystemExit(f"{path}: expected JSON array")

        table = "am_pc_data" if profile == "pc" else "am_monitor_data"
        for row in payload:
            if not isinstance(row, dict):
                continue
            asin = extract_asin(row.get("url"), row.get("af_url"))
            if not asin:
                continue
            key = (table, asin)
            if key in seen:
                continue
            seen.add(key)
            refs.append(ProductRef(
                table=table,
                row_id=to_int(row.get("id")),
                asin=asin,
                name=str(row.get("name") or row.get("brand") or asin),
                old_price=to_int(row.get("price") or row.get("real_price")),
                url=str(row.get("url") or row.get("af_url") or f"https://www.amazon.co.jp/dp/{asin}"),
            ))

    return refs


def product_refs_from_asin_file(path: Path, table: str) -> list[ProductRef]:
    refs: list[ProductRef] = []
    seen: set[str] = set()
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.split("#", 1)[0].strip()
        asin = extract_asin(line) or (line.upper() if re.fullmatch(r"[A-Z0-9]{10}", line, re.I) else None)
        if not asin or asin in seen:
            continue
        seen.add(asin)
        refs.append(ProductRef(
            table=table,
            row_id=None,
            asin=asin,
            name=asin,
            old_price=None,
            url=f"https://www.amazon.co.jp/dp/{asin}",
        ))
    return refs


def chunked(values: list[str], size: int) -> list[list[str]]:
    return [values[index:index + size] for index in range(0, len(values), size)]


def get_items(token: str, partner_tag: str, asins: list[str]) -> dict[str, Offer]:
    response = category_products.post_json(
        GET_ITEMS_URL,
        {
            "itemIds": asins,
            "itemIdType": "ASIN",
            "resources": RESOURCES,
            "partnerTag": partner_tag,
            "partnerType": "Associates",
            "marketplace": MARKETPLACE,
        },
        {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "x-marketplace": MARKETPLACE,
        },
    )
    result = category_products.pick(response, "itemsResult", "ItemsResult", default={})
    items = category_products.pick(result, "items", "Items", default=[]) or category_products.pick(response, "items", "Items", default=[])

    offers: dict[str, Offer] = {}
    for item in items or []:
        asin = category_products.extract_asin(item)
        if not asin:
            continue
        price, availability = category_products.extract_price(item)
        offers[asin] = Offer(price=price, availability=availability)
    return offers


def sql_string(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def asin_guard(column_prefix: str, asin: str) -> str:
    return f"({column_prefix}url ILIKE '%{asin}%' OR {column_prefix}af_url ILIKE '%{asin}%')"


def update_where(ref: ProductRef) -> str:
    id_clause = f"id = {ref.row_id}" if ref.row_id is not None else "false"
    return f"({id_clause} OR {asin_guard('', ref.asin)})"


def build_update_sql(refs: list[ProductRef], offers: dict[str, Offer], *, deactivate_unavailable: bool) -> str:
    lines = [
        f"-- Specsy product price refresh SQL generated on {TODAY}",
        "-- Source: Amazon Creators API GetItems.",
        "-- Review unavailable products before choosing to deactivate them.",
        "BEGIN;",
        "",
    ]
    changed = 0
    unavailable = 0

    for ref in refs:
        offer = offers.get(ref.asin)
        if offer is None or offer.price is None:
            unavailable += 1
            status = offer.availability if offer else "NOT_RETURNED"
            lines.append(f"-- Unavailable: {ref.asin} {ref.name[:100]} / status={status}")
            set_parts = [f"fetched_at = {sql_string(TODAY)}"]
            if ref.table == "am_pc_data":
                set_parts.append(f"availability = {sql_string(status)}")
            if deactivate_unavailable:
                set_parts.append("is_active = false")
            lines.append(f"UPDATE {ref.table} SET {', '.join(set_parts)} WHERE {update_where(ref)};")
            continue

        if ref.old_price != offer.price:
            changed += 1
        set_parts = [
            f"price = {offer.price}",
            f"real_price = {offer.price}",
            f"fetched_at = {sql_string(TODAY)}",
            "is_active = true",
        ]
        if ref.table == "am_pc_data":
            set_parts.append(f"availability = {sql_string(offer.availability)}")
        lines.append(f"UPDATE {ref.table} SET {', '.join(set_parts)} WHERE {update_where(ref)};")

    lines.extend([
        "",
        "COMMIT;",
        "",
        f"-- Summary: products={len(refs)}, price_changed={changed}, unavailable={unavailable}, deactivate_unavailable={str(deactivate_unavailable).lower()}",
    ])
    return "\n".join(lines)


def write_summary(refs: list[ProductRef], offers: dict[str, Offer]) -> None:
    price_changes = []
    unavailable = []
    for ref in refs:
        offer = offers.get(ref.asin)
        if offer is None or offer.price is None:
            unavailable.append((ref, offer.availability if offer else "NOT_RETURNED"))
            continue
        if ref.old_price is not None and ref.old_price != offer.price:
            price_changes.append((ref, offer.price))

    print(f"Products: {len(refs)}")
    print(f"Fetched offers: {len(offers)}")
    print(f"Price changes: {len(price_changes)}")
    print(f"Unavailable/no price: {len(unavailable)}")
    for ref, new_price in price_changes[:30]:
        diff = new_price - (ref.old_price or 0)
        print(f"  {ref.asin} {ref.old_price} -> {new_price} ({diff:+d}) {ref.name[:60]}")
    if len(price_changes) > 30:
        print(f"  ... and {len(price_changes) - 30} more")
    for ref, status in unavailable[:20]:
        print(f"  unavailable {ref.asin} status={status} {ref.name[:60]}")
    if len(unavailable) > 20:
        print(f"  ... and {len(unavailable) - 20} more unavailable")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument("--profile", choices=["pc", "monitor", "all"], default="all", help="Product group to refresh")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL, help="Production or local base URL for API source")
    parser.add_argument("--env-file", default=".env.amazon", help="Optional env file with PAAPI_* keys")
    parser.add_argument("--asin-file", type=Path, help="Optional ASIN list source instead of production APIs")
    parser.add_argument("--asin-file-table", choices=["am_pc_data", "am_monitor_data"], default="am_pc_data")
    parser.add_argument("--output", type=Path, default=Path("scripts/update_product_prices.sql"))
    parser.add_argument("--request-sleep", type=float, default=1.1, help="Seconds between GetItems requests")
    parser.add_argument("--deactivate-unavailable", action="store_true", help="Set is_active=false when no current offer price is returned")
    parser.add_argument("--dry-run", action="store_true", help="Fetch and summarize without writing SQL")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    category_products.load_env_file(Path(args.env_file))
    client_id = category_products.env_value("PAAPI_ACCESS_KEY")
    client_secret = category_products.env_value("PAAPI_SECRET_KEY")
    partner_tag = category_products.env_value("PAAPI_PARTNER_TAG")

    if args.asin_file:
        refs = product_refs_from_asin_file(args.asin_file, args.asin_file_table)
    else:
        profiles = ["pc", "monitor"] if args.profile == "all" else [args.profile]
        refs = product_refs_from_api(args.base_url, profiles)

    if not refs:
        print("No product ASINs found.", file=sys.stderr)
        return 2

    print(f"Token request...")
    token = category_products.get_token(client_id, client_secret)
    asins = sorted({ref.asin for ref in refs})
    offers: dict[str, Offer] = {}
    for batch in chunked(asins, 10):
        try:
            offers.update(get_items(token, partner_tag, batch))
        except urllib.error.HTTPError as error:
            body = error.read().decode("utf-8", errors="replace")
            print(f"HTTP {error.code}: {body[:500]}", file=sys.stderr)
            return 1
        time.sleep(args.request_sleep)

    write_summary(refs, offers)
    if args.dry_run:
        return 0

    args.output.parent.mkdir(parents=True, exist_ok=True)
    sql = build_update_sql(refs, offers, deactivate_unavailable=args.deactivate_unavailable)
    args.output.write_text(sql, encoding="utf-8")
    print(f"SQL written: {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
