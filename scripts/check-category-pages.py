#!/usr/bin/env python3
"""
Check Specsy category pages after deploy or product insertion.

Examples:
  python3 scripts/check-category-pages.py
  python3 scripts/check-category-pages.py --base-url http://127.0.0.1:3000
  python3 scripts/check-category-pages.py --expect-data
"""

from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.parse
import urllib.request

DEFAULT_BASE_URL = "https://specsy-hub.com"

PAGE_CHECKS = [
    ("/pc-list/mini-pc", "Mini PCランキング"),
    ("/pc-list/desktop", "デスクトップPCランキング"),
    ("/monitor-list", "モニター比較"),
]

API_CHECKS = [
    ("mini_pc", "/api/pc-list?device=mini_pc"),
    ("desktop_pc", "/api/pc-list?device=desktop_pc"),
]


def fetch_text(url: str) -> tuple[int, str]:
    request = urllib.request.Request(url, headers={"User-Agent": "specsy-category-check/1.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.status, response.read().decode("utf-8", errors="replace")


def join_url(base_url: str, path: str) -> str:
    return urllib.parse.urljoin(base_url.rstrip("/") + "/", path.lstrip("/"))


def check_pages(base_url: str) -> list[str]:
    errors: list[str] = []

    for path, marker in PAGE_CHECKS:
        url = join_url(base_url, path)
        try:
            status, html = fetch_text(url)
        except urllib.error.URLError as error:
            errors.append(f"{path}: request failed: {error}")
            continue

        marker_found = marker in html
        print(f"PAGE {path}: HTTP {status}, marker={marker_found}")
        if status != 200:
            errors.append(f"{path}: expected HTTP 200, got {status}")
        if not marker_found:
            errors.append(f"{path}: marker not found: {marker}")

    return errors


def check_api_counts(base_url: str, expect_data: bool) -> list[str]:
    errors: list[str] = []

    for label, path in API_CHECKS:
        url = join_url(base_url, path)
        try:
            status, body = fetch_text(url)
        except urllib.error.URLError as error:
            errors.append(f"{path}: request failed: {error}")
            continue

        if status != 200:
            errors.append(f"{path}: expected HTTP 200, got {status}")
            continue

        try:
            payload = json.loads(body)
        except json.JSONDecodeError as error:
            errors.append(f"{path}: invalid JSON: {error}")
            continue

        if not isinstance(payload, list):
            errors.append(f"{path}: expected JSON array")
            continue

        count = len(payload)
        print(f"API {label}: {count} rows")
        if expect_data and count == 0:
            errors.append(f"{path}: expected at least one row after product insertion")

    return errors


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL, help="Base URL to check")
    parser.add_argument("--expect-data", action="store_true", help="Fail when Mini/Desktop API returns 0 rows")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    base_url = args.base_url.rstrip("/")

    print(f"Checking {base_url}")
    errors = check_pages(base_url)
    errors.extend(check_api_counts(base_url, args.expect_data))

    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
