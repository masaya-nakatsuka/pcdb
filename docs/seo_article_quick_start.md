# SEO記事作成クイックスタート

PC-DBを使わない一般SEO記事（ゲーム×デバイス選び系）の作成手順。

## 対象と制約

- **対象**: 「ゲーム名 × スマホ/PC/タブレット × おすすめ選び」形式
- **非対象**: PC-DB記事（article28-63）は `PcDbArticle` を使用
- **制約**: インラインスタイル禁止、`'use client'` 禁止、3デバイス固定

## 5ステップで作成

### 1. ID確認とメタデータ追加

`src/lib/blogMetadata.ts` で次のID番号を確認し、配列**先頭**に追加：

```typescript
{
  id: 65,
  title: 'ゲーム名におすすめのスマホ・PC・タブレット選び 2026｜デバイス比較',
  description: 'ゲーム名をプレイするスマホ、PC、タブレットの選び方とおすすめ。',
  date: '2026-09-27',
},
```

### 2. 記事ファイル作成

`src/app/blog/article65/page.tsx` を作成：

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
        <BlogParagraph>選び方の概要（80-150文字）</BlogParagraph>
        <BlogList>
          <li>基準1</li>
          <li>基準2</li>
          <li>基準3</li>
        </BlogList>
        <BlogParagraph>おすすめモデル例（2026年時点）：</BlogParagraph>
        <ProductPick name="製品名" specs="スペック" amazonUrl="https://www.amazon.co.jp/s?k=検索" />
      </DeviceSection>

      {/* PC・タブレットも同じ構造で繰り返す */}

      <AmazonCta />
    </SeoArticle>
  )
}
```

### 3. デバイスセクション記入

スマホ・PC・タブレットの3セクションを記入：
- 導入段落（選び方概要）
- 判断基準リスト（3-5項目）
- 製品例2-3個（`ProductPick`）

`ProductPick` の `amazonUrl` はAmazon検索URL（`/s?k=製品名`）または商品URL（`/dp/ASIN`）を指定。アフィリエイトタグは自動付与。

#### ProductPick プロパティ

- `name` (必須): 製品名
- `specs` (オプション): スペック概要
- `amazonUrl` (必須): Amazon URL（検索URL `/s?k=製品名` または商品URL `/dp/ASIN`）
- `asin` (オプション): Amazon ASIN（商品画像を表示する場合に指定）
- `imageUrl` (オプション): カスタム画像URL（ASIN の代わりに独自の画像を使う場合）

**画像表示**: `asin` または `imageUrl` を指定すると、120×120pxの商品画像が左側に表示されます。両方未指定の場合はテキストのみのカードになります。

例:

```typescript
<ProductPick
  name="製品名"
  specs="スペック"
  amazonUrl="https://www.amazon.co.jp/dp/B0D3J5ZWQR"
  asin="B0D3J5ZWQR"
/>
```

### 4. 記事64を参照

詳細は `src/app/blog/article64/page.tsx` の実装を参照。

### 5. ビルド確認

```bash
npm run build
```

型エラーなしで完了すればOK。

---

**完了**: 50-80行で記事完成。同じパターンで量産可能。
