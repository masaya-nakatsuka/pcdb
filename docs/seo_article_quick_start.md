# SEO記事クイックスタート

ProductPickを使った記事を作成するためのガイド。

## ステップ1: ID確認

`src/lib/blogMetadata.ts` を開いて、次の記事ID番号を確認（最新ID + 1）

## ステップ2: メタデータ追加

`blogArticles` 配列の**先頭**に以下を追加：

```typescript
{
  id: 64,
  title: '記事タイトル 2026｜サブタイトル',
  description: '検索結果に表示される説明文（120-160文字推奨）',
  date: '2026-06-25',
},
```

## ステップ3: 記事ファイル作成

`src/app/blog/article64/page.tsx` を作成：

```typescript
import SeoArticle from '@/components/blog/SeoArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(64)

export default function Article64Page() {
  return (
    <SeoArticle
      articlePath="/blog/article64"
      title="記事タイトル 2026｜サブタイトル"
      date="2026-06-25"
    >
      <p>記事の導入文をここに書きます。</p>
      
      <SeoArticle.DeviceSection
        title="デバイスセクションのタイトル"
        devices={[
          {
            name: '製品名',
            specs: 'CPU / RAM / SSD などのスペック情報',
            amazonUrl: 'https://www.amazon.co.jp/dp/B0XXXXXX',
            asin: 'B0XXXXXX',
          },
          {
            name: '別の製品名',
            specs: 'スペック情報',
            amazonUrl: 'https://www.amazon.co.jp/s?k=検索キーワード',
            imageUrl: 'https://example.com/image.jpg',
          },
        ]}
      >
        <p>このセクションの説明文。複数の段落を書けます。</p>
        <p>デバイスの選び方やポイントを説明します。</p>
      </SeoArticle.DeviceSection>

      <SeoArticle.DeviceSection
        title="別のセクション"
        devices={[
          {
            name: '製品名3',
            amazonUrl: 'https://www.amazon.co.jp/dp/B0YYYYYY',
            asin: 'B0YYYYYY',
          },
        ]}
      >
        <p>セクションの説明文。</p>
      </SeoArticle.DeviceSection>
    </SeoArticle>
  )
}
```

## ProductPickのプロパティ

ProductPickカードに表示する製品情報：

- `name` (必須): 製品名
- `specs` (任意): スペック情報（CPU / RAM / SSDなど）
- `amazonUrl` (必須): Amazon商品リンク
  - `/dp/{ASIN}` 形式を推奨（画像とリンクが一致）
  - `/s?k=検索キーワード` 形式も可能だが、画像は表示されない
- `asin` (任意・推奨): Amazon ASIN（10文字）
  - 指定すると商品画像が自動で表示される
  - 例: `'B0XXXXXX'`
- `imageUrl` (任意): 画像の直接URL
  - `asin`よりも優先される
  - Amazon以外の画像URLを使う場合に指定

## 画像表示について

### ASINを使う場合（推奨）

```typescript
{
  name: 'ASUS Chromebook',
  amazonUrl: 'https://www.amazon.co.jp/dp/B0XXXXXX',
  asin: 'B0XXXXXX',
}
```

- Amazon JP CDNから自動で画像を取得
- パターン: `https://images-na.ssl-images-amazon.com/images/P/${ASIN}.01._AC_SL240_.jpg`
- `amazonUrl` が `/dp/{ASIN}` 形式なら画像とリンクが一致して自然

### 直接URLを使う場合

```typescript
{
  name: '製品名',
  amazonUrl: 'https://www.amazon.co.jp/s?k=キーワード',
  imageUrl: 'https://example.com/product.jpg',
}
```

### 画像なしの場合

```typescript
{
  name: '製品名',
  specs: 'スペック情報',
  amazonUrl: 'https://www.amazon.co.jp/s?k=キーワード',
}
```

- `asin` も `imageUrl` も指定しない
- テキストのみのカードとして表示される

## DeviceSectionについて

複数の製品をまとめて紹介するセクション：

```typescript
<SeoArticle.DeviceSection
  title="セクションタイトル"
  devices={[/* ProductPickの配列 */]}
>
  <p>セクションの説明文</p>
</SeoArticle.DeviceSection>
```

- `title`: セクションのタイトル（h2として表示）
- `devices`: ProductPick製品の配列
- `children`: セクションの説明文（ReactNode）

## ステップ4: 確認

```bash
npm run dev
```

ブラウザで `http://localhost:3000/blog/article64` にアクセスして確認。

## ステップ5: ビルドチェック

```bash
npm run build
```

型エラーがないことを確認。

---

**これで完了！** ProductPickで製品画像付きの記事が作成できます。
