#!/usr/bin/env python3
"""
Print a repeatable execution plan for Specsy category product insertion.

This does not call Amazon APIs. It only exposes the category-specific paths,
queries, and commands that should be used before generating SQL.
"""

from __future__ import annotations

import argparse
import importlib.util
import shlex
import sys
from pathlib import Path
from types import ModuleType

GENERATOR_PATH = Path(__file__).resolve().parent / "generate-category-products.py"
DEFAULT_ORDER = ["monitor", "tablet", "mini-pc", "desktop-pc"]

CATEGORY_LABELS = {
    "monitor": "モニター",
    "tablet": "タブレット",
    "mini-pc": "Mini PC",
    "desktop-pc": "デスクトップPC",
}

CATEGORY_PAGES = {
    "monitor": "/monitor-list",
    "tablet": "/tablet-list",
    "mini-pc": "/pc-list/mini-pc",
    "desktop-pc": "/pc-list/desktop",
}


def load_generator() -> ModuleType:
    spec = importlib.util.spec_from_file_location("specsy_category_product_generator", GENERATOR_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load {GENERATOR_PATH}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


generator = load_generator()


def shell_join(parts: list[str | Path | int]) -> str:
    return " ".join(shlex.quote(str(part)) for part in parts)


def command_parts(profile: str, *, dry_run: bool, max_add: int, pages: int, item_count: int) -> list[str | Path | int]:
    parts: list[str | Path | int] = [
        "python3",
        "scripts/generate-category-products.py",
        profile,
    ]
    if dry_run:
        parts.extend(["--dry-run", "--review-output", generator.default_review_output_path(profile)])
    else:
        parts.extend(["--max-add", max_add])
    if pages != 1:
        parts.extend(["--pages", pages])
    if item_count != 10:
        parts.extend(["--item-count", item_count])
    return parts


def print_profile_plan(profile: str, index: int, total: int, *, max_add: int, pages: int, item_count: int) -> None:
    print(f"[{index}/{total}] {profile} / {CATEGORY_LABELS[profile]}")
    print(f"Page: {CATEGORY_PAGES[profile]}")
    print(f"SQL: {generator.default_output_path(profile)}")
    print(f"Review CSV: {generator.default_review_output_path(profile)}")
    print("Search queries:")
    for query in generator.DEFAULT_QUERIES[profile]:
        print(f"- {query}")
    print("Dry-run:")
    print(f"  {shell_join(command_parts(profile, dry_run=True, max_add=max_add, pages=pages, item_count=item_count))}")
    print("Generate after CSV review:")
    print(f"  {shell_join(command_parts(profile, dry_run=False, max_add=max_add, pages=pages, item_count=item_count))}")
    print("")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "profiles",
        nargs="*",
        choices=sorted(generator.DEFAULT_QUERIES),
        help="Category profile(s) to plan. Defaults to monitor, mini-pc, desktop-pc.",
    )
    parser.add_argument("--max-add", type=int, default=20, help="Maximum products to generate per category.")
    parser.add_argument("--pages", type=int, default=1, help="Amazon API pages per keyword.")
    parser.add_argument("--item-count", type=int, default=10, help="Amazon API items per request.")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    profiles = args.profiles or DEFAULT_ORDER
    max_add = max(1, args.max_add)
    pages = max(1, min(args.pages, 10))
    item_count = max(1, min(args.item_count, 10))

    print("Specsy category product plan")
    print(f"Order: {' -> '.join(profiles)}")
    print("")
    print("Prerequisite:")
    print("  npm run category:ready -- --skip-production")
    print("")
    for index, profile in enumerate(profiles, start=1):
        print_profile_plan(profile, index, len(profiles), max_add=max_add, pages=pages, item_count=item_count)
    print("Validate before Supabase:")
    print("  npm run category:review")
    print("  npm run category:ready -- --skip-production")
    print("Validate after Supabase/deploy:")
    print("  npm run production:check -- --expect-category-data")
    print("  npm run category:ready -- --expect-data")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
