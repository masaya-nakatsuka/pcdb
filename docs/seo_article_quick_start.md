# SEO記事作成クイックスタート

PC-DBを使わない一般SEO記事（ゲーム×デバイス選び系）の作成手順。

## この記事フレームの対象

- **対象**: 「〇〇ゲーム × スマホ/PC/タブレット × おすすめ選び」形式
- **非対象**: PC-DB記事（article28-63の形式）は従来の `PcDbArticle` を使用

## ステップ1: ID確認

`src/lib/blogMetadata.ts` で次の記事ID番号を確認（最新ID + 1）

## ステップ2: メタデータ追加

`blogArticles` 配列の**先頭**に追加：

```typescript
{
  id: 65,
  title: 'ゲーム名におすすめのスマホ・PC・タブレット選び 2026｜デバイス比較',
  description: 'ゲーム名をプレイするスマホ、PC、タブレットそれぞれの選び方とおすすめをデバイス別に比較。',
  date: '2026-09-27',
},
```

## ステップ3: 記事ファイル作成

`src/app/blog/article65/page.tsx` を作成し、以下のテンプレートをコピー：

```typescript
import SeoArticle, { DeviceSection, ProductPick } from '@/components/blog/SeoArticle'
import { BlogParagraph, BlogList } from '@/components/blog/BlogArticle'
import AmazonCta from '@/components/blog/AmazonCta'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(65)

export default function Article65Page() {
  return (
    <SeoArticle
      title="ゲーム名におすすめのスマホ・PC・タブレット選び 2026｜デバイス比較"
      date="2026-09-27"
      lead="ゲーム名は、スマホ・PC・タブレットのどのデバイスでもプレイできますが、それぞれ向き不向きがあります。この記事では、デバイスごとの選び方とおすすめをまとめます。"
    >
      <DeviceSection deviceName="スマホでゲーム名をプレイする場合">
        <BlogParagraph>
          スマホで快適にプレイするための選び方を書く（80-150文字程度）。
        </BlogParagraph>
        <BlogList>
          <li>基準1: 具体的な判断ポイント</li>
          <li>基準2: 具体的な判断ポイント</li>
          <li>基準3: 具体的な判断ポイント</li>
        </BlogList>
        <BlogParagraph>
          おすすめモデル例（2026年時点）：
        </BlogParagraph>
        <ProductPick
          name="製品名"
          specs="スペック概要"
          amazonUrl="https://www.amazon.co.jp/s?k=検索キーワード"
        />
        <ProductPick
          name="製品名2"
          specs="スペック概要2"
          amazonUrl="https://www.amazon.co.jp/s?k=検索キーワード2"
        />
      </DeviceSection>

      <DeviceSection deviceName="PCでゲーム名をプレイする場合">
        <BlogParagraph>
          PCで快適にプレイするための選び方を書く（80-150文字程度）。
        </BlogParagraph>
        <BlogList>
          <li>基準1: 具体的な判断ポイント</li>
          <li>基準2: 具体的な判断ポイント</li>
          <li>基準3: 具体的な判断ポイント</li>
        </BlogList>
        <BlogParagraph>
          おすすめモデル例（2026年時点）：
        </BlogParagraph>
        <ProductPick
          name="製品名"
          specs="スペック概要"
          amazonUrl="https://www.amazon.co.jp/s?k=検索キーワード"
        />
        <ProductPick
          name="製品名2"
          specs="スペック概要2"
          amazonUrl="https://www.amazon.co.jp/s?k=検索キーワード2"
        />
      </DeviceSection>

      <DeviceSection deviceName="タブレットでゲーム名をプレイする場合">
        <BlogParagraph>
          タブレットで快適にプレイするための選び方を書く（80-150文字程度）。
        </BlogParagraph>
        <BlogList>
          <li>基準1: 具体的な判断ポイント</li>
          <li>基準2: 具体的な判断ポイント</li>
          <li>基準3: 具体的な判断ポイント</li>
        </BlogList>
        <BlogParagraph>
          おすすめモデル例（2026年時点）：
        </BlogParagraph>
        <ProductPick
          name="製品名"
          specs="スペック概要"
          amazonUrl="https://www.amazon.co.jp/s?k=検索キーワード"
        />
        <ProductPick
          name="製品名2"
          specs="スペック概要2"
          amazonUrl="https://www.amazon.co.jp/s?k=検索キーワード2"
        />
      </DeviceSection>

      <AmazonCta />
    </SeoArticle>
  )
}
```

## ステップ4: カスタマイズのポイント

### 必ず変更する項目

- **ID番号**: `metadata`, `articlePath`, ファイル名すべて一致させる
- **title**: SEO用。「ゲーム名」と「2026」を含める
- **date**: 今日の日付
- **lead**: 記事の概要（100-150文字）
- **デバイスセクション**: スマホ/PC/タブレット各セクションの中身

### ProductPick の書き方

```typescript
<ProductPick
  name="実在する製品名"
  specs="CPU型番やGPU、メモリ容量など"
  amazonUrl="https://www.amazon.co.jp/s?k=製品名+型番"
/>
```

- `name`: 正確な製品名
- `specs`: 重要スペックのみ（20-40文字）
- `amazonUrl`: Amazon検索URL（`/s?k=検索語`形式推奨）

### 各デバイスセクションの構成

1. 導入段落（`BlogParagraph`）: 選び方の概要
2. 判断基準リスト（`BlogList`）: 3-5項目
3. おすすめ例の導入（`BlogParagraph`）
4. 製品例2-3個（`ProductPick`）

## ステップ5: 確認

```bash
npm run dev
```

ブラウザで `http://localhost:3000/blog/article65` にアクセスして確認。

## ステップ6: ビルドチェック

```bash
npm run build
```

型エラーがないことを確認してコミット。

---

## 重要な制約

1. **PcDbArticle は使わない**: この記事形式はPC-DB不使用
2. **インラインスタイル禁止**: すべて共有CSS（既にコンポーネントに組み込み済み）
3. **クライアントフック禁止**: `'use client'`、`useState`、`useEffect` 不要
4. **3デバイス固定**: スマホ・PC・タブレットの順で統一

## 完了

たった50-80行で記事完成。次の記事も同じテンプレートで量産可能。
