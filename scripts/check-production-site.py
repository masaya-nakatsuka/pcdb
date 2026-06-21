#!/usr/bin/env python3
"""
Check production-visible Specsy Hub surfaces.

Examples:
  python3 scripts/check-production-site.py
  python3 scripts/check-production-site.py --base-url http://127.0.0.1:3000
  python3 scripts/check-production-site.py --expect-category-data
"""

from __future__ import annotations

import argparse
import html.parser
import json
import sys
import urllib.error
import urllib.parse
import urllib.request
from collections.abc import Iterable

DEFAULT_BASE_URL = "https://specsy-hub.com"

PAGE_MARKERS = [
    ("/", "Specsy"),
    ("/pc-list/cafe", "PCランキング"),
    ("/tablet-list", "タブレット比較"),
    ("/pc-list/mini-pc", "Mini PCランキング"),
    ("/pc-list/desktop", "デスクトップPCランキング"),
    ("/monitor-list", "モニター比較"),
    ("/monitor-list/work", "モニター比較"),
    ("/monitor-list/gaming", "モニター比較"),
    ("/monitor-list/creative", "モニター比較"),
    ("/monitor-list/usb-c", "モニター比較"),
]

API_CHECKS = [
    ("cafe", "/api/pc-list?category=cafe&device=notebook_pc", True),
    ("tablet", "/api/tablet-list", False),
    ("mini_pc", "/api/pc-list?device=mini_pc", False),
    ("desktop_pc", "/api/pc-list?device=desktop_pc", False),
    ("monitor", "/api/monitor-list", False),
]


class AssetParser(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.stylesheets: list[str] = []
        self.scripts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr_map = {name: value for name, value in attrs}
        if tag == "link" and attr_map.get("rel") == "stylesheet" and attr_map.get("href"):
            self.stylesheets.append(attr_map["href"] or "")
        if tag == "script" and attr_map.get("src"):
            self.scripts.append(attr_map["src"] or "")


def fetch_text(url: str) -> tuple[int, str]:
    request = urllib.request.Request(url, headers={"User-Agent": "specsy-production-check/1.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.status, response.read().decode("utf-8", errors="replace")


def join_url(base_url: str, path: str) -> str:
    return urllib.parse.urljoin(base_url.rstrip("/") + "/", path.lstrip("/"))


def resolve_asset_url(base_url: str, asset_url: str) -> str:
    return urllib.parse.urljoin(base_url.rstrip("/") + "/", asset_url)


def collect_assets(base_url: str, html: str) -> tuple[list[str], list[str]]:
    parser = AssetParser()
    parser.feed(html)
    stylesheets = [resolve_asset_url(base_url, href) for href in parser.stylesheets]
    scripts = [resolve_asset_url(base_url, src) for src in parser.scripts]
    return stylesheets, scripts


def has_arrow_content(css: str) -> bool:
    normalized = css.replace(" ", "").lower()
    return any(
        marker in normalized
        for marker in (
            'content:"↗"',
            "content:'↗'",
            'content:"\\2197"',
            "content:'\\2197'",
            "\\00002197",
        )
    )


def fetch_assets(urls: Iterable[str]) -> list[tuple[str, str]]:
    assets: list[tuple[str, str]] = []
    for url in urls:
        try:
            _, body = fetch_text(url)
        except urllib.error.URLError as error:
            print(f"WARN: asset fetch failed: {url}: {error}", file=sys.stderr)
            continue
        assets.append((url, body))
    return assets


def check_pages(base_url: str) -> tuple[dict[str, str], list[str]]:
    html_by_path: dict[str, str] = {}
    errors: list[str] = []

    for path, marker in PAGE_MARKERS:
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
        html_by_path[path] = html

    return html_by_path, errors


def check_api(base_url: str, expect_category_data: bool) -> list[str]:
    errors: list[str] = []

    for label, path, required in API_CHECKS:
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
        rows_with_links = sum(1 for row in payload if isinstance(row, dict) and (row.get("af_url") or row.get("url")))
        print(f"API {label}: {count} rows, product_links={rows_with_links}")

        if required and count == 0:
            errors.append(f"{path}: expected at least one row")
        if required and rows_with_links == 0:
            errors.append(f"{path}: expected at least one row with af_url or url")
        if expect_category_data and not required and count == 0:
            errors.append(f"{path}: expected at least one row after category product insertion")

    return errors


def check_external_link_markers(base_url: str, html_by_path: dict[str, str]) -> list[str]:
    errors: list[str] = []
    home_html = html_by_path.get("/", "")
    cafe_html = html_by_path.get("/pc-list/cafe", "")

    if "external-link-mark" not in home_html:
        errors.append("/: external-link-mark class not found in server HTML")

    stylesheets, home_scripts = collect_assets(base_url, home_html)
    _, cafe_scripts = collect_assets(base_url, cafe_html)
    scripts = list(dict.fromkeys([*home_scripts, *cafe_scripts]))

    css_assets = fetch_assets(stylesheets)
    css_with_class = [url for url, body in css_assets if ".external-link-mark" in body]
    css_with_arrow = [url for url, body in css_assets if has_arrow_content(body)]
    print(f"ASSET css: {len(css_assets)} files, external_class={len(css_with_class)}, arrow_content={len(css_with_arrow)}")

    if not css_with_class:
        errors.append("CSS asset: .external-link-mark rule not found")
    if not css_with_arrow:
        errors.append("CSS asset: external-link-mark arrow content not found")

    script_assets = fetch_assets(scripts)
    script_with_class = [url for url, body in script_assets if "external-link-mark" in body]
    print(f"ASSET js: {len(script_assets)} files, external_class={len(script_with_class)}")

    if not script_with_class:
        errors.append("JS asset: external-link-mark class not found for client-rendered PC links")

    return errors


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL, help="Base URL to check")
    parser.add_argument(
        "--expect-category-data",
        action="store_true",
        help="Fail when Mini/Desktop/Monitor API returns 0 rows after category product insertion",
    )
    return parser


def main() -> int:
    args = build_parser().parse_args()
    base_url = args.base_url.rstrip("/")

    print(f"Checking {base_url}")
    html_by_path, errors = check_pages(base_url)
    errors.extend(check_api(base_url, args.expect_category_data))
    errors.extend(check_external_link_markers(base_url, html_by_path))

    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
