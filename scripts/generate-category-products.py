#!/usr/bin/env python3
"""
Generate Supabase INSERT SQL for Specsy category pages from Amazon Creators API.

Examples:
  python3 scripts/generate-category-products.py mini-pc --dry-run
  python3 scripts/generate-category-products.py desktop-pc --max-add 20
  python3 scripts/generate-category-products.py monitor --output scripts/insert_monitor_products.sql

Required env:
  PAAPI_ACCESS_KEY
  PAAPI_SECRET_KEY
  PAAPI_PARTNER_TAG
"""

from __future__ import annotations

import argparse
import csv
import dataclasses
import datetime as dt
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

TODAY = dt.date.today().isoformat()
MARKETPLACE = "www.amazon.co.jp"
TOKEN_URL = "https://api.amazon.co.jp/auth/o2/token"
SEARCH_URL = "https://creatorsapi.amazon/catalog/v1/searchItems"

RESOURCES = [
    "itemInfo.title",
    "itemInfo.features",
    "itemInfo.byLineInfo",
    "itemInfo.productInfo",
    "itemInfo.technicalInfo",
    "images.primary.medium",
    "offersV2.listings.price",
    "offersV2.listings.availability",
]

DEFAULT_QUERIES = {
    "mini-pc": [
        "ミニPC Windows 11 N100",
        "ミニPC Windows 11 N150",
        "ミニPC Ryzen 7",
        "MINISFORUM ミニPC",
        "GMKtec ミニPC",
        "Beelink ミニPC",
    ],
    "desktop-pc": [
        "デスクトップPC Windows 11",
        "デスクトップPC Core i5",
        "デスクトップPC Ryzen 5",
        "ゲーミングPC RTX",
        "タワーPC Windows 11",
    ],
    "monitor": [
        "モニター 24インチ IPS",
        "モニター 27インチ WQHD",
        "モニター 27インチ 4K USB-C",
        "ゲーミングモニター 144Hz",
        "ウルトラワイドモニター USB-C",
    ],
}

PC_EXCLUDE_WORDS = [
    "ケース",
    "保護フィルム",
    "フィルム",
    "バッグ",
    "スタンド",
    "ケーブル",
    "充電器",
    "acアダプタ",
    "アダプタ",
    "メモリ増設",
    "ssd換装",
    "ssdケース",
    "外付け",
    "モニター",
    "ディスプレイ",
    "中古",
    "整備済",
    "整備済み",
    "再生品",
    "refurbished",
    "renewed",
    "used",
    "chromebook",
]

MONITOR_EXCLUDE_WORDS = [
    "モニター台",
    "モニターアーム",
    "保護フィルム",
    "ケーブル",
    "変換アダプタ",
    "ノートパソコン",
    "デスクトップpc",
    "ミニpc",
    "mini pc",
]

MINI_PC_WORDS = [
    "ミニpc",
    "mini pc",
    "minipc",
    "小型pc",
    "minisforum",
    "gmktec",
    "beelink",
    "geekom",
    "acemagic",
    "aoostar",
    "nipogi",
    "trigkey",
]

DESKTOP_PC_WORDS = [
    "デスクトップpc",
    "デスクトップパソコン",
    "ゲーミングpc",
    "タワーpc",
    "タワー型",
    "desktop pc",
    "tower pc",
]

MONITOR_WORDS = [
    "モニター",
    "ディスプレイ",
    "monitor",
    "display",
]


@dataclasses.dataclass
class Candidate:
    asin: str
    title: str
    brand: str
    price: int | None
    availability: str
    detail_url: str
    image_url: str
    text: str


@dataclasses.dataclass(frozen=True)
class SqlExpr:
    value: str


def load_env_file(path: Path) -> None:
    if not path.exists():
        return

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


def env_value(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise SystemExit(f"Missing required env: {name}")
    return value


def pick(obj: Any, *names: str, default: Any = None) -> Any:
    if not isinstance(obj, dict):
        return default
    for name in names:
        if name in obj:
            return obj[name]
    return default


def path(obj: Any, *parts: str, default: Any = None) -> Any:
    cur = obj
    for part in parts:
        if not isinstance(cur, dict):
            return default
        cur = pick(cur, part, part[:1].upper() + part[1:], default=None)
        if cur is None:
            return default
    return cur


def text_values(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, str):
        return [value]
    if isinstance(value, list):
        out: list[str] = []
        for item in value:
            out.extend(text_values(item))
        return out
    if isinstance(value, dict):
        out = []
        display = pick(value, "displayValue", "DisplayValue")
        if isinstance(display, str):
            out.append(display)
        for item in value.values():
            out.extend(text_values(item))
        return out
    return []


def post_json(url: str, payload: dict[str, Any], headers: dict[str, str]) -> dict[str, Any]:
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers=headers,
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as response:
        return json.loads(response.read())


def get_token(client_id: str, client_secret: str) -> str:
    response = post_json(
        TOKEN_URL,
        {
            "grant_type": "client_credentials",
            "client_id": client_id,
            "client_secret": client_secret,
            "scope": "creatorsapi::default",
        },
        {"Content-Type": "application/json"},
    )
    return response["access_token"]


def search_items(
    token: str,
    partner_tag: str,
    keywords: str,
    *,
    item_page: int,
    item_count: int,
    condition: str,
) -> list[dict[str, Any]]:
    response = post_json(
        SEARCH_URL,
        {
            "keywords": keywords,
            "searchIndex": "All",
            "itemPage": item_page,
            "itemCount": item_count,
            "condition": condition,
            "availability": "Available",
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
    result = pick(response, "itemsResult", "ItemsResult", "searchResult", "SearchResult", default={})
    return pick(result, "items", "Items", default=[]) or pick(response, "items", "Items", default=[]) or []


def extract_asin(item: dict[str, Any]) -> str:
    asin = pick(item, "asin", "ASIN", "itemId", "ItemId", default="")
    return str(asin).upper()


def extract_title(item: dict[str, Any]) -> str:
    return path(item, "itemInfo", "title", "displayValue", default="") or ""


def extract_brand(item: dict[str, Any], title: str) -> str:
    brand = path(item, "itemInfo", "byLineInfo", "brand", "displayValue", default="")
    if brand:
        return str(brand).strip()
    first = re.split(r"[\s　【\[]+", title.strip())[0]
    return first[:32] if first else "Unknown"


def extract_price(item: dict[str, Any]) -> tuple[int | None, str]:
    listings = path(item, "offersV2", "listings", default=[]) or []
    if not listings:
        return None, "NO_OFFER"

    listing = listings[0]
    availability = pick(path(listing, "availability", default={}) or {}, "type", "message", default="UNKNOWN")
    price_obj = path(listing, "price", default={}) or {}
    money = pick(price_obj, "money", default={}) or {}
    amount = pick(money, "amount", default=None)
    if amount is None:
        amount = pick(price_obj, "amount", default=None)

    try:
        return int(round(float(amount))), str(availability)
    except (TypeError, ValueError):
        return None, str(availability)


def extract_image_url(item: dict[str, Any]) -> str:
    for size in ("medium", "large", "small"):
        image_url = path(item, "images", "primary", size, "url", default="")
        if image_url:
            return str(image_url)
    return ""


def searchable_text(item: dict[str, Any]) -> str:
    item_info = pick(item, "itemInfo", "ItemInfo", default={}) or {}
    return " ".join(value for value in text_values(item_info) if value)


def to_candidate(item: dict[str, Any]) -> Candidate | None:
    asin = extract_asin(item)
    if not asin:
        return None

    title = extract_title(item)
    brand = extract_brand(item, title)
    price, availability = extract_price(item)
    detail_url = pick(item, "detailPageURL", "DetailPageURL", default="") or f"https://www.amazon.co.jp/dp/{asin}"
    image_url = extract_image_url(item)
    text = searchable_text(item)

    return Candidate(
        asin=asin,
        title=title,
        brand=brand,
        price=price,
        availability=availability,
        detail_url=str(detail_url),
        image_url=image_url,
        text=f"{title} {text}",
    )


def normalized(value: str) -> str:
    return value.lower().replace("　", " ")


def includes_any(text: str, words: list[str]) -> bool:
    lower = normalized(text)
    return any(word in lower for word in words)


def infer_cpu(text: str) -> str:
    patterns = [
        (r"(?:Core\s*)?Ultra\s*([975])\s*(\d{3}[A-Z]{0,2})", "Core Ultra {0} {1}"),
        (r"(?:Core\s*)?i([9753])[-\s]?(\d{4,5}[A-Z]{0,2})", "Core i{0}-{1}"),
        (r"Ryzen\s*([9753])\s*(\d{4}[A-Z]{0,2})", "Ryzen {0} {1}"),
        (r"Ryzen\s*([9753])\s*(40|150|170|250)", "Ryzen {0} {1}"),
        (r"\bN150\b", "N150"),
        (r"\bN100\b", "N100"),
        (r"\bN95\b", "N95"),
        (r"\bN97\b", "N97"),
        (r"\bN200\b", "N200"),
    ]
    for pattern, label in patterns:
        match = re.search(pattern, text, re.I)
        if match:
            if "{" in label:
                return label.format(*match.groups()).strip()
            return label
    if re.search(r"Core\s*i5", text, re.I):
        return "Core i5"
    if re.search(r"Core\s*i7", text, re.I):
        return "Core i7"
    if re.search(r"Ryzen\s*5", text, re.I):
        return "Ryzen 5"
    if re.search(r"Ryzen\s*7", text, re.I):
        return "Ryzen 7"
    return ""


def infer_gpu(text: str) -> tuple[str, str, int, bool]:
    dedicated = [
        (r"RTX\s*5090", "RTX 5090", 10),
        (r"RTX\s*5080", "RTX 5080", 10),
        (r"RTX\s*5070", "RTX 5070", 9),
        (r"RTX\s*5060", "RTX 5060", 8),
        (r"RTX\s*4070", "RTX 4070", 8),
        (r"RTX\s*4060", "RTX 4060", 7),
        (r"RTX\s*4050", "RTX 4050", 6),
        (r"GTX\s*1650", "GTX 1650", 3),
        (r"Radeon\s*RX\s*7600", "Radeon RX 7600", 6),
        (r"Intel\s*Arc\s*A380|Arc\s*A380", "Intel Arc A380", 4),
    ]
    for pattern, label, score in dedicated:
        if re.search(pattern, text, re.I):
            return label, "dgpu", score, True

    integrated = [
        (r"Radeon\s*890M", "Radeon 890M", 5),
        (r"Radeon\s*880M", "Radeon 880M", 5),
        (r"Radeon\s*780M", "Radeon 780M", 4),
        (r"Iris\s*Xe", "Intel Iris Xe", 3),
        (r"Intel\s*UHD|UHD\s*Graphics", "Intel UHD Graphics", 2),
    ]
    for pattern, label, score in integrated:
        if re.search(pattern, text, re.I):
            return label, "integrated", score, False

    return "Integrated", "integrated", 2, False


def infer_int(patterns: list[str], text: str) -> int | None:
    for pattern in patterns:
        match = re.search(pattern, text, re.I)
        if match:
            return int(float(match.group(1)))
    return None


def infer_ram(text: str) -> int | None:
    return infer_int([
        r"(?:RAM|メモリ|DDR|LPDDR)[^\d]{0,12}(\d{1,2})\s*(?:GB|G|ＧＢ)",
        r"(\d{1,2})\s*(?:GB|G|ＧＢ)\s*(?:RAM|メモリ|DDR|LPDDR)",
    ], text)


def infer_rom(text: str) -> int | None:
    for pattern in [
        r"(\d+(?:\.\d+)?)\s*(TB|GB|T|G|ＴＢ|ＧＢ)\s*(?:SSD|ROM|ストレージ)",
        r"(?:SSD|ROM|ストレージ)[^\d]{0,12}(\d+(?:\.\d+)?)\s*(TB|GB|T|G|ＴＢ|ＧＢ)",
    ]:
        match = re.search(pattern, text, re.I)
        if not match:
            continue
        amount = float(match.group(1))
        unit = match.group(2).upper().replace("Ｔ", "T").replace("Ｇ", "G")
        value = int(round(amount * 1024)) if unit in ("TB", "T") else int(round(amount))
        if 64 <= value <= 8192:
            return value
    return None


def infer_monitor_size(text: str) -> float | None:
    for match in re.finditer(r"(\d{2}(?:\.\d{1,2})?)\s*(?:インチ|型|inch|inches|\"|”)", text, re.I):
        value = float(match.group(1))
        if 18 <= value <= 57:
            return value
    return None


def infer_resolution(text: str) -> str | None:
    mapping = [
        (r"3840\s*[x×]\s*2160|4K|UHD", "3840x2160"),
        (r"3440\s*[x×]\s*1440|UWQHD", "3440x1440"),
        (r"2560\s*[x×]\s*1440|WQHD|QHD", "2560x1440"),
        (r"2560\s*[x×]\s*1080|UWHD", "2560x1080"),
        (r"1920\s*[x×]\s*1080|FHD|Full HD|フルHD", "1920x1080"),
    ]
    for pattern, value in mapping:
        if re.search(pattern, text, re.I):
            return value
    return None


def infer_refresh_rate(text: str) -> int | None:
    rates = []
    for match in re.finditer(r"(\d{2,3})\s*(?:Hz|ヘルツ)", text, re.I):
        value = int(match.group(1))
        if 60 <= value <= 540:
            rates.append(value)
    return max(rates) if rates else None


def infer_panel_type(text: str) -> str | None:
    for label in ("QD-OLED", "OLED", "IPS", "VA", "TN"):
        if re.search(rf"\b{re.escape(label)}\b", text, re.I):
            return label.upper()
    return None


def infer_usb_c(text: str) -> tuple[bool, int | None]:
    has_usb_c = bool(re.search(r"USB[-\s]?C|Type[-\s]?C|タイプC", text, re.I))
    power = None
    if has_usb_c:
        for match in re.finditer(r"(\d{2,3})\s*W", text, re.I):
            value = int(match.group(1))
            if 15 <= value <= 140:
                power = max(power or 0, value)
    return has_usb_c, power


def is_valid_candidate(profile: str, candidate: Candidate) -> bool:
    lower = normalized(candidate.text)
    title_lower = normalized(candidate.title)
    if candidate.price is None or candidate.price < 10000:
        return False

    if profile == "monitor":
        if includes_any(title_lower, MONITOR_EXCLUDE_WORDS):
            return False
        return includes_any(lower, MONITOR_WORDS) and infer_monitor_size(candidate.text) is not None

    if includes_any(title_lower, PC_EXCLUDE_WORDS):
        return False

    cpu = infer_cpu(candidate.text)
    ram = infer_ram(candidate.text)
    rom = infer_rom(candidate.text)
    if not cpu or not ram or not rom:
        return False

    if profile == "mini-pc":
        return includes_any(lower, MINI_PC_WORDS)

    if profile == "desktop-pc":
        return includes_any(lower, DESKTOP_PC_WORDS)

    return False


def sql_value(value: Any, numeric: bool = False, boolean: bool = False) -> str:
    if isinstance(value, SqlExpr):
        return value.value
    if value is None:
        return "NULL"
    if boolean:
        return "true" if value else "false"
    if numeric:
        return str(value)
    return "'" + str(value).replace("'", "''") + "'"


def pc_name(candidate: Candidate, cpu: str) -> str:
    cleaned = re.sub(r"\s+", " ", candidate.title).strip()
    cleaned = re.sub(r"【[^】]{1,50}】", "", cleaned).strip()
    if len(cleaned) > 100:
        cleaned = cleaned[:100].rstrip()
    if cpu and cpu not in cleaned:
        cleaned = f"{cleaned} {cpu}"
    if candidate.brand and not cleaned.lower().startswith(candidate.brand.lower()):
        cleaned = f"{candidate.brand} {cleaned}"
    return cleaned


def asin_exists_condition(table: str, asin: str) -> str:
    return f"(url ILIKE '%{asin}%' OR af_url ILIKE '%{asin}%')"


def pc_insert_sql(profile: str, candidates: list[Candidate]) -> str:
    form_factor = "MiniPC" if profile == "mini-pc" else "Desktop"
    lines = [
        f"-- Specsy {profile} product INSERT SQL generated on {TODAY}",
        "-- Review candidates before running this in Supabase SQL Editor.",
        "BEGIN;",
        "",
        "ALTER TABLE am_pc_data ADD COLUMN IF NOT EXISTS condition_label text;",
        "ALTER TABLE am_pc_data ADD COLUMN IF NOT EXISTS availability text;",
        "ALTER TABLE am_pc_data ADD COLUMN IF NOT EXISTS is_used boolean DEFAULT false;",
        "ALTER TABLE am_pc_data ADD COLUMN IF NOT EXISTS is_refurbished boolean DEFAULT false;",
        "ALTER TABLE am_pc_data ADD COLUMN IF NOT EXISTS gpu text;",
        "ALTER TABLE am_pc_data ADD COLUMN IF NOT EXISTS gpu_class text;",
        "ALTER TABLE am_pc_data ADD COLUMN IF NOT EXISTS gpu_score integer;",
        "ALTER TABLE am_pc_data ADD COLUMN IF NOT EXISTS has_dgpu boolean DEFAULT false;",
        "",
    ]
    cols = [
        "id",
        "form_factor",
        "display_size",
        "brand",
        "name",
        "condition_label",
        "availability",
        "is_used",
        "is_refurbished",
        "price",
        "real_price",
        "cpu",
        "gpu",
        "gpu_class",
        "gpu_score",
        "has_dgpu",
        "ram",
        "rom",
        "battery",
        "battery_wh_normalized",
        "weight",
        "url",
        "af_url",
        "img_url",
        "imp_img_url",
        "fetched_at",
        "is_active",
    ]
    for candidate in candidates:
        cpu = infer_cpu(candidate.text)
        gpu, gpu_class, gpu_score, has_dgpu = infer_gpu(candidate.text)
        row = {
            "id": SqlExpr("(SELECT COALESCE(MAX(id), 0) + 1 FROM am_pc_data)"),
            "form_factor": form_factor,
            "display_size": None,
            "brand": candidate.brand,
            "name": pc_name(candidate, cpu),
            "condition_label": "新品",
            "availability": candidate.availability,
            "is_used": False,
            "is_refurbished": False,
            "price": candidate.price,
            "real_price": candidate.price,
            "cpu": cpu,
            "gpu": gpu,
            "gpu_class": gpu_class,
            "gpu_score": gpu_score,
            "has_dgpu": has_dgpu,
            "ram": infer_ram(candidate.text),
            "rom": infer_rom(candidate.text),
            "battery": "",
            "battery_wh_normalized": None,
            "weight": None,
            "url": f"https://www.amazon.co.jp/dp/{candidate.asin}",
            "af_url": candidate.detail_url,
            "img_url": candidate.image_url,
            "imp_img_url": "",
            "fetched_at": TODAY,
            "is_active": True,
        }
        values = []
        for col in cols:
            values.append(sql_value(
                row[col],
                numeric=col in {"id", "display_size", "price", "real_price", "gpu_score", "ram", "rom", "battery_wh_normalized", "weight"},
                boolean=col in {"is_used", "is_refurbished", "has_dgpu", "is_active"},
            ))
        lines.append(f"INSERT INTO am_pc_data ({', '.join(cols)})")
        lines.append(f"SELECT {', '.join(values)}")
        lines.append(f"WHERE NOT EXISTS (SELECT 1 FROM am_pc_data WHERE {asin_exists_condition('am_pc_data', candidate.asin)});")
    lines.extend(["", "COMMIT;", ""])
    return "\n".join(lines)


def monitor_insert_sql(candidates: list[Candidate]) -> str:
    cols = [
        "brand",
        "name",
        "size_inch",
        "resolution",
        "refresh_rate_hz",
        "panel_type",
        "has_usb_c",
        "usb_c_power_delivery_w",
        "price",
        "real_price",
        "url",
        "af_url",
        "img_url",
        "fetched_at",
        "is_active",
    ]
    lines = [
        f"-- Specsy monitor product INSERT SQL generated on {TODAY}",
        "-- Run scripts/create-monitor-data-table.sql first.",
        "-- Review candidates before running this in Supabase SQL Editor.",
        "BEGIN;",
        "",
    ]
    for candidate in candidates:
        has_usb_c, usb_c_power = infer_usb_c(candidate.text)
        row = {
            "brand": candidate.brand,
            "name": re.sub(r"\s+", " ", candidate.title).strip()[:120],
            "size_inch": infer_monitor_size(candidate.text),
            "resolution": infer_resolution(candidate.text),
            "refresh_rate_hz": infer_refresh_rate(candidate.text),
            "panel_type": infer_panel_type(candidate.text),
            "has_usb_c": has_usb_c,
            "usb_c_power_delivery_w": usb_c_power,
            "price": candidate.price,
            "real_price": candidate.price,
            "url": f"https://www.amazon.co.jp/dp/{candidate.asin}",
            "af_url": candidate.detail_url,
            "img_url": candidate.image_url,
            "fetched_at": TODAY,
            "is_active": True,
        }
        values = []
        for col in cols:
            values.append(sql_value(
                row[col],
                numeric=col in {"size_inch", "refresh_rate_hz", "usb_c_power_delivery_w", "price", "real_price"},
                boolean=col in {"has_usb_c", "is_active"},
            ))
        lines.append(f"INSERT INTO am_monitor_data ({', '.join(cols)})")
        lines.append(f"SELECT {', '.join(values)}")
        lines.append(f"WHERE NOT EXISTS (SELECT 1 FROM am_monitor_data WHERE {asin_exists_condition('am_monitor_data', candidate.asin)});")
    lines.extend(["", "COMMIT;", ""])
    return "\n".join(lines)


def candidate_review_row(profile: str, candidate: Candidate) -> dict[str, str | int | float | bool | None]:
    if profile == "monitor":
        has_usb_c, usb_c_power = infer_usb_c(candidate.text)
        return {
            "profile": profile,
            "asin": candidate.asin,
            "brand": candidate.brand,
            "title": candidate.title,
            "price": candidate.price,
            "availability": candidate.availability,
            "cpu": "",
            "ram_gb": "",
            "rom_gb": "",
            "gpu": "",
            "gpu_class": "",
            "has_dgpu": "",
            "size_inch": infer_monitor_size(candidate.text),
            "resolution": infer_resolution(candidate.text),
            "refresh_rate_hz": infer_refresh_rate(candidate.text),
            "panel_type": infer_panel_type(candidate.text),
            "has_usb_c": has_usb_c,
            "usb_c_power_delivery_w": usb_c_power,
            "detail_url": candidate.detail_url,
        }

    gpu, gpu_class, _gpu_score, has_dgpu = infer_gpu(candidate.text)
    return {
        "profile": profile,
        "asin": candidate.asin,
        "brand": candidate.brand,
        "title": pc_name(candidate, infer_cpu(candidate.text)),
        "price": candidate.price,
        "availability": candidate.availability,
        "cpu": infer_cpu(candidate.text),
        "ram_gb": infer_ram(candidate.text),
        "rom_gb": infer_rom(candidate.text),
        "gpu": gpu,
        "gpu_class": gpu_class,
        "has_dgpu": has_dgpu,
        "size_inch": "",
        "resolution": "",
        "refresh_rate_hz": "",
        "panel_type": "",
        "has_usb_c": "",
        "usb_c_power_delivery_w": "",
        "detail_url": candidate.detail_url,
    }


def write_review_csv(profile: str, candidates: list[Candidate], output_path: Path) -> None:
    fieldnames = [
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
    ]
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        for candidate in candidates:
            writer.writerow(candidate_review_row(profile, candidate))


def default_output_path(profile: str) -> Path:
    return Path("scripts") / f"insert_{profile.replace('-', '_')}_products.sql"


def default_review_output_path(profile: str) -> Path:
    return Path("scripts") / f"review_{profile.replace('-', '_')}_products.csv"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument("profile", choices=sorted(DEFAULT_QUERIES))
    parser.add_argument("--query", action="append", dest="queries", help="Amazon search keyword. Can be repeated.")
    parser.add_argument("--pages", type=int, default=1, help="Pages per keyword. SearchItems supports up to 10.")
    parser.add_argument("--item-count", type=int, default=10, help="Items per request. Max 10.")
    parser.add_argument("--max-add", type=int, default=20, help="Maximum candidates to write.")
    parser.add_argument("--condition", default="New", choices=["New", "Any"], help="Amazon condition.")
    parser.add_argument("--request-sleep", type=float, default=2.0, help="Seconds between API requests.")
    parser.add_argument("--env-file", default=".env.amazon", help="Optional env file with PAAPI_* keys.")
    parser.add_argument("--output", type=Path, help="Output SQL path.")
    parser.add_argument("--review-output", type=Path, help="Optional CSV path for reviewing candidates before SQL insertion.")
    parser.add_argument("--dry-run", action="store_true", help="Print candidates without writing SQL.")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    load_env_file(Path(args.env_file))
    review_output_path = args.review_output
    auto_review_output = False
    if not args.dry_run and review_output_path is None:
        review_output_path = default_review_output_path(args.profile)
        auto_review_output = True

    client_id = env_value("PAAPI_ACCESS_KEY")
    client_secret = env_value("PAAPI_SECRET_KEY")
    partner_tag = env_value("PAAPI_PARTNER_TAG")

    token = get_token(client_id, client_secret)
    queries = args.queries or DEFAULT_QUERIES[args.profile]
    pages = max(1, min(args.pages, 10))
    item_count = max(1, min(args.item_count, 10))

    candidates: list[Candidate] = []
    seen_asins: set[str] = set()
    skipped = {"duplicate": 0, "not_target": 0, "api_error": 0}

    for query in queries:
        if len(candidates) >= args.max_add:
            break
        print(f"Search: {query}")
        for page in range(1, pages + 1):
            if len(candidates) >= args.max_add:
                break
            try:
                items = search_items(
                    token,
                    partner_tag,
                    query,
                    item_page=page,
                    item_count=item_count,
                    condition=args.condition,
                )
            except urllib.error.HTTPError as error:
                body = error.read().decode("utf-8", errors="replace")
                print(f"  HTTP {error.code}: {body[:500]}", file=sys.stderr)
                skipped["api_error"] += 1
                break

            print(f"  page {page}: {len(items)} items")
            time.sleep(args.request_sleep)

            for item in items:
                candidate = to_candidate(item)
                if candidate is None:
                    continue
                if candidate.asin in seen_asins:
                    skipped["duplicate"] += 1
                    continue
                seen_asins.add(candidate.asin)
                if not is_valid_candidate(args.profile, candidate):
                    skipped["not_target"] += 1
                    continue
                candidates.append(candidate)
                print(f"    + {candidate.asin} {candidate.brand} {candidate.title[:80]} / {candidate.price}")
                if len(candidates) >= args.max_add:
                    break

    print(f"\nCandidates: {len(candidates)}")
    print(f"Skipped: {skipped}")

    if args.review_output:
        write_review_csv(args.profile, candidates, args.review_output)
        print(f"Review CSV written: {args.review_output}")

    if args.dry_run:
        return 0

    if not candidates:
        print(
            "No valid candidates found; SQL was not written. "
            "Check keywords, filters, credentials, or run with --dry-run first.",
            file=sys.stderr,
        )
        return 2

    output_path = args.output or default_output_path(args.profile)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    sql = monitor_insert_sql(candidates) if args.profile == "monitor" else pc_insert_sql(args.profile, candidates)
    output_path.write_text(sql, encoding="utf-8")
    if auto_review_output and review_output_path is not None:
        write_review_csv(args.profile, candidates, review_output_path)
        print(f"Review CSV written: {review_output_path}")
    print(f"SQL written: {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
