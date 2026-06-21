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
import subprocess
import sys
import time
import unicodedata
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

TODAY = dt.date.today().isoformat()
MARKETPLACE = "www.amazon.co.jp"
TOKEN_URL = "https://api.amazon.co.jp/auth/o2/token"
SEARCH_URL = "https://creatorsapi.amazon/catalog/v1/searchItems"
ASIN_TOKEN_RE = re.compile(r"\b[A-Z0-9]{10}\b", re.I)

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
    "tablet": [
        "iPad 11インチ 128GB",
        "iPad Air 11インチ",
        "iPad mini 128GB",
        "Android タブレット 11インチ 128GB",
        "Lenovo Tab Android 128GB",
        "Galaxy Tab Android 128GB",
        "Xiaomi Pad Android 128GB",
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
    "ミニパソコン",
    "ミニコンピューター",
    "minisforum",
    "gmktec",
    "beelink",
    "geekom",
    "acemagic",
    "aoostar",
    "nipogi",
    "trigkey",
]

MINI_PC_EXCLUDE_WORDS = [
    "ノートパソコン",
    "ノートpc",
    "ラップトップ",
    "タブレット",
    "タブレットpc",
    "2in1",
    "2-in-1",
    "2 in 1",
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

TABLET_EXCLUDE_WORDS = [
    "ケース",
    "カバー",
    "保護フィルム",
    "フィルム",
    "キーボード",
    "ペン",
    "タッチペン",
    "スタイラス",
    "スタンド",
    "ホルダー",
    "ケーブル",
    "充電器",
    "アダプタ",
    "中古",
    "整備済",
    "整備済み",
    "再生品",
    "refurbished",
    "renewed",
    "used",
    "windows",
    "ノートパソコン",
    "ノートpc",
    "タブレットpc",
    "2in1",
    "2-in-1",
    "surface",
    "fire hd",
    "fire max",
    "applecare",
    "セット買い",
]

ANDROID_TABLET_BRANDS = [
    "lenovo",
    "samsung",
    "galaxy",
    "xiaomi",
    "redmi",
    "oppo",
    "oneplus",
    "nec",
    "aiwa",
    "doogee",
    "teclast",
    "blackview",
    "headwolf",
    "iplay",
    "alldocube",
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


def canonical_text(value: str) -> str:
    without_marks = value.replace("™", " ").replace("®", " ")
    return re.sub(r"\s+", " ", unicodedata.normalize("NFKC", without_marks).replace("　", " ")).strip()


def normalized(value: str) -> str:
    return canonical_text(value).lower()


def includes_any(text: str, words: list[str]) -> bool:
    lower = normalized(text)
    return any(word in lower for word in words)


def infer_cpu(text: str) -> str:
    text = canonical_text(text)
    patterns = [
        (r"Core\s*Ultra\s*([975])\s*(\d{3}[A-Z]{0,2})", "Core Ultra {0} {1}"),
        (r"(?:Core\s*)?i([9753])[-\s]?(\d{4,5}(?:X3D|[A-Z]{1,3})?)", "Core i{0}-{1}"),
        (r"Ryzen\s+Embedded\s+(R\d{4})", "Ryzen Embedded {0}"),
        (r"Ryzen\s*([9753])\s*(PRO\s*)?(\d{3,5}(?:X3D|[A-Z]{1,3})?)", "Ryzen {0} {1} {2}"),
        (r"Ryzen\s*([9753])\s*(PRO\s*)?(40|150|170|220|250|255)", "Ryzen {0} {1} {2}"),
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
                groups = tuple((group or "").upper().strip() for group in match.groups())
                return re.sub(r"\s+", " ", label.format(*groups)).strip()
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


GENERIC_CPU_LABELS = {
    "Core i3",
    "Core i5",
    "Core i7",
    "Core i9",
    "Core Ultra 5",
    "Core Ultra 7",
    "Core Ultra 9",
    "Ryzen 3",
    "Ryzen 5",
    "Ryzen 7",
    "Ryzen 9",
}


def is_specific_cpu(cpu: str) -> bool:
    return bool(cpu and cpu not in GENERIC_CPU_LABELS)


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


def infer_tablet_os_family(candidate: Candidate) -> str | None:
    lower = normalized(f"{candidate.brand} {candidate.title} {candidate.text}")
    if "ipad" in lower or "apple" in lower:
        return "ipad"
    if "android" in lower:
        return "android"
    if "タブレット" in lower and any(brand in lower for brand in ANDROID_TABLET_BRANDS):
        return "android"
    return None


def infer_tablet_os_version(text: str, os_family: str | None) -> str | None:
    text = canonical_text(text)
    if os_family == "android":
        match = re.search(r"Android\s*(\d{1,2}(?:\.\d+)?)", text, re.I)
        return match.group(1) if match else None
    if os_family == "ipad":
        match = re.search(r"iPadOS\s*(\d{1,2}(?:\.\d+)?)", text, re.I)
        return match.group(1) if match else None
    return None


def infer_tablet_soc(text: str, os_family: str | None = None) -> tuple[str | None, int | None]:
    text = canonical_text(text)
    lower = normalized(text)
    apple_patterns = [
        (r"\bApple\s*M4\b|\bM4チップ\b|\bM4\b", "Apple M4", 35),
        (r"\bApple\s*M3\b|\bM3チップ\b|\bM3\b", "Apple M3", 33),
        (r"\bApple\s*M2\b|\bM2チップ\b|\bM2\b", "Apple M2", 30),
        (r"\bA17\s*Pro\b", "Apple A17 Pro", 29),
        (r"\bA16\b|A16\s*Bionic", "Apple A16", 25),
        (r"\bA15\b|A15\s*Bionic", "Apple A15", 22),
    ]
    if os_family == "ipad" or "ipad" in lower or "apple" in lower:
        for pattern, label, score in apple_patterns:
            if re.search(pattern, text, re.I):
                return label, score

    patterns = [
        (r"Snapdragon\s*8\s*Elite", "Snapdragon 8 Elite", 35),
        (r"Snapdragon\s*8\s*Gen\s*3", "Snapdragon 8 Gen 3", 33),
        (r"Snapdragon\s*8s\s*Gen\s*3", "Snapdragon 8s Gen 3", 29),
        (r"Snapdragon\s*8\s*Gen\s*2", "Snapdragon 8 Gen 2", 30),
        (r"Snapdragon\s*7\+\s*Gen\s*3", "Snapdragon 7+ Gen 3", 27),
        (r"Snapdragon\s*7\s*Gen\s*3", "Snapdragon 7 Gen 3", 23),
        (r"Snapdragon\s*680", "Snapdragon 680", 12),
        (r"Dimensity\s*9300", "Dimensity 9300", 32),
        (r"Dimensity\s*8400", "Dimensity 8400", 29),
        (r"Dimensity\s*8300", "Dimensity 8300", 27),
        (r"Dimensity\s*7300", "Dimensity 7300", 22),
        (r"Dimensity\s*7050", "Dimensity 7050", 20),
        (r"Helio\s*G100", "Helio G100", 16),
        (r"Helio\s*G99", "Helio G99", 15),
        (r"Helio\s*G88", "Helio G88", 11),
        (r"Unisoc\s*T820", "Unisoc T820", 14),
        (r"Unisoc\s*T616", "Unisoc T616", 9),
        (r"Unisoc\s*T615", "Unisoc T615", 9),
        (r"Unisoc\s*T606", "Unisoc T606", 8),
        (r"\bT606\b", "Unisoc T606", 8),
        (r"\bT616\b", "Unisoc T616", 9),
        (r"\bT615\b", "Unisoc T615", 9),
        (r"MT8781", "MediaTek MT8781", 15),
        (r"MT8183", "MediaTek MT8183", 8),
        (r"Exynos\s*1380", "Exynos 1380", 18),
    ]
    for pattern, label, score in patterns:
        if re.search(pattern, text, re.I):
            return label, score
    return None, None


def infer_tablet_ram(text: str) -> int | None:
    text = canonical_text(text)

    for pattern in [
        r"(\d{1,2})\s*(?:GB|ＧＢ)\s*(?:RAM|メモリ|LPDDR|DDR)",
        r"(?:RAM|メモリ|LPDDR|DDR)[^\d]{0,12}(\d{1,2})\s*(?:GB|ＧＢ)",
    ]:
        match = re.search(pattern, text, re.I)
        if match:
            value = int(match.group(1))
            if 1 <= value <= 32:
                return value

    match = re.search(r"\b(\d{1,2})\s*(?:GB|ＧＢ)?\s*\(\s*(\d{1,2})\s*\+\s*(\d{1,2})\s*(?:拡張|仮想)?\s*\)\s*(?:GB|ＧＢ)?", text, re.I)
    if match:
        value = int(match.group(2))
        if 1 <= value <= 32:
            return value

    match = re.search(r"\b(\d{1,2})\s*(?:GB|ＧＢ)\s*(?:\+|,|、)\s*(\d{2,4})\s*(?:GB|ＧＢ|TB|ＴＢ)\b", text, re.I)
    if match:
        value = int(match.group(1))
        if 1 <= value <= 12:
            return value

    match = re.search(r"\b(\d{1,2})\s*(?:GB|ＧＢ)\s*(?:Wi[-\s]?Fi|wifi)\b", text, re.I)
    if match:
        value = int(match.group(1))
        if 1 <= value <= 12:
            return value

    return None


def infer_tablet_storage(text: str) -> int | None:
    text = canonical_text(text)
    cleaned = re.sub(
        r"\+?\s*\d+(?:\.\d+)?\s*(?:TB|GB|T|G|ＴＢ|ＧＢ)\s*(?:まで)?\s*(?:microSD|MicroSD|sd|SD|拡張|拡張可能|増設)",
        " ",
        text,
        flags=re.I,
    )
    cleaned = re.sub(r"\d{2,4}\s*g\b", " ", cleaned, flags=re.I)

    for pattern in [
        r"(\d+(?:\.\d+)?)\s*(TB|GB|ＴＢ|ＧＢ)\s*(?:ROM|ストレージ|容量|eMMC|UFS)",
        r"(?:ROM|ストレージ|容量|eMMC|UFS)[^\d]{0,16}(\d+(?:\.\d+)?)\s*(TB|GB|ＴＢ|ＧＢ)",
    ]:
        match = re.search(pattern, cleaned, re.I)
        if not match:
            continue
        amount = float(match.group(1))
        unit = match.group(2).upper().replace("Ｔ", "T").replace("Ｇ", "G")
        value = int(round(amount * 1024)) if unit == "TB" else int(round(amount))
        if 32 <= value <= 2048:
            return value

    candidates = []
    for match in re.finditer(r"(\d{2,4})\s*(?:GB|ＧＢ)\b", cleaned, re.I):
        value = int(match.group(1))
        if 32 <= value <= 2048:
            candidates.append(value)
    if not candidates:
        return None
    return max(candidates)


def infer_candidate_tablet_storage(candidate: Candidate) -> int | None:
    return infer_tablet_storage(candidate.title) or infer_tablet_storage(candidate.text)


def infer_tablet_size(text: str) -> float | None:
    for match in re.finditer(r"(\d{1,2}(?:\.\d{1,2})?)\s*(?:インチ|型|inch|inches|\"|”)", text, re.I):
        value = float(match.group(1))
        if 7 <= value <= 15:
            return value
    return None


def infer_tablet_resolution(text: str) -> str | None:
    match = re.search(r"(\d{3,4})\s*[x×]\s*(\d{3,4})", text, re.I)
    if match:
        width = int(match.group(1))
        height = int(match.group(2))
        if 1024 <= width <= 4000 and 720 <= height <= 3000:
            return f"{width}x{height}"
    return None


def infer_battery_life_hours(text: str) -> int | None:
    values = []
    for match in re.finditer(r"(?:最大|約)?\s*(\d{1,2})\s*(?:時間|hours|hrs)", text, re.I):
        value = int(match.group(1))
        if 3 <= value <= 24:
            values.append(value)
    return max(values) if values else None


def infer_battery_capacity_mah(text: str) -> int | None:
    values = []
    for match in re.finditer(r"(\d{4,5})\s*mAh", text, re.I):
        value = int(match.group(1))
        if 2500 <= value <= 20000:
            values.append(value)
    return max(values) if values else None


def infer_weight_g(text: str) -> int | None:
    text = canonical_text(text)
    for match in re.finditer(r"(\d{2,4})\s*g\b", text, re.I):
        value = int(match.group(1))
        if 200 <= value <= 1200:
            return value
    for match in re.finditer(r"(\d(?:\.\d{1,3})?)\s*kg\b", text, re.I):
        value = int(float(match.group(1)) * 1000)
        if 200 <= value <= 1200:
            return value
    return None


def infer_has_cellular(text: str) -> bool:
    return bool(re.search(r"Cellular|セルラー|LTE|SIMフリー|SIM対応|4G\s*LTE|4GLTE|5G\s*(?:モバイル|携帯|通信)", text, re.I))


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

    if profile == "tablet":
        if includes_any(title_lower, TABLET_EXCLUDE_WORDS):
            return False
        os_family = infer_tablet_os_family(candidate)
        soc, _soc_score = infer_tablet_soc(candidate.text, os_family)
        return (
            os_family in {"android", "ipad"} and
            soc is not None and
            infer_candidate_tablet_storage(candidate) is not None and
            infer_tablet_size(candidate.text) is not None
        )

    if includes_any(title_lower, PC_EXCLUDE_WORDS):
        return False

    cpu = infer_cpu(candidate.text)
    ram = infer_ram(candidate.text)
    rom = infer_rom(candidate.text)
    if not is_specific_cpu(cpu) or not ram or not rom:
        return False

    if profile == "mini-pc":
        return includes_any(lower, MINI_PC_WORDS) and not includes_any(title_lower, MINI_PC_EXCLUDE_WORDS)

    if profile == "desktop-pc":
        return includes_any(lower, DESKTOP_PC_WORDS) and not includes_any(title_lower, MINI_PC_WORDS)

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
    if cpu and cpu.lower() not in canonical_text(cleaned).lower():
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


def tablet_insert_sql(candidates: list[Candidate]) -> str:
    cols = [
        "asin",
        "brand",
        "name",
        "series",
        "os_family",
        "os_version",
        "soc",
        "soc_score",
        "ram_gb",
        "rom_gb",
        "display_size_inch",
        "resolution",
        "refresh_rate_hz",
        "battery_life_hours",
        "battery_capacity_mah",
        "weight_g",
        "has_cellular",
        "price",
        "real_price",
        "url",
        "af_url",
        "img_url",
        "fetched_at",
        "is_active",
    ]
    lines = [
        f"-- Specsy tablet product INSERT SQL generated on {TODAY}",
        "-- Run scripts/create-tablet-data-table.sql first.",
        "-- Review candidates before running this in Supabase SQL Editor.",
        "BEGIN;",
        "",
    ]
    for candidate in candidates:
        os_family = infer_tablet_os_family(candidate)
        soc, soc_score = infer_tablet_soc(candidate.text, os_family)
        row = {
            "asin": candidate.asin,
            "brand": candidate.brand,
            "name": re.sub(r"\s+", " ", candidate.title).strip()[:140],
            "series": None,
            "os_family": os_family,
            "os_version": infer_tablet_os_version(candidate.text, os_family),
            "soc": soc,
            "soc_score": soc_score,
            "ram_gb": infer_tablet_ram(candidate.text),
            "rom_gb": infer_candidate_tablet_storage(candidate),
            "display_size_inch": infer_tablet_size(candidate.text),
            "resolution": infer_tablet_resolution(candidate.text),
            "refresh_rate_hz": infer_refresh_rate(candidate.text),
            "battery_life_hours": infer_battery_life_hours(candidate.text),
            "battery_capacity_mah": infer_battery_capacity_mah(candidate.text),
            "weight_g": infer_weight_g(candidate.text),
            "has_cellular": infer_has_cellular(candidate.text),
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
                numeric=col in {
                    "soc_score",
                    "ram_gb",
                    "rom_gb",
                    "display_size_inch",
                    "refresh_rate_hz",
                    "battery_life_hours",
                    "battery_capacity_mah",
                    "weight_g",
                    "price",
                    "real_price",
                },
                boolean=col in {"has_cellular", "is_active"},
            ))
        lines.append(f"INSERT INTO am_tablet_data ({', '.join(cols)})")
        lines.append(f"SELECT {', '.join(values)}")
        lines.append(
            "WHERE NOT EXISTS "
            f"(SELECT 1 FROM am_tablet_data WHERE asin = '{candidate.asin}' OR {asin_exists_condition('am_tablet_data', candidate.asin)});"
        )
    lines.extend(["", "COMMIT;", ""])
    return "\n".join(lines)


def candidate_review_row(profile: str, candidate: Candidate) -> dict[str, str | int | float | bool | None]:
    if profile == "tablet":
        os_family = infer_tablet_os_family(candidate)
        soc, soc_score = infer_tablet_soc(candidate.text, os_family)
        return {
            "profile": profile,
            "asin": candidate.asin,
            "brand": candidate.brand,
            "title": re.sub(r"\s+", " ", candidate.title).strip()[:140],
            "price": candidate.price,
            "availability": candidate.availability,
            "cpu": "",
            "ram_gb": infer_tablet_ram(candidate.text),
            "rom_gb": infer_candidate_tablet_storage(candidate),
            "gpu": "",
            "gpu_class": "",
            "has_dgpu": "",
            "size_inch": "",
            "resolution": infer_tablet_resolution(candidate.text),
            "refresh_rate_hz": infer_refresh_rate(candidate.text),
            "panel_type": "",
            "has_usb_c": "",
            "usb_c_power_delivery_w": "",
            "os_family": os_family,
            "os_version": infer_tablet_os_version(candidate.text, os_family),
            "soc": soc,
            "soc_score": soc_score,
            "display_size_inch": infer_tablet_size(candidate.text),
            "battery_life_hours": infer_battery_life_hours(candidate.text),
            "battery_capacity_mah": infer_battery_capacity_mah(candidate.text),
            "weight_g": infer_weight_g(candidate.text),
            "has_cellular": infer_has_cellular(candidate.text),
            "detail_url": candidate.detail_url,
        }

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
            "os_family": "",
            "os_version": "",
            "soc": "",
            "soc_score": "",
            "display_size_inch": "",
            "battery_life_hours": "",
            "battery_capacity_mah": "",
            "weight_g": "",
            "has_cellular": "",
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
        "os_family": "",
        "os_version": "",
        "soc": "",
        "soc_score": "",
        "display_size_inch": "",
        "battery_life_hours": "",
        "battery_capacity_mah": "",
        "weight_g": "",
        "has_cellular": "",
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
        "os_family",
        "os_version",
        "soc",
        "soc_score",
        "display_size_inch",
        "battery_life_hours",
        "battery_capacity_mah",
        "weight_g",
        "has_cellular",
        "detail_url",
    ]
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames, lineterminator="\n")
        writer.writeheader()
        for candidate in candidates:
            writer.writerow(candidate_review_row(profile, candidate))


def default_output_path(profile: str) -> Path:
    return Path("scripts") / f"insert_{profile.replace('-', '_')}_products.sql"


def default_review_output_path(profile: str) -> Path:
    return Path("scripts") / f"review_{profile.replace('-', '_')}_products.csv"


def parse_asins(value: str) -> set[str]:
    return {match.group(0).upper() for match in ASIN_TOKEN_RE.finditer(value)}


def load_excluded_asins(values: list[str] | None, files: list[Path] | None) -> set[str]:
    asins: set[str] = set()
    for value in values or []:
        asins.update(parse_asins(value))

    for path in files or []:
        if not path.exists():
            raise SystemExit(f"Exclude file not found: {path}")
        for raw_line in path.read_text(encoding="utf-8").splitlines():
            line = raw_line.split("#", 1)[0].strip()
            if line:
                asins.update(parse_asins(line))
    return asins


def run_validator(script_name: str, path: Path) -> tuple[bool, str]:
    script_path = Path(__file__).resolve().parent / script_name
    result = subprocess.run(
        [sys.executable, str(script_path), str(path)],
        check=False,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    output = "\n".join(part for part in (result.stdout.strip(), result.stderr.strip()) if part)
    return result.returncode == 0, output


def validate_generated_outputs(sql_path: Path, review_path: Path) -> bool:
    checks = [
        ("SQL", "validate-category-products-sql.py", sql_path),
        ("REVIEW", "validate-category-review-csv.py", review_path),
    ]
    all_ok = True
    for label, script_name, path in checks:
        ok, output = run_validator(script_name, path)
        print(f"Validate {label} {path}: {'ok' if ok else 'failed'}")
        if output:
            for line in output.splitlines():
                print(f"  {line}")
        if not ok:
            all_ok = False
    return all_ok


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
    parser.add_argument("--exclude-asin", action="append", dest="exclude_asins", help="ASIN to skip. Can be repeated.")
    parser.add_argument("--exclude-file", action="append", type=Path, dest="exclude_files", help="Text/CSV file containing ASINs to skip.")
    parser.add_argument("--skip-output-validation", action="store_true", help="Skip SQL/review CSV validation after writing outputs.")
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
    excluded_asins = load_excluded_asins(args.exclude_asins, args.exclude_files)
    if excluded_asins:
        print(f"Excluded ASINs loaded: {len(excluded_asins)}")

    candidates: list[Candidate] = []
    seen_asins: set[str] = set()
    skipped = {"duplicate": 0, "excluded": 0, "not_target": 0, "api_error": 0}

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
                if candidate.asin in excluded_asins:
                    skipped["excluded"] += 1
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
    if args.profile == "monitor":
        sql = monitor_insert_sql(candidates)
    elif args.profile == "tablet":
        sql = tablet_insert_sql(candidates)
    else:
        sql = pc_insert_sql(args.profile, candidates)
    output_path.write_text(sql, encoding="utf-8")
    if auto_review_output and review_output_path is not None:
        write_review_csv(args.profile, candidates, review_output_path)
        print(f"Review CSV written: {review_output_path}")
    print(f"SQL written: {output_path}")
    if review_output_path is not None and not args.skip_output_validation:
        if not validate_generated_outputs(output_path, review_output_path):
            return 3
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
