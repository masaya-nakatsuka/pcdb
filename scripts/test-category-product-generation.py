#!/usr/bin/env python3
"""
Local regression tests for category product SQL generation.

These tests do not call Amazon APIs. They exercise the parser, candidate
filters, SQL generation, and SQL validator with representative item payloads.
"""

from __future__ import annotations

import contextlib
import importlib.util
import io
import os
import sys
import tempfile
import unittest
from pathlib import Path
from types import ModuleType
from typing import Any

ROOT = Path(__file__).resolve().parents[1]


def load_script_module(name: str, path: Path) -> ModuleType:
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load {path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


generator = load_script_module("category_product_generator", ROOT / "scripts/generate-category-products.py")
validator = load_script_module("category_product_sql_validator", ROOT / "scripts/validate-category-products-sql.py")
review_validator = load_script_module("category_review_csv_validator", ROOT / "scripts/validate-category-review-csv.py")
readiness = load_script_module("category_product_readiness", ROOT / "scripts/check-category-product-readiness.py")
planner = load_script_module("category_product_planner", ROOT / "scripts/plan-category-products.py")


def amazon_item(
    *,
    asin: str,
    title: str,
    brand: str,
    price: int,
    features: list[str],
    detail_url: str | None = None,
    image_url: str = "https://example.com/image.jpg",
) -> dict[str, Any]:
    return {
        "asin": asin,
        "detailPageURL": detail_url or f"https://www.amazon.co.jp/dp/{asin}?tag=nmsuteado2-22",
        "itemInfo": {
            "title": {"displayValue": title},
            "features": {"displayValues": features},
            "byLineInfo": {"brand": {"displayValue": brand}},
        },
        "images": {"primary": {"medium": {"url": image_url}}},
        "offersV2": {
            "listings": [
                {
                    "price": {"money": {"amount": price}},
                    "availability": {"type": "IN_STOCK"},
                }
            ]
        },
    }


class CategoryProductGenerationTest(unittest.TestCase):
    def candidate_from_item(self, item: dict[str, Any]):
        candidate = generator.to_candidate(item)
        self.assertIsNotNone(candidate)
        return candidate

    def assert_sql_valid(self, sql: str) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            path = Path(tmp_dir) / "insert_products.sql"
            path.write_text(sql, encoding="utf-8")
            errors = validator.validate_sql(path)
        self.assertEqual(errors, [])

    def test_mini_pc_candidate_generates_valid_sql(self) -> None:
        item = amazon_item(
            asin="B0MINIPC01",
            title="MINISFORUM ミニPC Windows 11 Intel N100",
            brand="MINISFORUM",
            price=32980,
            features=["16GB DDR4 RAM", "512GB SSD", "Intel UHD Graphics", "小型PC"],
        )
        candidate = self.candidate_from_item(item)

        self.assertTrue(generator.is_valid_candidate("mini-pc", candidate))
        self.assertEqual(generator.infer_cpu(candidate.text), "N100")
        self.assertEqual(generator.infer_ram(candidate.text), 16)
        self.assertEqual(generator.infer_rom(candidate.text), 512)

        sql = generator.pc_insert_sql("mini-pc", [candidate])
        self.assertIn("'MiniPC'", sql)
        self.assertIn("url ILIKE '%B0MINIPC01%'", sql)
        self.assertIn("af_url ILIKE '%B0MINIPC01%'", sql)
        self.assert_sql_valid(sql)

        with tempfile.TemporaryDirectory() as tmp_dir:
            review_path = Path(tmp_dir) / "mini_pc_review.csv"
            generator.write_review_csv("mini-pc", [candidate], review_path)
            review_csv = review_path.read_text(encoding="utf-8")
            self.assertEqual(review_validator.validate_csv(review_path), [])
        self.assertIn("B0MINIPC01", review_csv)
        self.assertIn("N100", review_csv)
        self.assertIn("512", review_csv)

    def test_desktop_candidate_generates_valid_sql(self) -> None:
        item = amazon_item(
            asin="B0DESKPC01",
            title="ゲーミングPC デスクトップPC Core i5-14400F RTX 4060",
            brand="SpecsyTest",
            price=148000,
            features=["16GB RAM", "1TB SSD", "NVIDIA GeForce RTX 4060", "タワーPC"],
        )
        candidate = self.candidate_from_item(item)

        self.assertTrue(generator.is_valid_candidate("desktop-pc", candidate))
        self.assertEqual(generator.infer_cpu(candidate.text), "Core i5-14400F")
        self.assertEqual(generator.infer_rom(candidate.text), 1024)
        self.assertEqual(generator.infer_gpu(candidate.text), ("RTX 4060", "dgpu", 7, True))

        sql = generator.pc_insert_sql("desktop-pc", [candidate])
        self.assertIn("'Desktop'", sql)
        self.assertIn("'RTX 4060'", sql)
        self.assert_sql_valid(sql)

    def test_monitor_candidate_generates_valid_sql(self) -> None:
        item = amazon_item(
            asin="B0MONITOR1",
            title="27インチ モニター WQHD IPS 180Hz USB-C 65W",
            brand="DisplayTest",
            price=39800,
            features=["2560x1440", "Type-C Power Delivery 65W", "高さ調整"],
        )
        candidate = self.candidate_from_item(item)

        self.assertTrue(generator.is_valid_candidate("monitor", candidate))
        self.assertEqual(generator.infer_monitor_size(candidate.text), 27.0)
        self.assertEqual(generator.infer_resolution(candidate.text), "2560x1440")
        self.assertEqual(generator.infer_refresh_rate(candidate.text), 180)
        self.assertEqual(generator.infer_panel_type(candidate.text), "IPS")
        self.assertEqual(generator.infer_usb_c(candidate.text), (True, 65))

        sql = generator.monitor_insert_sql([candidate])
        self.assertIn("INSERT INTO am_monitor_data", sql)
        self.assertIn("'2560x1440'", sql)
        self.assert_sql_valid(sql)

        row = generator.candidate_review_row("monitor", candidate)
        self.assertEqual(row["size_inch"], 27.0)
        self.assertEqual(row["resolution"], "2560x1440")
        self.assertEqual(row["usb_c_power_delivery_w"], 65)

        with tempfile.TemporaryDirectory() as tmp_dir:
            review_path = Path(tmp_dir) / "monitor_review.csv"
            generator.write_review_csv("monitor", [candidate], review_path)
            self.assertEqual(review_validator.validate_csv(review_path), [])

    def test_rejects_used_pc_and_monitor_accessory(self) -> None:
        used_pc = self.candidate_from_item(amazon_item(
            asin="B0USEDPC01",
            title="中古 MINISFORUM ミニPC Windows 11 N100",
            brand="MINISFORUM",
            price=24800,
            features=["16GB RAM", "512GB SSD", "小型PC"],
        ))
        monitor_arm = self.candidate_from_item(amazon_item(
            asin="B0ARMTEST1",
            title="27インチ対応 モニターアーム ディスプレイスタンド",
            brand="ArmTest",
            price=12800,
            features=["モニター用", "クランプ式"],
        ))

        self.assertFalse(generator.is_valid_candidate("mini-pc", used_pc))
        self.assertFalse(generator.is_valid_candidate("monitor", monitor_arm))

    def test_review_validator_rejects_suspicious_rows(self) -> None:
        used_pc = self.candidate_from_item(amazon_item(
            asin="B0USEDPC01",
            title="中古 MINISFORUM ミニPC Windows 11 N100",
            brand="MINISFORUM",
            price=24800,
            features=["16GB RAM", "512GB SSD", "小型PC"],
        ))

        with tempfile.TemporaryDirectory() as tmp_dir:
            review_path = Path(tmp_dir) / "used_pc_review.csv"
            generator.write_review_csv("mini-pc", [used_pc], review_path)
            errors = review_validator.validate_csv(review_path)

        self.assertTrue(any("suspicious PC title word" in error for error in errors))

    def test_review_validator_reports_monitor_quality_warnings(self) -> None:
        monitor = self.candidate_from_item(amazon_item(
            asin="B0MONWARN1",
            title="27インチ モニター USB-C",
            brand="DisplayTest",
            price=24800,
            features=["Type-C対応"],
        ))

        with tempfile.TemporaryDirectory() as tmp_dir:
            review_path = Path(tmp_dir) / "monitor_warning_review.csv"
            generator.write_review_csv("monitor", [monitor], review_path)
            errors, warnings = review_validator.audit_csv(review_path)

        self.assertEqual(errors, [])
        self.assertTrue(any("resolution" in warning for warning in warnings))
        self.assertTrue(any("refresh_rate_hz" in warning for warning in warnings))
        self.assertTrue(any("panel_type" in warning for warning in warnings))

    def test_readiness_requires_review_csv_when_sql_exists(self) -> None:
        original_sql_files = readiness.SQL_FILES
        original_review_files = readiness.REVIEW_FILES

        with tempfile.TemporaryDirectory() as tmp_dir:
            sql_path = Path(tmp_dir) / "insert_mini_pc_products.sql"
            review_path = Path(tmp_dir) / "review_mini_pc_products.csv"
            sql_path.write_text("-- generated SQL placeholder", encoding="utf-8")

            try:
                readiness.SQL_FILES = {"mini-pc": sql_path}
                readiness.REVIEW_FILES = {"mini-pc": review_path}
                with contextlib.redirect_stdout(io.StringIO()):
                    blockers = readiness.check_review_files()
            finally:
                readiness.SQL_FILES = original_sql_files
                readiness.REVIEW_FILES = original_review_files

        self.assertEqual(
            blockers,
            [f"Generate/validate {review_path} with --review-output before using {sql_path}"],
        )

    def test_readiness_compares_sql_and_review_csv_asins(self) -> None:
        reviewed_item = amazon_item(
            asin="B0REVIEW01",
            title="MINISFORUM ミニPC Windows 11 Intel N100",
            brand="MINISFORUM",
            price=32980,
            features=["16GB DDR4 RAM", "512GB SSD", "Intel UHD Graphics", "小型PC"],
        )
        sql_item = amazon_item(
            asin="B0SQLONLY1",
            title="MINISFORUM ミニPC Windows 11 Intel N150",
            brand="MINISFORUM",
            price=35980,
            features=["16GB DDR4 RAM", "512GB SSD", "Intel UHD Graphics", "小型PC"],
        )
        reviewed_candidate = self.candidate_from_item(reviewed_item)
        sql_candidate = self.candidate_from_item(sql_item)

        with tempfile.TemporaryDirectory() as tmp_dir:
            sql_path = Path(tmp_dir) / "insert_mini_pc_products.sql"
            review_path = Path(tmp_dir) / "review_mini_pc_products.csv"
            sql_path.write_text(generator.pc_insert_sql("mini-pc", [sql_candidate]), encoding="utf-8")
            generator.write_review_csv("mini-pc", [reviewed_candidate], review_path)

            errors = readiness.compare_sql_review_asins(sql_path, review_path)
            self.assertTrue(any("B0SQLONLY1" in error for error in errors))
            self.assertTrue(any("B0REVIEW01" in error for error in errors))

            sql_path.write_text(generator.pc_insert_sql("mini-pc", [reviewed_candidate]), encoding="utf-8")
            self.assertEqual(readiness.compare_sql_review_asins(sql_path, review_path), [])

    def test_main_writes_default_review_csv_with_sql(self) -> None:
        item = amazon_item(
            asin="B0AUTOREV1",
            title="MINISFORUM ミニPC Windows 11 Intel N100",
            brand="MINISFORUM",
            price=32980,
            features=["16GB DDR4 RAM", "512GB SSD", "Intel UHD Graphics", "小型PC"],
        )

        original_argv = sys.argv
        original_cwd = Path.cwd()
        original_env = {key: os.environ.get(key) for key in ("PAAPI_ACCESS_KEY", "PAAPI_SECRET_KEY", "PAAPI_PARTNER_TAG")}
        original_get_token = generator.get_token
        original_search_items = generator.search_items
        try:
            os.environ["PAAPI_ACCESS_KEY"] = "dummy-access"
            os.environ["PAAPI_SECRET_KEY"] = "dummy-secret"
            os.environ["PAAPI_PARTNER_TAG"] = "dummy-tag"
            generator.get_token = lambda _client_id, _client_secret: "dummy-token"
            generator.search_items = lambda *_args, **_kwargs: [item]
            with tempfile.TemporaryDirectory() as tmp_dir:
                os.chdir(tmp_dir)
                sys.argv = [
                    "generate-category-products.py",
                    "mini-pc",
                    "--max-add",
                    "1",
                    "--request-sleep",
                    "0",
                ]
                stdout = io.StringIO()
                with contextlib.redirect_stdout(stdout):
                    exit_code = generator.main()
                output = stdout.getvalue()

                sql_path = Path("scripts/insert_mini_pc_products.sql")
                review_path = Path("scripts/review_mini_pc_products.csv")
                self.assertEqual(exit_code, 0)
                self.assertTrue(sql_path.exists())
                self.assertTrue(review_path.exists())
                self.assertIn("Validate SQL", output)
                self.assertIn("Validate REVIEW", output)
                self.assertEqual(readiness.compare_sql_review_asins(sql_path, review_path), [])
                self.assertEqual(review_validator.validate_csv(review_path), [])
        finally:
            sys.argv = original_argv
            os.chdir(original_cwd)
            generator.get_token = original_get_token
            generator.search_items = original_search_items
            for key, value in original_env.items():
                if value is None:
                    os.environ.pop(key, None)
                else:
                    os.environ[key] = value

    def test_plan_prints_monitor_execution_commands(self) -> None:
        stdout = io.StringIO()
        with contextlib.redirect_stdout(stdout):
            exit_code = planner.main(["monitor", "--max-add", "12"])
        output = stdout.getvalue()

        self.assertEqual(exit_code, 0)
        self.assertIn("Specsy category product plan", output)
        self.assertIn("Page: /monitor-list", output)
        self.assertIn("scripts/insert_monitor_products.sql", output)
        self.assertIn("scripts/review_monitor_products.csv", output)
        self.assertIn("モニター 24インチ IPS", output)
        self.assertIn("python3 scripts/generate-category-products.py monitor --dry-run", output)
        self.assertIn("python3 scripts/generate-category-products.py monitor --max-add 12", output)
        self.assertIn("npm run category:ready -- --skip-production", output)


if __name__ == "__main__":
    unittest.main()
