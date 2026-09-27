# 記事作成クイックスタート

新しい記事を5分で作成するための最短手順。

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

`src/app/blog/article64/page.tsx` を作成し、以下をコピー：

```typescript
import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(64)

export default async function Article64Page() {
  const pcs = await fetchPcList('cafe')

  return (
    <PcDbArticle
      articlePath="/blog/article64"
      title="記事タイトル 2026｜サブタイトル"
      date="2026-06-25"
      usage="cafe"
      listHref="/pc-list/cafe"
      listLabel="ノートPCランキングを見る"
      lead="この記事では、〇〇について、SpecsyのPC-DBを使って比較します。"
      conclusionTitle="まず押さえるポイント"
      conclusion="〇〇を選ぶなら、まず△△と□□を確認してください。"
      criteriaTitle="選び方の基準"
      criteria={[
        '基準1: 具体的な判断ポイント',
        '基準2: 具体的な判断ポイント',
        '基準3: 具体的な判断ポイント',
        '基準4: 具体的な判断ポイント',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyではAmazon内のPCをDB化し、〇〇と△△を同じ表で比較できます。"
      faq={[
        {
          question: 'よくある質問1？',
          answer: '回答文。具体的に、80-150文字程度で簡潔に。',
        },
        {
          question: 'よくある質問2？',
          answer: '回答文。具体的に、80-150文字程度で簡潔に。',
        },
      ]}
      pcs={pcs}
    />
  )
}
```

## ステップ4: カスタマイズ

### usageとlistHref の組み合わせ

| usage | listHref | listLabel |
|-------|----------|-----------|
| `'cafe'` | `/pc-list/cafe` | ノートPCランキングを見る |
| `'mobile'` | `/pc-list/mobile` | 軽量モバイルPCランキングを見る |
| `'home'` | `/pc-list/home` | 自宅用PCランキングを見る |
| `'gaming'` | `/pc-list/gaming` | ゲーミングPCランキングを見る |
| `'video_editing'` | `/pc-list/video` | 動画編集PCランキングを見る |
| `'cost_performance'` | `/pc-list/cost-performance` | コスパPCランキングを見る |
| `'desktop'` | `/pc-list/desktop` | デスクトップPCランキングを見る |
| `'mini_pc'` | `/pc-list/mini-pc` | ミニPCランキングを見る |
| `'used'` | `/pc-list/used` | 中古PCランキングを見る |

### データフィルタが必要な場合

価格・スペック・サイズ等で絞り込む場合：

```typescript
import type { ServerPcWithCpuSpec } from '@/server/types'

function filterCustomPcs(pcs: ServerPcWithCpuSpec[]) {
  return pcs.filter((pc) => (
    (pc.price ?? 0) <= 100000 &&  // 10万円以下
    (pc.ram ?? 0) >= 16 &&         // 16GB以上
    (pc.rom ?? 0) >= 512           // 512GB以上
  ))
}

export default async function Article64Page() {
  const pcs = filterCustomPcs(await fetchPcList('cafe'))
  // ...
}
```

よく使うフィルタ条件：

```typescript
// 価格帯
(pc.price ?? 0) <= 50000        // 5万円以下
(pc.price ?? 0) <= 100000       // 10万円以下

// メモリ・ストレージ
(pc.ram ?? 0) >= 16             // 16GB以上
(pc.rom ?? 0) >= 512            // 512GB以上

// サイズ・重量
(pc.display_size ?? 0) <= 14    // 14インチ以下
(pc.weight ?? 0) <= 1300        // 1.3kg以下（グラム）

// CPU
pc.cpu?.includes('N100')        // N100搭載
pc.cpu?.includes('Ryzen')       // Ryzen搭載
```

## ステップ5: 確認

```bash
npm run dev
```

ブラウザで `http://localhost:3000/blog/article64` にアクセスして確認。

## ステップ6: ビルドチェック

```bash
npm run build
```

型エラーがないことを確認。

---

**これで完了！** たった20-40行で記事が完成します。

詳細は `docs/article_prompt.md` を参照してください。
