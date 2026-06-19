# Specsy Next Tasks

更新日: 2026-06-20

## まずやる

- [ ] Supabaseにカテゴリ商品SQLを投入する
  - 順番: `scripts/create-monitor-data-table.sql` -> `scripts/insert_monitor_products.sql` -> `scripts/insert_mini_pc_products.sql` -> `scripts/insert_desktop_pc_products.sql`
  - 理由: 現状のMini PC/デスクトップ/モニター導線はできているが、本番カテゴリAPIは商品未投入だと0件のまま。
  - 完了条件: `npm run production:check -- --expect-category-data` が成功する。

- [ ] 投入後にカテゴリページを目視確認する
  - 対象: `/monitor-list`, `/pc-list/mini-pc`, `/pc-list/desktop`
  - 見る点: 商品名、価格、Amazonリンク、画像、スコア、カテゴリ混入、スマホ表示。
  - 完了条件: 明らかなアクセサリ混入、ノートPC/ミニPCのカテゴリ混入、価格崩れがない。

- [ ] カテゴリ商品レビューCSVを軽く監査する
  - 対象: `scripts/review_monitor_products.csv`, `scripts/review_mini_pc_products.csv`, `scripts/review_desktop_pc_products.csv`
  - 見る点: 高すぎる/安すぎる価格、ASIN重複、スペック欠落、モニターのHz/解像度/パネル欠落。
  - 完了条件: `npm run category:ready:strict -- --skip-production` が成功し、目視で違和感がない。

## 次にやる

- [ ] モニター一覧を本番データ入りで調整する
  - 理由: スコアロジックは入っているが、実データを入れた後に初めて並び順の違和感が見える。
  - 見る点: 仕事用/ゲーム用/制作向け/USB-C重視で上位商品が用途に合っているか。
  - 完了条件: 各用途の上位3件に明らかな不自然さがない。

- [ ] Mini PC/デスクトップのカテゴリ判定を本番データで確認する
  - 理由: PA-API候補にはミニPCとデスクトップの相互混入が起きやすい。
  - 見る点: `form_factor`, 商品名、CPU/RAM/ROM、GPU推定、ノートPC混入。
  - 完了条件: `/pc-list/mini-pc` と `/pc-list/desktop` の上位に別カテゴリが混ざらない。

- [ ] PC一覧ヘッダーのスマホ表示を確認する
  - 理由: ヘッダー右側を商品カテゴリ導線に変えたため、長いラベルが横スクロール前提になる。
  - 見る点: `ノートPC（新品）` / `ノートPC（中古）` が潰れないか、横スクロールが自然か。
  - 完了条件: 375px幅でラベルが読め、本文と重ならない。

- [ ] カテゴリページからブログ記事への内部リンク方針を決める
  - 理由: 商品カテゴリページはできたが、SEO流入を増やすには記事側から自然に送る導線が必要。
  - 候補: モニター選び、Mini PCの用途、デスクトップとMini PCの違い、中古ノートPCの注意点。
  - 完了条件: まず3本だけ、既存ブログ/新規記事のどちらで扱うか決める。

## 後でやる

- [ ] カテゴリ商品更新の運用手順を決める
  - 案: 月1回PA-APIで再生成 -> review CSV確認 -> SQL投入 -> `production:check`。
  - 完了条件: 更新頻度、除外ASIN管理、投入前チェックの担当手順が決まる。

- [ ] 通常PCデータのCPU詳細化SQLをSupabaseへ反映する
  - 対象: `scripts/update-generic-cpu-models.sql`
  - 理由: `Core i5` や `Ryzen 5` のような汎用CPU名はスコア/比較精度を落とす。
  - 完了条件: 本番APIで汎用CPU名の残数が減っている。

- [ ] カテゴリ別のSEO記事を1本ずつ作る
  - 優先順: モニター -> Mini PC -> デスクトップ -> 中古ノートPC。
  - 注意: 複数記事を一気に量産せず、1本ずつPC-DBを見た調査記録として書く。
  - 完了条件: 記事本文から対応カテゴリページへ自然に送客できる。

- [ ] 収益導線を確認する
  - 見る点: Amazonリンクにアフィリエイトタグが入っているか、外部リンクマークが出るか、商品画像リンクが壊れていないか。
  - 完了条件: `npm run production:check` と目視で主要カテゴリのリンクが正常。

## やらない

- [ ] トップページの大改修
  - 理由: 過去にやりすぎたUI拡張を戻している。今はカテゴリ導線と商品投入を優先。

- [ ] PC一覧テーブル上部へのサマリー/ガイド大量追加
  - 理由: 一覧UIの主役感を崩しやすい。必要なら別途、依頼があった時だけ最小追加する。

- [ ] 商品SQLの手編集による候補調整
  - 理由: SQLとreview CSVのASIN一致が崩れる。除外は `--exclude-asin` / `--exclude-file` を使って再生成する。
