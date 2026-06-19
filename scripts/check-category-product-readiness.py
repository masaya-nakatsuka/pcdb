#!/usr/bin/env python3
"""
Check whether Specsy category product insertion is ready to run.

This script intentionally reports readiness without printing credential values.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

DEFAULT_BASE_URL = "https://specsy-hub.com"
REQUIRED_ENV_KEYS = ("PAAPI_ACCESS_KEY", "PAAPI_SECRET_KEY", "PAAPI_PARTNER_TAG")
SQL_FILES = {
    "mini-pc": Path("scripts/insert_mini_pc_products.sql"),
    "desktop-pc": Path("scripts/insert_desktop_pc_products.sql"),
    "monitor": Path("scripts/insert_monitor_products.sql"),
}
API_CHECKS = {
    "mini-pc": "/api/pc-list?device=mini_pc",
    "desktop-pc": "/api/pc-list?device=desktop_pc",
    "monitor": "/api/monitor-list",
}


def parse_env_file(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    if not path.exists():
        return values

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip("\"'")
    return values


def looks_placeholder(value: str) -> bool:
    lowered = value.lower()
    return not value or "xxxxx" in lowered or lowered in {"todo", "change-me", "changeme"}


def check_env(env_file: Path) -> list[str]:
    blockers: list[str] = []
    values = parse_env_file(env_file)

    if not env_file.exists():
        print(f"ENV {env_file}: missing")
        return [f"Create {env_file} from .env.amazon.example and fill PAAPI credentials"]

    print(f"ENV {env_file}: found")
    for key in REQUIRED_ENV_KEYS:
        value = values.get(key, "")
        ok = not looks_placeholder(value)
        print(f"ENV {key}: {'ok' if ok else 'missing/placeholder'}")
        if not ok:
            blockers.append(f"Set {key} in {env_file}")
    return blockers


def validate_sql_file(path: Path) -> tuple[bool, str]:
    result = subprocess.run(
        [sys.executable, "scripts/validate-category-products-sql.py", str(path)],
        check=False,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    output = "\n".join(part for part in (result.stdout.strip(), result.stderr.strip()) if part)
    return result.returncode == 0, output


def check_sql_files() -> list[str]:
    blockers: list[str] = []
    existing_files: list[Path] = []

    for label, path in SQL_FILES.items():
        if path.exists():
            existing_files.append(path)
            print(f"SQL {label}: found {path}")
        else:
            print(f"SQL {label}: missing {path}")
            blockers.append(f"Generate {path} with scripts/generate-category-products.py")

    for path in existing_files:
        ok, output = validate_sql_file(path)
        print(f"SQL validate {path}: {'ok' if ok else 'failed'}")
        if output:
            for line in output.splitlines():
                print(f"  {line}")
        if not ok:
            blockers.append(f"Fix validation errors in {path}")

    return blockers


def fetch_text(url: str) -> tuple[int, str]:
    request = urllib.request.Request(url, headers={"User-Agent": "specsy-category-readiness/1.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.status, response.read().decode("utf-8", errors="replace")


def join_url(base_url: str, path: str) -> str:
    return urllib.parse.urljoin(base_url.rstrip("/") + "/", path.lstrip("/"))


def check_production(base_url: str, expect_data: bool) -> list[str]:
    blockers: list[str] = []

    for label, path in API_CHECKS.items():
        url = join_url(base_url, path)
        try:
            status, body = fetch_text(url)
        except urllib.error.URLError as error:
            print(f"PRODUCTION {label}: request failed: {error}")
            blockers.append(f"Check production API manually: {path}")
            continue

        if status != 200:
            print(f"PRODUCTION {label}: HTTP {status}")
            blockers.append(f"Fix production API status for {path}")
            continue

        try:
            payload = json.loads(body)
        except json.JSONDecodeError as error:
            print(f"PRODUCTION {label}: invalid JSON: {error}")
            blockers.append(f"Fix production API JSON for {path}")
            continue

        if not isinstance(payload, list):
            print(f"PRODUCTION {label}: non-array JSON")
            blockers.append(f"Fix production API payload for {path}")
            continue

        count = len(payload)
        print(f"PRODUCTION {label}: {count} rows")
        if expect_data and count == 0:
            blockers.append(f"Insert products for {label}; production API still returns 0 rows")

    return blockers


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument("--env-file", type=Path, default=Path(".env.amazon"))
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    parser.add_argument("--skip-production", action="store_true")
    parser.add_argument(
        "--expect-data",
        action="store_true",
        help="Also fail when category production APIs return 0 rows",
    )
    return parser


def main() -> int:
    args = build_parser().parse_args()
    blockers: list[str] = []

    print("Checking Specsy category product readiness")
    blockers.extend(check_env(args.env_file))

    monitor_table_sql = Path("scripts/create-monitor-data-table.sql")
    print(f"MIGRATION monitor table SQL: {'found' if monitor_table_sql.exists() else 'missing'} {monitor_table_sql}")
    if not monitor_table_sql.exists():
        blockers.append(f"Restore {monitor_table_sql}")

    blockers.extend(check_sql_files())
    if not args.skip_production:
        blockers.extend(check_production(args.base_url.rstrip("/"), args.expect_data))

    if blockers:
        print("\nBLOCKERS:")
        for blocker in blockers:
            print(f"- {blocker}")
        return 1

    print("\nREADY: category product SQL and production checks are clear.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
