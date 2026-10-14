-- Specsy product price refresh SQL generated on 2026-06-30
-- Source: Amazon Creators API GetItems.
-- Review unavailable products before choosing to deactivate them.
BEGIN;

UPDATE am_pc_data SET price = 152980, real_price = 152980, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 83 OR (url ILIKE '%B0GGBQ79JM%' OR af_url ILIKE '%B0GGBQ79JM%'));
UPDATE am_pc_data SET price = 108000, real_price = 108000, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 58 OR (url ILIKE '%B0DW8S7F8D%' OR af_url ILIKE '%B0DW8S7F8D%'));
-- Unavailable: B0F7X59ZJC NewBook 11 2in1 ノートパソコン / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 22 OR (url ILIKE '%B0F7X59ZJC%' OR af_url ILIKE '%B0F7X59ZJC%'));
-- Unavailable: B0G6B5QNTF CHUWI ノートパソコン Office 2024搭載 10.5インチMiniBook X N150 16G RAM+512G ROM(1TBSSD拡張)+ 3 / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 52 OR (url ILIKE '%B0G6B5QNTF%' OR af_url ILIKE '%B0G6B5QNTF%'));
-- Unavailable: B0F5WDGQS7 CHUWI 2in1 ノートパソコン Office 2024搭載 MiniBook X windows 11 Celeron N150 10.51インチ16G / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 53 OR (url ILIKE '%B0F5WDGQS7%' OR af_url ILIKE '%B0F5WDGQS7%'));
-- Unavailable: B0CKW3HZRP P8 / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 49 OR (url ILIKE '%B0CKW3HZRP%' OR af_url ILIKE '%B0CKW3HZRP%'));
-- Unavailable: B0DFQDV63F BP8 / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 43 OR (url ILIKE '%B0DFQDV63F%' OR af_url ILIKE '%B0DFQDV63F%'));
-- Unavailable: B0F9P8DSW2 P8 / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 51 OR (url ILIKE '%B0F9P8DSW2%' OR af_url ILIKE '%B0F9P8DSW2%'));
UPDATE am_pc_data SET price = 70150, real_price = 70150, fetched_at = '2026-06-30', is_active = true, availability = 'LEADTIME' WHERE (id = 55 OR (url ILIKE '%B0DMT7XHF3%' OR af_url ILIKE '%B0DMT7XHF3%'));
UPDATE am_pc_data SET price = 71900, real_price = 71900, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 61 OR (url ILIKE '%B0FRF7K7NM%' OR af_url ILIKE '%B0FRF7K7NM%'));
-- Unavailable: B0CW9Q3LPJ KUU-INSBOOK N100 / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 9 OR (url ILIKE '%B0CW9Q3LPJ%' OR af_url ILIKE '%B0CW9Q3LPJ%'));
-- Unavailable: B0F6B5RXBV 2 IN 1 / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 12 OR (url ILIKE '%B0F6B5RXBV%' OR af_url ILIKE '%B0F6B5RXBV%'));
-- Unavailable: B0DXFF9T68 AePad UNP100-2025 / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 25 OR (url ILIKE '%B0DXFF9T68%' OR af_url ILIKE '%B0DXFF9T68%'));
-- Unavailable: B095SZJ685 X133 / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 45 OR (url ILIKE '%B095SZJ685%' OR af_url ILIKE '%B095SZJ685%'));
UPDATE am_pc_data SET price = 154790, real_price = 154790, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 82 OR (url ILIKE '%B0GGBVBCJM%' OR af_url ILIKE '%B0GGBVBCJM%'));
-- Unavailable: B0F8QTL46X MiniBook X N150 / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 1 OR (url ILIKE '%B0F8QTL46X%' OR af_url ILIKE '%B0F8QTL46X%'));
-- Unavailable: B0CFDG6NJ8 MiniBook X N100 / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 4 OR (url ILIKE '%B0CFDG6NJ8%' OR af_url ILIKE '%B0CFDG6NJ8%'));
UPDATE am_pc_data SET price = 60999, real_price = 60999, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 7 OR (url ILIKE '%B0C3W2KH82%' OR af_url ILIKE '%B0C3W2KH82%'));
UPDATE am_pc_data SET price = 64999, real_price = 64999, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 44 OR (url ILIKE '%B0DFQBSQBL%' OR af_url ILIKE '%B0DFQBSQBL%'));
UPDATE am_pc_data SET price = 64999, real_price = 64999, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 48 OR (url ILIKE '%B0CKW2H77V%' OR af_url ILIKE '%B0CKW2H77V%'));
-- Unavailable: B0F9P845T2 P8 / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 50 OR (url ILIKE '%B0F9P845T2%' OR af_url ILIKE '%B0F9P845T2%'));
UPDATE am_pc_data SET price = 65900, real_price = 65900, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 57 OR (url ILIKE '%B0FRD7KLYM%' OR af_url ILIKE '%B0FRD7KLYM%'));
-- Unavailable: B0CXDLXP4V Hi10 Max / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 2 OR (url ILIKE '%B0CXDLXP4V%' OR af_url ILIKE '%B0CXDLXP4V%'));
-- Unavailable: B0DQKY4N3Q FreeBook N150 / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 6 OR (url ILIKE '%B0DQKY4N3Q%' OR af_url ILIKE '%B0DQKY4N3Q%'));
-- Unavailable: B0DZ281XCZ AePad Mini Set 2025 / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 23 OR (url ILIKE '%B0DZ281XCZ%' OR af_url ILIKE '%B0DZ281XCZ%'));
-- Unavailable: B0DZ28N158 AePad Mini Single 2025 / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 24 OR (url ILIKE '%B0DZ28N158%' OR af_url ILIKE '%B0DZ28N158%'));
UPDATE am_pc_data SET price = 59999, real_price = 59999, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 47 OR (url ILIKE '%B0F63RBG18%' OR af_url ILIKE '%B0F63RBG18%'));
UPDATE am_pc_data SET price = 139800, real_price = 139800, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 78 OR (url ILIKE '%B0GL1N6RCH%' OR af_url ILIKE '%B0GL1N6RCH%'));
UPDATE am_pc_data SET price = 65999, real_price = 65999, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 15 OR (url ILIKE '%B0D6362JGS%' OR af_url ILIKE '%B0D6362JGS%'));
UPDATE am_pc_data SET price = 61999, real_price = 61999, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 38 OR (url ILIKE '%B0FB92JQJQ%' OR af_url ILIKE '%B0FB92JQJQ%'));
-- Unavailable: B0D9H881RV LONGEVINCE / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 40 OR (url ILIKE '%B0D9H881RV%' OR af_url ILIKE '%B0D9H881RV%'));
UPDATE am_pc_data SET price = 59999, real_price = 59999, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 42 OR (url ILIKE '%B0F9W9VTB2%' OR af_url ILIKE '%B0F9W9VTB2%'));
-- Unavailable: B0F6YS8DTB N1 / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 41 OR (url ILIKE '%B0F6YS8DTB%' OR af_url ILIKE '%B0F6YS8DTB%'));
UPDATE am_pc_data SET price = 63999, real_price = 63999, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 54 OR (url ILIKE '%B0FN2XBDW9%' OR af_url ILIKE '%B0FN2XBDW9%'));
UPDATE am_pc_data SET price = 129400, real_price = 129400, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 81 OR (url ILIKE '%B0FCCMLDDM%' OR af_url ILIKE '%B0FCCMLDDM%'));
-- Unavailable: B0DTPCJ7X1 純正品2025モデル Wingame QHD 2in1ノートパソコン / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 20 OR (url ILIKE '%B0DTPCJ7X1%' OR af_url ILIKE '%B0DTPCJ7X1%'));
UPDATE am_pc_data SET price = 55999, real_price = 55999, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 46 OR (url ILIKE '%B0F63T6LHL%' OR af_url ILIKE '%B0F63T6LHL%'));
UPDATE am_pc_data SET price = 63999, real_price = 63999, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 56 OR (url ILIKE '%B0DYN9HJ3X%' OR af_url ILIKE '%B0DYN9HJ3X%'));
UPDATE am_pc_data SET price = 160404, real_price = 160404, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 67 OR (url ILIKE '%B0FQ6PCF9R%' OR af_url ILIKE '%B0FQ6PCF9R%'));
-- Unavailable: B0C8CJ98R7 Hi10 X1 N150 / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 3 OR (url ILIKE '%B0C8CJ98R7%' OR af_url ILIKE '%B0C8CJ98R7%'));
-- Unavailable: B0D634LYL8 10.95 2in1 ノートパソコン / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 13 OR (url ILIKE '%B0D634LYL8%' OR af_url ILIKE '%B0D634LYL8%'));
UPDATE am_pc_data SET price = 61990, real_price = 61990, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 16 OR (url ILIKE '%B0F5B9YBKM%' OR af_url ILIKE '%B0F5B9YBKM%'));
-- Unavailable: B0DB8G546J null / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 37 OR (url ILIKE '%B0DB8G546J%' OR af_url ILIKE '%B0DB8G546J%'));
-- Unavailable: B0D9H8YNXY LONGEVINCE / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 39 OR (url ILIKE '%B0D9H8YNXY%' OR af_url ILIKE '%B0D9H8YNXY%'));
UPDATE am_pc_data SET price = 65999, real_price = 65999, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 73 OR (url ILIKE '%B0G3NRDBK6%' OR af_url ILIKE '%B0G3NRDBK6%'));
-- Unavailable: B0F8Q32XSX FreeBook N100 / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 5 OR (url ILIKE '%B0F8Q32XSX%' OR af_url ILIKE '%B0F8Q32XSX%'));
UPDATE am_pc_data SET price = 40850, real_price = 40850, fetched_at = '2026-06-30', is_active = true, availability = 'AVAILABLE_DATE' WHERE (id = 92 OR (url ILIKE '%B0FP59377M%' OR af_url ILIKE '%B0FP59377M%'));
UPDATE am_pc_data SET price = 109800, real_price = 109800, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 80 OR (url ILIKE '%B0GY8PLVC1%' OR af_url ILIKE '%B0GY8PLVC1%'));
UPDATE am_pc_data SET price = 109800, real_price = 109800, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 68 OR (url ILIKE '%B0G6CFC2Z2%' OR af_url ILIKE '%B0G6CFC2Z2%'));
UPDATE am_pc_data SET price = 119980, real_price = 119980, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 77 OR (url ILIKE '%B0FCCM4TX1%' OR af_url ILIKE '%B0FCCM4TX1%'));
UPDATE am_pc_data SET price = 139800, real_price = 139800, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 84 OR (url ILIKE '%B0G6CY1J9Z%' OR af_url ILIKE '%B0G6CY1J9Z%'));
-- Unavailable: B0DHN2Q54K P8 / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 33 OR (url ILIKE '%B0DHN2Q54K%' OR af_url ILIKE '%B0DHN2Q54K%'));
UPDATE am_pc_data SET price = 69900, real_price = 69900, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 63 OR (url ILIKE '%B0G48MD9NX%' OR af_url ILIKE '%B0G48MD9NX%'));
UPDATE am_pc_data SET price = 131800, real_price = 131800, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 71 OR (url ILIKE '%B0G57XGX81%' OR af_url ILIKE '%B0G57XGX81%'));
UPDATE am_pc_data SET price = 64900, real_price = 64900, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 72 OR (url ILIKE '%B0G3X4V2VK%' OR af_url ILIKE '%B0G3X4V2VK%'));
UPDATE am_pc_data SET price = 145280, real_price = 145280, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 79 OR (url ILIKE '%B0GGBBN53G%' OR af_url ILIKE '%B0GGBBN53G%'));
-- Unavailable: B0CRZ13JH9 Ultra Pocket PC / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 18 OR (url ILIKE '%B0CRZ13JH9%' OR af_url ILIKE '%B0CRZ13JH9%'));
-- Unavailable: B0DLNVC9WQ HL140P16512VS / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 34 OR (url ILIKE '%B0DLNVC9WQ%' OR af_url ILIKE '%B0DLNVC9WQ%'));
UPDATE am_pc_data SET price = 139900, real_price = 139900, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 70 OR (url ILIKE '%B0FW4DV6V4%' OR af_url ILIKE '%B0FW4DV6V4%'));
-- Unavailable: B0DTP97ZZ8 2025モデル Wingame QHD 2in1ノートパソコン / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 19 OR (url ILIKE '%B0DTP97ZZ8%' OR af_url ILIKE '%B0DTP97ZZ8%'));
UPDATE am_pc_data SET price = 66900, real_price = 66900, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 74 OR (url ILIKE '%B0H2PG6QHC%' OR af_url ILIKE '%B0H2PG6QHC%'));
UPDATE am_pc_data SET price = 65999, real_price = 65999, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 76 OR (url ILIKE '%B0G3NRKMJS%' OR af_url ILIKE '%B0G3NRKMJS%'));
UPDATE am_pc_data SET price = 59900, real_price = 59900, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 17 OR (url ILIKE '%B0CRZ36VB9%' OR af_url ILIKE '%B0CRZ36VB9%'));
-- Unavailable: B0DMF4N955 null / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 36 OR (url ILIKE '%B0DMF4N955%' OR af_url ILIKE '%B0DMF4N955%'));
UPDATE am_pc_data SET price = 54999, real_price = 54999, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 62 OR (url ILIKE '%B0C4GVSJ6N%' OR af_url ILIKE '%B0C4GVSJ6N%'));
UPDATE am_pc_data SET price = 26500, real_price = 26500, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 89 OR (url ILIKE '%B0FG1NKM8L%' OR af_url ILIKE '%B0FG1NKM8L%'));
UPDATE am_pc_data SET price = 22700, real_price = 22700, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 93 OR (url ILIKE '%B0CZSYDR5H%' OR af_url ILIKE '%B0CZSYDR5H%'));
UPDATE am_pc_data SET price = 16800, real_price = 16800, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 94 OR (url ILIKE '%B0FDVH9T97%' OR af_url ILIKE '%B0FDVH9T97%'));
-- Unavailable: B0D2M9KYFT N-10 / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 30 OR (url ILIKE '%B0D2M9KYFT%' OR af_url ILIKE '%B0D2M9KYFT%'));
UPDATE am_pc_data SET price = 19800, real_price = 19800, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 100 OR (url ILIKE '%B0FCFCZ5YT%' OR af_url ILIKE '%B0FCFCZ5YT%'));
-- Unavailable: B0FGXL4BTS MOMENTPLUS ノートパソコン 16GBメモリ+512GB SSD Ryzen 5 / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 75 OR (url ILIKE '%B0FGXL4BTS%' OR af_url ILIKE '%B0FGXL4BTS%'));
-- Unavailable: B0DR7TD6LS Zwide SA11 タブレットPC / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 21 OR (url ILIKE '%B0DR7TD6LS%' OR af_url ILIKE '%B0DR7TD6LS%'));
-- Unavailable: B0DSF645HN SA11 / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 27 OR (url ILIKE '%B0DSF645HN%' OR af_url ILIKE '%B0DSF645HN%'));
UPDATE am_pc_data SET price = 22739, real_price = 22739, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 104 OR (url ILIKE '%B0D8VKG9J2%' OR af_url ILIKE '%B0D8VKG9J2%'));
UPDATE am_pc_data SET price = 57999, real_price = 57999, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 64 OR (url ILIKE '%B0GHCZ846M%' OR af_url ILIKE '%B0GHCZ846M%'));
UPDATE am_pc_data SET price = 45980, real_price = 45980, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 96 OR (url ILIKE '%B0D7V5ZKWG%' OR af_url ILIKE '%B0D7V5ZKWG%'));
-- Unavailable: B0D5MHGNMF ミニノートパソコン N100 / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 8 OR (url ILIKE '%B0D5MHGNMF%' OR af_url ILIKE '%B0D5MHGNMF%'));
-- Unavailable: B0DMF42YMV null / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 35 OR (url ILIKE '%B0DMF42YMV%' OR af_url ILIKE '%B0DMF42YMV%'));
UPDATE am_pc_data SET price = 65999, real_price = 65999, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 32 OR (url ILIKE '%B0FCLP7JX2%' OR af_url ILIKE '%B0FCLP7JX2%'));
UPDATE am_pc_data SET price = 20800, real_price = 20800, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 95 OR (url ILIKE '%B0GF5Z23XS%' OR af_url ILIKE '%B0GF5Z23XS%'));
-- Unavailable: B0D637Q4KJ Ezpad N95 / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 14 OR (url ILIKE '%B0D637Q4KJ%' OR af_url ILIKE '%B0D637Q4KJ%'));
UPDATE am_pc_data SET price = 19620, real_price = 19620, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 97 OR (url ILIKE '%B0G3WJXJ7B%' OR af_url ILIKE '%B0G3WJXJ7B%'));
UPDATE am_pc_data SET price = 19800, real_price = 19800, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 98 OR (url ILIKE '%B0GZPTS1HQ%' OR af_url ILIKE '%B0GZPTS1HQ%'));
UPDATE am_pc_data SET price = 49999, real_price = 49999, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 60 OR (url ILIKE '%B0F8BRNMJF%' OR af_url ILIKE '%B0F8BRNMJF%'));
UPDATE am_pc_data SET price = 69999, real_price = 69999, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 10 OR (url ILIKE '%B0CT3GYLDS%' OR af_url ILIKE '%B0CT3GYLDS%'));
UPDATE am_pc_data SET price = 29999, real_price = 29999, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 11 OR (url ILIKE '%B0DLK5W3CK%' OR af_url ILIKE '%B0DLK5W3CK%'));
-- Unavailable: B0C4H7PN83 Smartbook DQ141S / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 31 OR (url ILIKE '%B0C4H7PN83%' OR af_url ILIKE '%B0C4H7PN83%'));
UPDATE am_pc_data SET price = 25547, real_price = 25547, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 26 OR (url ILIKE '%B089CT87RR%' OR af_url ILIKE '%B089CT87RR%'));
UPDATE am_pc_data SET price = 42999, real_price = 42999, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 69 OR (url ILIKE '%B0GZKJMMDR%' OR af_url ILIKE '%B0GZKJMMDR%'));
-- Unavailable: B0CQTJW3TZ N-10 / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 29 OR (url ILIKE '%B0CQTJW3TZ%' OR af_url ILIKE '%B0CQTJW3TZ%'));
UPDATE am_pc_data SET price = 18519, real_price = 18519, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 102 OR (url ILIKE '%B0GHVRDMS9%' OR af_url ILIKE '%B0GHVRDMS9%'));
-- Unavailable: B0F9FFHCCJ N-10 / status=NOT_RETURNED
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'NOT_RETURNED' WHERE (id = 28 OR (url ILIKE '%B0F9FFHCCJ%' OR af_url ILIKE '%B0F9FFHCCJ%'));
UPDATE am_pc_data SET price = 33800, real_price = 33800, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 101 OR (url ILIKE '%B0GSJGWXGP%' OR af_url ILIKE '%B0GSJGWXGP%'));
UPDATE am_pc_data SET price = 21569, real_price = 21569, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 103 OR (url ILIKE '%B0DRP4ZB65%' OR af_url ILIKE '%B0DRP4ZB65%'));
UPDATE am_pc_data SET price = 47990, real_price = 47990, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 65 OR (url ILIKE '%B0DS65NZ2R%' OR af_url ILIKE '%B0DS65NZ2R%'));
UPDATE am_pc_data SET price = 45000, real_price = 45000, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 59 OR (url ILIKE '%B0H2YLBCPK%' OR af_url ILIKE '%B0H2YLBCPK%'));
UPDATE am_pc_data SET price = 42999, real_price = 42999, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 66 OR (url ILIKE '%B0H11LDFRX%' OR af_url ILIKE '%B0H11LDFRX%'));
UPDATE am_pc_data SET price = 31800, real_price = 31800, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 85 OR (url ILIKE '%B0DNQ6XJG3%' OR af_url ILIKE '%B0DNQ6XJG3%'));
UPDATE am_pc_data SET price = 13800, real_price = 13800, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 87 OR (url ILIKE '%B0G1CY73WJ%' OR af_url ILIKE '%B0G1CY73WJ%'));
UPDATE am_pc_data SET price = 22900, real_price = 22900, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 99 OR (url ILIKE '%B0DK2315FZ%' OR af_url ILIKE '%B0DK2315FZ%'));
UPDATE am_pc_data SET price = 15800, real_price = 15800, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 88 OR (url ILIKE '%B0BFFLR8XF%' OR af_url ILIKE '%B0BFFLR8XF%'));
UPDATE am_pc_data SET price = 11875, real_price = 11875, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 86 OR (url ILIKE '%B0FDKQWN8P%' OR af_url ILIKE '%B0FDKQWN8P%'));
UPDATE am_pc_data SET price = 79990, real_price = 79990, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 122 OR (url ILIKE '%B0GXZW56L3%' OR af_url ILIKE '%B0GXZW56L3%'));
UPDATE am_pc_data SET price = 11799, real_price = 11799, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 90 OR (url ILIKE '%B0CS2T1PFM%' OR af_url ILIKE '%B0CS2T1PFM%'));
UPDATE am_pc_data SET price = 27360, real_price = 27360, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 91 OR (url ILIKE '%B0GF68BD76%' OR af_url ILIKE '%B0GF68BD76%'));
UPDATE am_pc_data SET price = 219800, real_price = 219800, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 193 OR (url ILIKE '%B0F4Q12C35%' OR af_url ILIKE '%B0F4Q12C35%'));
UPDATE am_pc_data SET price = 278522, real_price = 278522, fetched_at = '2026-06-30', is_active = true, availability = 'LEADTIME' WHERE (id = 194 OR (url ILIKE '%B0F4PYHKXX%' OR af_url ILIKE '%B0F4PYHKXX%'));
UPDATE am_pc_data SET price = 149800, real_price = 149800, fetched_at = '2026-06-30', is_active = true, availability = 'LEADTIME' WHERE (id = 195 OR (url ILIKE '%B0CX58FRQH%' OR af_url ILIKE '%B0CX58FRQH%'));
UPDATE am_pc_data SET price = 209800, real_price = 209800, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 196 OR (url ILIKE '%B0F4R9YLNJ%' OR af_url ILIKE '%B0F4R9YLNJ%'));
UPDATE am_pc_data SET price = 41841, real_price = 41841, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 105 OR (url ILIKE '%B0DS2LZMXX%' OR af_url ILIKE '%B0DS2LZMXX%'));
UPDATE am_pc_data SET price = 41099, real_price = 41099, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 106 OR (url ILIKE '%B0GGBF6YMK%' OR af_url ILIKE '%B0GGBF6YMK%'));
UPDATE am_pc_data SET price = 53238, real_price = 53238, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 107 OR (url ILIKE '%B0GS1MK74D%' OR af_url ILIKE '%B0GS1MK74D%'));
-- Unavailable: B0GHRGTXNH Getorli ミニPC AMD Ryzen 5300U搭載 -16GB RAM 512GB SSD デュアル2.5G LAN＆WiFi6対応 小型パソコン、3画面出力可能 コンパクトpc オフィス/ / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 108 OR (url ILIKE '%B0GHRGTXNH%' OR af_url ILIKE '%B0GHRGTXNH%'));
UPDATE am_pc_data SET price = 45900, real_price = 45900, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 109 OR (url ILIKE '%B0GS9DDK59%' OR af_url ILIKE '%B0GS9DDK59%'));
UPDATE am_pc_data SET price = 56900, real_price = 56900, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 110 OR (url ILIKE '%B0C8CL18H3%' OR af_url ILIKE '%B0C8CL18H3%'));
UPDATE am_pc_data SET price = 77000, real_price = 77000, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 111 OR (url ILIKE '%B0GP5LB6GD%' OR af_url ILIKE '%B0GP5LB6GD%'));
UPDATE am_pc_data SET price = 47900, real_price = 47900, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 112 OR (url ILIKE '%B0BWM1JWSY%' OR af_url ILIKE '%B0BWM1JWSY%'));
UPDATE am_pc_data SET price = 40998, real_price = 40998, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 113 OR (url ILIKE '%B0FNCYLXLM%' OR af_url ILIKE '%B0FNCYLXLM%'));
-- Unavailable: B0DR8RS2PZ Beelink EQ14 ミニPC、Intel Twin Lake N150 ミニゲーミング PC、16GB DDR4 1TB SSD ミニコンピューター (4C/4T、最大 3.6 GHz) WiF / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 114 OR (url ILIKE '%B0DR8RS2PZ%' OR af_url ILIKE '%B0DR8RS2PZ%'));
-- Unavailable: B0GX32FT36 ＴＩＴＡＮ　ＡＲＭＹ リンクスインターナショナル LNDS150 ミニPC Intel N150 メモリ16GB ストレージ256GB Window 10 IoT ファンレス小型デスクトップパソコン  / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 115 OR (url ILIKE '%B0GX32FT36%' OR af_url ILIKE '%B0GX32FT36%'));
UPDATE am_pc_data SET price = 37880, real_price = 37880, fetched_at = '2026-06-30', is_active = true, availability = 'LEADTIME' WHERE (id = 116 OR (url ILIKE '%B0FWR17RYK%' OR af_url ILIKE '%B0FWR17RYK%'));
UPDATE am_pc_data SET price = 55998, real_price = 55998, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 117 OR (url ILIKE '%B0F5459XJD%' OR af_url ILIKE '%B0F5459XJD%'));
UPDATE am_pc_data SET price = 120688, real_price = 120688, fetched_at = '2026-06-30', is_active = true, availability = 'LEADTIME' WHERE (id = 118 OR (url ILIKE '%B0CCDL6VS3%' OR af_url ILIKE '%B0CCDL6VS3%'));
UPDATE am_pc_data SET price = 39998, real_price = 39998, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 119 OR (url ILIKE '%B0FBV7HF1G%' OR af_url ILIKE '%B0FBV7HF1G%'));
-- Unavailable: B0GJSR4LRB GMKtec ミニ PC Ryzen 5 3500U搭載 N150/N97 より速い GMKtec G10 mini pc最大3.7GHz Win11 pro ミニPC 2.5G 有線LANポート4K / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 120 OR (url ILIKE '%B0GJSR4LRB%' OR af_url ILIKE '%B0GJSR4LRB%'));
-- Unavailable: B0GQLSMZZ1 Getorli ミニpc Ryzen 5 3550H搭載 mini pc - 最大3.7GHz 4コア8スレッド WiFi6/Bluetooth5.3対応 3画面出力対応 デュアルHDMI Type- / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 121 OR (url ILIKE '%B0GQLSMZZ1%' OR af_url ILIKE '%B0GQLSMZZ1%'));
UPDATE am_pc_data SET price = 67448, real_price = 67448, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 123 OR (url ILIKE '%B0G52HH15X%' OR af_url ILIKE '%B0G52HH15X%'));
UPDATE am_pc_data SET price = 58999, real_price = 58999, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 124 OR (url ILIKE '%B0G3PLYN89%' OR af_url ILIKE '%B0G3PLYN89%'));
UPDATE am_pc_data SET price = 79998, real_price = 79998, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 125 OR (url ILIKE '%B0FRB19ZZ1%' OR af_url ILIKE '%B0FRB19ZZ1%'));
UPDATE am_pc_data SET price = 81900, real_price = 81900, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 126 OR (url ILIKE '%B0FD3G3CV9%' OR af_url ILIKE '%B0FD3G3CV9%'));
-- Unavailable: B0FG7YKBSC YCTipc ZHR ミニ PC AMD Ryzen 7 7735HS 8C/16T 4.75GHz｜16GB DDR5 512GB SSD 高性能ミニパソコン｜デュアル 2.5G有線LAN搭載WiF / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 127 OR (url ILIKE '%B0FG7YKBSC%' OR af_url ILIKE '%B0FG7YKBSC%'));
UPDATE am_pc_data SET price = 78749, real_price = 78749, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 128 OR (url ILIKE '%B0GGDYVQQS%' OR af_url ILIKE '%B0GGDYVQQS%'));
UPDATE am_pc_data SET price = 65999, real_price = 65999, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 129 OR (url ILIKE '%B0GWC8P4L1%' OR af_url ILIKE '%B0GWC8P4L1%'));
UPDATE am_pc_data SET price = 98998, real_price = 98998, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 130 OR (url ILIKE '%B0GQBG3573%' OR af_url ILIKE '%B0GQBG3573%'));
UPDATE am_pc_data SET price = 89998, real_price = 89998, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 131 OR (url ILIKE '%B0GQGX47K1%' OR af_url ILIKE '%B0GQGX47K1%'));
-- Unavailable: B0H23V52NQ Getorli ミニPC AMD Ryzen™ 7 PRO 8845HS 搭載 32GB DDR5 1TB SSD 高速 小型PC Radeon 780M 4画面出力 Wi-Fi6 業務用/クリエイテ / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 132 OR (url ILIKE '%B0H23V52NQ%' OR af_url ILIKE '%B0H23V52NQ%'));
-- Unavailable: B0DRNX5971 ACEMAGIC ミニPC Ryzen 7 7730U 8C/16T 最大4.5GHz mini pc Windows11 Pro Type-C/HDMI2.0/DP1.4 4K 3画面 ミニパソコン / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 133 OR (url ILIKE '%B0DRNX5971%' OR af_url ILIKE '%B0DRNX5971%'));
UPDATE am_pc_data SET price = 42800, real_price = 42800, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 134 OR (url ILIKE '%B0C2PYPLCR%' OR af_url ILIKE '%B0C2PYPLCR%'));
UPDATE am_pc_data SET price = 187000, real_price = 187000, fetched_at = '2026-06-30', is_active = true, availability = 'LEADTIME' WHERE (id = 135 OR (url ILIKE '%B0GRJGH6LH%' OR af_url ILIKE '%B0GRJGH6LH%'));
-- Unavailable: B0GZVT8ZB2 VETESA デスクトップパソコン 27インチ 一体型パソコン 高性能Core i7 IPS 液晶・多機能一体型PC 16GB 512GB SSD 初期設定済み Office 2024付き Windo / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 136 OR (url ILIKE '%B0GZVT8ZB2%' OR af_url ILIKE '%B0GZVT8ZB2%'));
UPDATE am_pc_data SET price = 79800, real_price = 79800, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 137 OR (url ILIKE '%B0GH7F9QXB%' OR af_url ILIKE '%B0GH7F9QXB%'));
UPDATE am_pc_data SET price = 41800, real_price = 41800, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 138 OR (url ILIKE '%B0G18PFV8V%' OR af_url ILIKE '%B0G18PFV8V%'));
UPDATE am_pc_data SET price = 43980, real_price = 43980, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 139 OR (url ILIKE '%B0H3V947MT%' OR af_url ILIKE '%B0H3V947MT%'));
UPDATE am_pc_data SET price = 200000, real_price = 200000, fetched_at = '2026-06-30', is_active = true, availability = 'LEADTIME' WHERE (id = 140 OR (url ILIKE '%B0H1CC5K7L%' OR af_url ILIKE '%B0H1CC5K7L%'));
UPDATE am_pc_data SET price = 59800, real_price = 59800, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 141 OR (url ILIKE '%B0GM67P8SQ%' OR af_url ILIKE '%B0GM67P8SQ%'));
UPDATE am_pc_data SET price = 190980, real_price = 190980, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 142 OR (url ILIKE '%B0F4JWJ4LG%' OR af_url ILIKE '%B0F4JWJ4LG%'));
UPDATE am_pc_data SET price = 299800, real_price = 299800, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 143 OR (url ILIKE '%B0GMPNDLCG%' OR af_url ILIKE '%B0GMPNDLCG%'));
UPDATE am_pc_data SET price = 159000, real_price = 159000, fetched_at = '2026-06-30', is_active = true, availability = 'LEADTIME' WHERE (id = 144 OR (url ILIKE '%B0H1CJJNCF%' OR af_url ILIKE '%B0H1CJJNCF%'));
UPDATE am_pc_data SET price = 105400, real_price = 105400, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 145 OR (url ILIKE '%B0C1TVL66T%' OR af_url ILIKE '%B0C1TVL66T%'));
UPDATE am_pc_data SET price = 99800, real_price = 99800, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 146 OR (url ILIKE '%B0F28KWT5P%' OR af_url ILIKE '%B0F28KWT5P%'));
UPDATE am_pc_data SET price = 129800, real_price = 129800, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 147 OR (url ILIKE '%B0F28LRMPW%' OR af_url ILIKE '%B0F28LRMPW%'));
UPDATE am_pc_data SET price = 99800, real_price = 99800, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 148 OR (url ILIKE '%B0GM62V8K8%' OR af_url ILIKE '%B0GM62V8K8%'));
UPDATE am_pc_data SET price = 149800, real_price = 149800, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 149 OR (url ILIKE '%B0F28LNNF5%' OR af_url ILIKE '%B0F28LNNF5%'));
UPDATE am_pc_data SET price = 129800, real_price = 129800, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 150 OR (url ILIKE '%B0D5MFBVSY%' OR af_url ILIKE '%B0D5MFBVSY%'));
UPDATE am_pc_data SET price = 144269, real_price = 144269, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 151 OR (url ILIKE '%B0F4PYB64C%' OR af_url ILIKE '%B0F4PYB64C%'));
UPDATE am_pc_data SET price = 92800, real_price = 92800, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 152 OR (url ILIKE '%B0GM677W3F%' OR af_url ILIKE '%B0GM677W3F%'));
UPDATE am_pc_data SET price = 150980, real_price = 150980, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 153 OR (url ILIKE '%B0F4JVSMJT%' OR af_url ILIKE '%B0F4JVSMJT%'));
UPDATE am_pc_data SET price = 139980, real_price = 139980, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 154 OR (url ILIKE '%B0GX8D2HKS%' OR af_url ILIKE '%B0GX8D2HKS%'));
UPDATE am_pc_data SET price = 139800, real_price = 139800, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 155 OR (url ILIKE '%B0F32KDCZD%' OR af_url ILIKE '%B0F32KDCZD%'));
UPDATE am_pc_data SET price = 95800, real_price = 95800, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 156 OR (url ILIKE '%B09RPTMPZ3%' OR af_url ILIKE '%B09RPTMPZ3%'));
UPDATE am_pc_data SET price = 89980, real_price = 89980, fetched_at = '2026-06-30', is_active = true, availability = 'LEADTIME' WHERE (id = 157 OR (url ILIKE '%B0GTZ8S27N%' OR af_url ILIKE '%B0GTZ8S27N%'));
UPDATE am_pc_data SET price = 149800, real_price = 149800, fetched_at = '2026-06-30', is_active = true, availability = 'LEADTIME' WHERE (id = 158 OR (url ILIKE '%B0DZ5X9H8G%' OR af_url ILIKE '%B0DZ5X9H8G%'));
UPDATE am_pc_data SET price = 78800, real_price = 78800, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 159 OR (url ILIKE '%B0GM62L57Q%' OR af_url ILIKE '%B0GM62L57Q%'));
UPDATE am_pc_data SET price = 205000, real_price = 205000, fetched_at = '2026-06-30', is_active = true, availability = 'LEADTIME' WHERE (id = 160 OR (url ILIKE '%B0GVS1Y79B%' OR af_url ILIKE '%B0GVS1Y79B%'));
UPDATE am_pc_data SET price = 66350, real_price = 66350, fetched_at = '2026-06-30', is_active = true, availability = 'AVAILABLE_DATE' WHERE (id = 161 OR (url ILIKE '%B0CD24WV3H%' OR af_url ILIKE '%B0CD24WV3H%'));
UPDATE am_pc_data SET price = 74599, real_price = 74599, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 162 OR (url ILIKE '%B0CHJTN7GG%' OR af_url ILIKE '%B0CHJTN7GG%'));
UPDATE am_pc_data SET price = 111764, real_price = 111764, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 163 OR (url ILIKE '%B0H1GD7DGY%' OR af_url ILIKE '%B0H1GD7DGY%'));
UPDATE am_pc_data SET price = 73998, real_price = 73998, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 164 OR (url ILIKE '%B0DJQHPGZY%' OR af_url ILIKE '%B0DJQHPGZY%'));
-- Unavailable: B0GK6XXJNP MINISFORUM UM750L Slim MINI PC、AMD Ryzen 5 7545U、16GB LPDDR5、512GB SSD、Windows11Pro搭載ミニパソコン Radeon 7 / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 165 OR (url ILIKE '%B0GK6XXJNP%' OR af_url ILIKE '%B0GK6XXJNP%'));
-- Unavailable: B0GMNNZHKH MINISFORUM UM750L Slim ミニPC AMD Ryzen 5 7545U LPDDR5-6400 16GB 1TB SSD Windows 11 Pro Radeon 740M HD / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 166 OR (url ILIKE '%B0GMNNZHKH%' OR af_url ILIKE '%B0GMNNZHKH%'));
UPDATE am_pc_data SET price = 85799, real_price = 85799, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 167 OR (url ILIKE '%B0GK77R1R9%' OR af_url ILIKE '%B0GK77R1R9%'));
UPDATE am_pc_data SET price = 127999, real_price = 127999, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 168 OR (url ILIKE '%B0GJDHYKDS%' OR af_url ILIKE '%B0GJDHYKDS%'));
UPDATE am_pc_data SET price = 83999, real_price = 83999, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 169 OR (url ILIKE '%B0FX3HGTPD%' OR af_url ILIKE '%B0FX3HGTPD%'));
UPDATE am_pc_data SET price = 111199, real_price = 111199, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 170 OR (url ILIKE '%B0GYX2163M%' OR af_url ILIKE '%B0GYX2163M%'));
UPDATE am_pc_data SET price = 61248, real_price = 61248, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 171 OR (url ILIKE '%B0GVM77HWB%' OR af_url ILIKE '%B0GVM77HWB%'));
-- Unavailable: B0GK6DCRF2 GMKtec ミニPC AMD Ryzen 5 7640HS（最大5.0GHz）搭載｜DDR5 128GB+8TB拡張可 SSD拡張可 Win11 Pro｜ミニPC Ryzen 性能野獣級 mini / status=OUT_OF_STOCK
UPDATE am_pc_data SET fetched_at = '2026-06-30', availability = 'OUT_OF_STOCK' WHERE (id = 172 OR (url ILIKE '%B0GK6DCRF2%' OR af_url ILIKE '%B0GK6DCRF2%'));
UPDATE am_pc_data SET price = 94374, real_price = 94374, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 173 OR (url ILIKE '%B0GD6SBH7B%' OR af_url ILIKE '%B0GD6SBH7B%'));
UPDATE am_pc_data SET price = 57399, real_price = 57399, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 174 OR (url ILIKE '%B0GQGVS6BX%' OR af_url ILIKE '%B0GQGVS6BX%'));
UPDATE am_pc_data SET price = 82999, real_price = 82999, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 175 OR (url ILIKE '%B0GD6ZS99W%' OR af_url ILIKE '%B0GD6ZS99W%'));
UPDATE am_pc_data SET price = 72799, real_price = 72799, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 176 OR (url ILIKE '%B0FY51JZYV%' OR af_url ILIKE '%B0FY51JZYV%'));
UPDATE am_pc_data SET price = 134800, real_price = 134800, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 177 OR (url ILIKE '%B0FNWQDLGG%' OR af_url ILIKE '%B0FNWQDLGG%'));
UPDATE am_pc_data SET price = 89800, real_price = 89800, fetched_at = '2026-06-30', is_active = true, availability = 'LEADTIME' WHERE (id = 178 OR (url ILIKE '%B0CGZCJPWP%' OR af_url ILIKE '%B0CGZCJPWP%'));
UPDATE am_pc_data SET price = 172000, real_price = 172000, fetched_at = '2026-06-30', is_active = true, availability = 'LEADTIME' WHERE (id = 179 OR (url ILIKE '%B0GRJHKKFQ%' OR af_url ILIKE '%B0GRJHKKFQ%'));
UPDATE am_pc_data SET price = 122800, real_price = 122800, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 180 OR (url ILIKE '%B0GH7L59QZ%' OR af_url ILIKE '%B0GH7L59QZ%'));
UPDATE am_pc_data SET price = 120000, real_price = 120000, fetched_at = '2026-06-30', is_active = true, availability = 'LEADTIME' WHERE (id = 181 OR (url ILIKE '%B0GRJTNZRR%' OR af_url ILIKE '%B0GRJTNZRR%'));
UPDATE am_pc_data SET price = 185800, real_price = 185800, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK' WHERE (id = 182 OR (url ILIKE '%B0G3L9Y88J%' OR af_url ILIKE '%B0G3L9Y88J%'));
UPDATE am_pc_data SET price = 241000, real_price = 241000, fetched_at = '2026-06-30', is_active = true, availability = 'LEADTIME' WHERE (id = 183 OR (url ILIKE '%B0GT5X5YNH%' OR af_url ILIKE '%B0GT5X5YNH%'));
UPDATE am_pc_data SET price = 319000, real_price = 319000, fetched_at = '2026-06-30', is_active = true, availability = 'LEADTIME' WHERE (id = 184 OR (url ILIKE '%B0GT5WPFW2%' OR af_url ILIKE '%B0GT5WPFW2%'));
UPDATE am_pc_data SET price = 184800, real_price = 184800, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 185 OR (url ILIKE '%B0GMPZ2T8H%' OR af_url ILIKE '%B0GMPZ2T8H%'));
UPDATE am_pc_data SET price = 291180, real_price = 291180, fetched_at = '2026-06-30', is_active = true, availability = 'LEADTIME' WHERE (id = 186 OR (url ILIKE '%B00KG9KA5A%' OR af_url ILIKE '%B00KG9KA5A%'));
UPDATE am_pc_data SET price = 698000, real_price = 698000, fetched_at = '2026-06-30', is_active = true, availability = 'IN_STOCK_SCARCE' WHERE (id = 187 OR (url ILIKE '%B0FDKL4F2Y%' OR af_url ILIKE '%B0FDKL4F2Y%'));
UPDATE am_pc_data SET price = 498800, real_price = 498800, fetched_at = '2026-06-30', is_active = true, availability = 'LEADTIME' WHERE (id = 188 OR (url ILIKE '%B0F2HD9TN1%' OR af_url ILIKE '%B0F2HD9TN1%'));
UPDATE am_pc_data SET price = 159500, real_price = 159500, fetched_at = '2026-06-30', is_active = true, availability = 'LEADTIME' WHERE (id = 189 OR (url ILIKE '%B0DMRQBF6C%' OR af_url ILIKE '%B0DMRQBF6C%'));
UPDATE am_pc_data SET price = 99800, real_price = 99800, fetched_at = '2026-06-30', is_active = true, availability = 'LEADTIME' WHERE (id = 190 OR (url ILIKE '%B0CXHYN4QN%' OR af_url ILIKE '%B0CXHYN4QN%'));
UPDATE am_pc_data SET price = 152800, real_price = 152800, fetched_at = '2026-06-30', is_active = true, availability = 'LEADTIME' WHERE (id = 191 OR (url ILIKE '%B0CXHYWP54%' OR af_url ILIKE '%B0CXHYWP54%'));
UPDATE am_pc_data SET price = 134800, real_price = 134800, fetched_at = '2026-06-30', is_active = true, availability = 'LEADTIME' WHERE (id = 192 OR (url ILIKE '%B0F1MFZTQS%' OR af_url ILIKE '%B0F1MFZTQS%'));
UPDATE am_monitor_data SET price = 11480, real_price = 11480, fetched_at = '2026-06-30', is_active = true WHERE (id = 23 OR (url ILIKE '%B0G1RPLM7T%' OR af_url ILIKE '%B0G1RPLM7T%'));
UPDATE am_monitor_data SET price = 11990, real_price = 11990, fetched_at = '2026-06-30', is_active = true WHERE (id = 3 OR (url ILIKE '%B0DL5X394K%' OR af_url ILIKE '%B0DL5X394K%'));
UPDATE am_monitor_data SET price = 12580, real_price = 12580, fetched_at = '2026-06-30', is_active = true WHERE (id = 1 OR (url ILIKE '%B0DNDXMLR7%' OR af_url ILIKE '%B0DNDXMLR7%'));
UPDATE am_monitor_data SET price = 9980, real_price = 9980, fetched_at = '2026-06-30', is_active = true WHERE (id = 19 OR (url ILIKE '%B0GCC92XD8%' OR af_url ILIKE '%B0GCC92XD8%'));
UPDATE am_monitor_data SET price = 12880, real_price = 12880, fetched_at = '2026-06-30', is_active = true WHERE (id = 20 OR (url ILIKE '%B0BX5WFS8N%' OR af_url ILIKE '%B0BX5WFS8N%'));
UPDATE am_monitor_data SET price = 13532, real_price = 13532, fetched_at = '2026-06-30', is_active = true WHERE (id = 5 OR (url ILIKE '%B0DWZQHF8G%' OR af_url ILIKE '%B0DWZQHF8G%'));
UPDATE am_monitor_data SET price = 17980, real_price = 17980, fetched_at = '2026-06-30', is_active = true WHERE (id = 4 OR (url ILIKE '%B0G6JV85HG%' OR af_url ILIKE '%B0G6JV85HG%'));
UPDATE am_monitor_data SET price = 14800, real_price = 14800, fetched_at = '2026-06-30', is_active = true WHERE (id = 21 OR (url ILIKE '%B0CPXQQLL2%' OR af_url ILIKE '%B0CPXQQLL2%'));
UPDATE am_monitor_data SET price = 11980, real_price = 11980, fetched_at = '2026-06-30', is_active = true WHERE (id = 2 OR (url ILIKE '%B0G6JMQK17%' OR af_url ILIKE '%B0G6JMQK17%'));
UPDATE am_monitor_data SET price = 15167, real_price = 15167, fetched_at = '2026-06-30', is_active = true WHERE (id = 13 OR (url ILIKE '%B0FQ972ZVT%' OR af_url ILIKE '%B0FQ972ZVT%'));
UPDATE am_monitor_data SET price = 16980, real_price = 16980, fetched_at = '2026-06-30', is_active = true WHERE (id = 22 OR (url ILIKE '%B0DR7XQMQD%' OR af_url ILIKE '%B0DR7XQMQD%'));
UPDATE am_monitor_data SET price = 17980, real_price = 17980, fetched_at = '2026-06-30', is_active = true WHERE (id = 25 OR (url ILIKE '%B0DG4RKZMD%' OR af_url ILIKE '%B0DG4RKZMD%'));
UPDATE am_monitor_data SET price = 19980, real_price = 19980, fetched_at = '2026-06-30', is_active = true WHERE (id = 8 OR (url ILIKE '%B0GR4RLMKR%' OR af_url ILIKE '%B0GR4RLMKR%'));
UPDATE am_monitor_data SET price = 16980, real_price = 16980, fetched_at = '2026-06-30', is_active = true WHERE (id = 11 OR (url ILIKE '%B0F99BZ76P%' OR af_url ILIKE '%B0F99BZ76P%'));
UPDATE am_monitor_data SET price = 17800, real_price = 17800, fetched_at = '2026-06-30', is_active = true WHERE (id = 9 OR (url ILIKE '%B0DJNJN6PK%' OR af_url ILIKE '%B0DJNJN6PK%'));
UPDATE am_monitor_data SET price = 20980, real_price = 20980, fetched_at = '2026-06-30', is_active = true WHERE (id = 6 OR (url ILIKE '%B0FPDZWJ7K%' OR af_url ILIKE '%B0FPDZWJ7K%'));
UPDATE am_monitor_data SET price = 27980, real_price = 27980, fetched_at = '2026-06-30', is_active = true WHERE (id = 36 OR (url ILIKE '%B0DSPF55V1%' OR af_url ILIKE '%B0DSPF55V1%'));
-- Unavailable: B0DCNKQBN3 【Amazon.co.jp 限定】PHILIPS EVNIA ゲーミングモニター (23.8インチ/180Hz/フルHD/Fast IPS/超高速0.5ms/HDR10/G-Sync Compatib / status=OUT_OF_STOCK
UPDATE am_monitor_data SET fetched_at = '2026-06-30' WHERE (id = 7 OR (url ILIKE '%B0DCNKQBN3%' OR af_url ILIKE '%B0DCNKQBN3%'));
UPDATE am_monitor_data SET price = 18980, real_price = 18980, fetched_at = '2026-06-30', is_active = true WHERE (id = 14 OR (url ILIKE '%B0DT44Q57R%' OR af_url ILIKE '%B0DT44Q57R%'));
UPDATE am_monitor_data SET price = 16105, real_price = 16105, fetched_at = '2026-06-30', is_active = true WHERE (id = 34 OR (url ILIKE '%B0FC2FYM6R%' OR af_url ILIKE '%B0FC2FYM6R%'));
UPDATE am_monitor_data SET price = 19980, real_price = 19980, fetched_at = '2026-06-30', is_active = true WHERE (id = 32 OR (url ILIKE '%B0DSFWSGTM%' OR af_url ILIKE '%B0DSFWSGTM%'));
UPDATE am_monitor_data SET price = 23800, real_price = 23800, fetched_at = '2026-06-30', is_active = true WHERE (id = 16 OR (url ILIKE '%B0DCNN7G7V%' OR af_url ILIKE '%B0DCNN7G7V%'));
UPDATE am_monitor_data SET price = 25800, real_price = 25800, fetched_at = '2026-06-30', is_active = true WHERE (id = 15 OR (url ILIKE '%B0F1QY415D%' OR af_url ILIKE '%B0F1QY415D%'));
UPDATE am_monitor_data SET price = 23980, real_price = 23980, fetched_at = '2026-06-30', is_active = true WHERE (id = 10 OR (url ILIKE '%B0DR7RNVQ3%' OR af_url ILIKE '%B0DR7RNVQ3%'));
UPDATE am_monitor_data SET price = 24980, real_price = 24980, fetched_at = '2026-06-30', is_active = true WHERE (id = 29 OR (url ILIKE '%B0D9KGG1B6%' OR af_url ILIKE '%B0D9KGG1B6%'));
UPDATE am_monitor_data SET price = 18980, real_price = 18980, fetched_at = '2026-06-30', is_active = true WHERE (id = 18 OR (url ILIKE '%B0GR4S5RTW%' OR af_url ILIKE '%B0GR4S5RTW%'));
UPDATE am_monitor_data SET price = 25600, real_price = 25600, fetched_at = '2026-06-30', is_active = true WHERE (id = 24 OR (url ILIKE '%B0DXDW1CJG%' OR af_url ILIKE '%B0DXDW1CJG%'));
UPDATE am_monitor_data SET price = 28800, real_price = 28800, fetched_at = '2026-06-30', is_active = true WHERE (id = 27 OR (url ILIKE '%B0F9WHRY36%' OR af_url ILIKE '%B0F9WHRY36%'));
UPDATE am_monitor_data SET price = 26980, real_price = 26980, fetched_at = '2026-06-30', is_active = true WHERE (id = 12 OR (url ILIKE '%B00CWXR15K%' OR af_url ILIKE '%B00CWXR15K%'));
UPDATE am_monitor_data SET price = 27627, real_price = 27627, fetched_at = '2026-06-30', is_active = true WHERE (id = 42 OR (url ILIKE '%B0CQ2H7H85%' OR af_url ILIKE '%B0CQ2H7H85%'));
UPDATE am_monitor_data SET price = 28800, real_price = 28800, fetched_at = '2026-06-30', is_active = true WHERE (id = 28 OR (url ILIKE '%B0CJ56JD6R%' OR af_url ILIKE '%B0CJ56JD6R%'));
UPDATE am_monitor_data SET price = 36980, real_price = 36980, fetched_at = '2026-06-30', is_active = true WHERE (id = 35 OR (url ILIKE '%B0GGZ49QMY%' OR af_url ILIKE '%B0GGZ49QMY%'));
UPDATE am_monitor_data SET price = 32800, real_price = 32800, fetched_at = '2026-06-30', is_active = true WHERE (id = 17 OR (url ILIKE '%B0FPF1HGT8%' OR af_url ILIKE '%B0FPF1HGT8%'));
UPDATE am_monitor_data SET price = 29980, real_price = 29980, fetched_at = '2026-06-30', is_active = true WHERE (id = 30 OR (url ILIKE '%B0FRS96GV9%' OR af_url ILIKE '%B0FRS96GV9%'));
UPDATE am_monitor_data SET price = 29980, real_price = 29980, fetched_at = '2026-06-30', is_active = true WHERE (id = 31 OR (url ILIKE '%B0CH7ZWQD5%' OR af_url ILIKE '%B0CH7ZWQD5%'));
UPDATE am_monitor_data SET price = 39800, real_price = 39800, fetched_at = '2026-06-30', is_active = true WHERE (id = 33 OR (url ILIKE '%B0F5VQVPL6%' OR af_url ILIKE '%B0F5VQVPL6%'));
UPDATE am_monitor_data SET price = 32480, real_price = 32480, fetched_at = '2026-06-30', is_active = true WHERE (id = 41 OR (url ILIKE '%B0D9VFJ95B%' OR af_url ILIKE '%B0D9VFJ95B%'));
UPDATE am_monitor_data SET price = 34999, real_price = 34999, fetched_at = '2026-06-30', is_active = true WHERE (id = 38 OR (url ILIKE '%B0FG74GMN6%' OR af_url ILIKE '%B0FG74GMN6%'));
UPDATE am_monitor_data SET price = 38900, real_price = 38900, fetched_at = '2026-06-30', is_active = true WHERE (id = 44 OR (url ILIKE '%B0F6CVB672%' OR af_url ILIKE '%B0F6CVB672%'));
UPDATE am_monitor_data SET price = 36100, real_price = 36100, fetched_at = '2026-06-30', is_active = true WHERE (id = 26 OR (url ILIKE '%B0DMN94Q8M%' OR af_url ILIKE '%B0DMN94Q8M%'));
UPDATE am_monitor_data SET price = 39800, real_price = 39800, fetched_at = '2026-06-30', is_active = true WHERE (id = 37 OR (url ILIKE '%B0GL7QQD2W%' OR af_url ILIKE '%B0GL7QQD2W%'));
UPDATE am_monitor_data SET price = 41918, real_price = 41918, fetched_at = '2026-06-30', is_active = true WHERE (id = 43 OR (url ILIKE '%B0GVDBN7K8%' OR af_url ILIKE '%B0GVDBN7K8%'));
UPDATE am_monitor_data SET price = 44045, real_price = 44045, fetched_at = '2026-06-30', is_active = true WHERE (id = 39 OR (url ILIKE '%B0GR4NR53Y%' OR af_url ILIKE '%B0GR4NR53Y%'));
UPDATE am_monitor_data SET price = 43700, real_price = 43700, fetched_at = '2026-06-30', is_active = true WHERE (id = 40 OR (url ILIKE '%B0F23FWBJL%' OR af_url ILIKE '%B0F23FWBJL%'));
UPDATE am_tablet_data SET price = 17999, real_price = 17999, fetched_at = '2026-06-30', is_active = true WHERE (id = 20 OR (url ILIKE '%B0GJ3S68KD%' OR af_url ILIKE '%B0GJ3S68KD%'));
-- Unavailable: B0F9NM1GZJ BekoQurd M11 タブレット 11インチ Android、12GB RAM 128GB ROM、Helio G99 プロセッサ、90Hz IPS液晶、8100mAhバッテリー、4スピーカー、W / status=OUT_OF_STOCK
UPDATE am_tablet_data SET fetched_at = '2026-06-30' WHERE (id = 19 OR (url ILIKE '%B0F9NM1GZJ%' OR af_url ILIKE '%B0F9NM1GZJ%'));
UPDATE am_tablet_data SET price = 19657, real_price = 19657, fetched_at = '2026-06-30', is_active = true WHERE (id = 18 OR (url ILIKE '%B09FKYRD22%' OR af_url ILIKE '%B09FKYRD22%'));
UPDATE am_tablet_data SET price = 22999, real_price = 22999, fetched_at = '2026-06-30', is_active = true WHERE (id = 14 OR (url ILIKE '%B0D2K5YP66%' OR af_url ILIKE '%B0D2K5YP66%'));
UPDATE am_tablet_data SET price = 22999, real_price = 22999, fetched_at = '2026-06-30', is_active = true WHERE (id = 16 OR (url ILIKE '%B0D2K2F5PK%' OR af_url ILIKE '%B0D2K2F5PK%'));
UPDATE am_tablet_data SET price = 36999, real_price = 36999, fetched_at = '2026-06-30', is_active = true WHERE (id = 17 OR (url ILIKE '%B0G338K9WJ%' OR af_url ILIKE '%B0G338K9WJ%'));
UPDATE am_tablet_data SET price = 27980, real_price = 27980, fetched_at = '2026-06-30', is_active = true WHERE (id = 6 OR (url ILIKE '%B0F9P1B6R4%' OR af_url ILIKE '%B0F9P1B6R4%'));
UPDATE am_tablet_data SET price = 27980, real_price = 27980, fetched_at = '2026-06-30', is_active = true WHERE (id = 13 OR (url ILIKE '%B0F9P19S1B%' OR af_url ILIKE '%B0F9P19S1B%'));
UPDATE am_tablet_data SET price = 27980, real_price = 27980, fetched_at = '2026-06-30', is_active = true WHERE (id = 26 OR (url ILIKE '%B0F9P4719Q%' OR af_url ILIKE '%B0F9P4719Q%'));
UPDATE am_tablet_data SET price = 28999, real_price = 28999, fetched_at = '2026-06-30', is_active = true WHERE (id = 15 OR (url ILIKE '%B0F4JR2QDK%' OR af_url ILIKE '%B0F4JR2QDK%'));
UPDATE am_tablet_data SET price = 29999, real_price = 29999, fetched_at = '2026-06-30', is_active = true WHERE (id = 28 OR (url ILIKE '%B0GKFHK6XN%' OR af_url ILIKE '%B0GKFHK6XN%'));
UPDATE am_tablet_data SET price = 37800, real_price = 37800, fetched_at = '2026-06-30', is_active = true WHERE (id = 27 OR (url ILIKE '%B0CJF6SCVL%' OR af_url ILIKE '%B0CJF6SCVL%'));
UPDATE am_tablet_data SET price = 41293, real_price = 41293, fetched_at = '2026-06-30', is_active = true WHERE (id = 24 OR (url ILIKE '%B0DBKLCMY2%' OR af_url ILIKE '%B0DBKLCMY2%'));
UPDATE am_tablet_data SET price = 36850, real_price = 36850, fetched_at = '2026-06-30', is_active = true WHERE (id = 23 OR (url ILIKE '%B0CXDSJZZZ%' OR af_url ILIKE '%B0CXDSJZZZ%'));
UPDATE am_tablet_data SET price = 49956, real_price = 49956, fetched_at = '2026-06-30', is_active = true WHERE (id = 22 OR (url ILIKE '%B0D6YTCF7Z%' OR af_url ILIKE '%B0D6YTCF7Z%'));
UPDATE am_tablet_data SET price = 53054, real_price = 53054, fetched_at = '2026-06-30', is_active = true WHERE (id = 25 OR (url ILIKE '%B0FXBT9CYP%' OR af_url ILIKE '%B0FXBT9CYP%'));
UPDATE am_tablet_data SET price = 74800, real_price = 74800, fetched_at = '2026-06-30', is_active = true WHERE (id = 1 OR (url ILIKE '%B0DZ7WF87P%' OR af_url ILIKE '%B0DZ7WF87P%'));
-- Unavailable: B0DZ8J8TR2 Apple 11 インチ iPad (A16): 11 インチモデル、Liquid Retina ディスプレイ、128GB、Wi-Fi 6、12MP フロント/12MP バックカメラ、Touch ID / status=OUT_OF_STOCK
UPDATE am_tablet_data SET fetched_at = '2026-06-30' WHERE (id = 3 OR (url ILIKE '%B0DZ8J8TR2%' OR af_url ILIKE '%B0DZ8J8TR2%'));
UPDATE am_tablet_data SET price = 74800, real_price = 74800, fetched_at = '2026-06-30', is_active = true WHERE (id = 2 OR (url ILIKE '%B0DZ8HV6RT%' OR af_url ILIKE '%B0DZ8HV6RT%'));
UPDATE am_tablet_data SET price = 69331, real_price = 69331, fetched_at = '2026-06-30', is_active = true WHERE (id = 21 OR (url ILIKE '%B0D8VM6G33%' OR af_url ILIKE '%B0D8VM6G33%'));
UPDATE am_tablet_data SET price = 99800, real_price = 99800, fetched_at = '2026-06-30', is_active = true WHERE (id = 11 OR (url ILIKE '%B0DK43L4K3%' OR af_url ILIKE '%B0DK43L4K3%'));
UPDATE am_tablet_data SET price = 99800, real_price = 99800, fetched_at = '2026-06-30', is_active = true WHERE (id = 12 OR (url ILIKE '%B0DK44CJ9K%' OR af_url ILIKE '%B0DK44CJ9K%'));
UPDATE am_tablet_data SET price = 99800, real_price = 99800, fetched_at = '2026-06-30', is_active = true WHERE (id = 10 OR (url ILIKE '%B0DK467P86%' OR af_url ILIKE '%B0DK467P86%'));
UPDATE am_tablet_data SET price = 129800, real_price = 129800, fetched_at = '2026-06-30', is_active = true WHERE (id = 7 OR (url ILIKE '%B0GQWSBMQ1%' OR af_url ILIKE '%B0GQWSBMQ1%'));
UPDATE am_tablet_data SET price = 146800, real_price = 146800, fetched_at = '2026-06-30', is_active = true WHERE (id = 8 OR (url ILIKE '%B0GQW2J67Z%' OR af_url ILIKE '%B0GQW2J67Z%'));
UPDATE am_tablet_data SET price = 154800, real_price = 154800, fetched_at = '2026-06-30', is_active = true WHERE (id = 4 OR (url ILIKE '%B0GQW8NNNS%' OR af_url ILIKE '%B0GQW8NNNS%'));
UPDATE am_tablet_data SET price = 124801, real_price = 124801, fetched_at = '2026-06-30', is_active = true WHERE (id = 5 OR (url ILIKE '%B0DZ84FKKP%' OR af_url ILIKE '%B0DZ84FKKP%'));
UPDATE am_tablet_data SET price = 181800, real_price = 181800, fetched_at = '2026-06-30', is_active = true WHERE (id = 9 OR (url ILIKE '%B0GQWKSTGS%' OR af_url ILIKE '%B0GQWKSTGS%'));

COMMIT;

-- Summary: products=268, price_changed=87, unavailable=55, deactivate_unavailable=false