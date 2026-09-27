# 記事テンプレート移行例（Before → After）

新しいPcDbArticleパターンによる改善を示します。

---

## ❌ 旧テンプレート（145行、'use client'パターン）

```jsx
'use client'

import BlogLayout from '../../../components/blog/BlogLayout'
import { BlogArticle, BlogContent, BlogSection, BlogParagraph, BlogList, BlogTable, BlogTableHeader, BlogTableCell, BlogTableRow, BlogTableBody } from '@/components/blog/BlogArticle'
import { useEffect, useState } from 'react'
import ClientPcList from '../../pc-list/ClientPcList'
import { fetchPcList } from '../../pc-list/fetchPcs'
import type { ClientPcWithCpuSpec } from '../../../components/types'

export default function ArticleXXPage() {
  const [pcs, setPcs] = useState<ClientPcWithCpuSpec[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    fetchPcList('cafe')
      .then((data) => {
        if (Array.isArray(data)) {
          setPcs(data)
        } else {
          setError('データの形式が正しくありません')
        }
      })
      .catch((e: any) => setError(e?.message || 'PC一覧の取得に失敗しました'))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <BlogLayout>
      <BlogArticle title={'記事タイトル'} date={'2025-08-28'}>
        <BlogContent>
          <BlogSection title="導入">
            <BlogParagraph>導入文...</BlogParagraph>
          </BlogSection>

          <BlogSection title="選び方のポイント">
            <BlogList>
              <li>ポイント1</li>
              <li>ポイント2</li>
              <li>ポイント3</li>
            </BlogList>
          </BlogSection>

          <BlogSection title="最終セクション（PCリスト埋め込み）">
            <BlogParagraph>最終的な選択指針...</BlogParagraph>
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', border: '3px solid #f3f3f3', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <span style={{ color: '#6b7280', fontSize: '14px' }}>PCデータを読み込み中...</span>
                <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              </div>
            ) : error ? (
              <div style={{ padding: '12px', color: 'red', textAlign: 'center' }}>エラー: {error}</div>
            ) : (
              <div style={{ marginTop: '12px' }}><ClientPcList pcs={pcs} /></div>
            )}
          </BlogSection>
        </BlogContent>
      </BlogArticle>
    </BlogLayout>
  )
}
```

**問題点:**
- ❌ 145行の冗長なコード
- ❌ 'use client'によるクライアントレンダリング
- ❌ 手動の状態管理（useState/useEffect）
- ❌ 手動のローディング・エラー処理
- ❌ インラインCSS（ローディングスピナー等）
- ❌ 手動のレイアウト構築
- ❌ 構造的なデータ（criteria, FAQ等）が散在
- ❌ SEOメタデータなし

---

## ✅ 新テンプレート（25行、PcDbArticleパターン）

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
      title="記事タイトル"
      date="2026-06-25"
      usage="cafe"
      listHref="/pc-list/cafe"
      listLabel="ノートPCランキングを見る"
      lead="導入文..."
      conclusionTitle="結論の見出し"
      conclusion="結論の本文"
      criteriaTitle="選び方のポイント"
      criteria={['ポイント1', 'ポイント2', 'ポイント3']}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="データ活用の説明"
      faq={[{ question: '質問', answer: '回答' }]}
      pcs={pcs}
    />
  )
}
```

**改善点:**
- ✅ 25行に削減（82%減）
- ✅ サーバーコンポーネント（高速、SEO最適）
- ✅ 状態管理不要（自動処理）
- ✅ ローディング・エラー処理不要（コンポーネント内で処理）
- ✅ CSS完全削除（共有コンポーネントで一元管理）
- ✅ 構造化データ（props で明確）
- ✅ SEOメタデータ自動生成
- ✅ JSON-LD構造化データ自動生成
- ✅ 関連記事自動挿入
- ✅ パンくずリスト自動生成

---

## カスタムフィルタの場合

### ❌ 旧パターン（手動フィルタ）

```typescript
useEffect(() => {
  setIsLoading(true)
  fetchPcList('mobile')
    .then((data) => {
      if (Array.isArray(data)) {
        const filtered = data.filter((pc) => 
          (pc.weight ?? 0) <= 1.3 &&
          (pc.ram ?? 0) >= 16 &&
          (pc.rom ?? 0) >= 512
        )
        setPcs(filtered)
      }
    })
    .catch(...)
    .finally(...)
}, [])
```

### ✅ 新パターン（ヘルパー関数使用）

```typescript
import { compose, filterLightweight, filterPracticalSpec } from '@/lib/articleHelpers'

export default async function Article64Page() {
  const filter = compose(filterLightweight, filterPracticalSpec)
  const pcs = filter(await fetchPcList('mobile'))
  // ...
}
```

または直接：

```typescript
import { filterBySpecs } from '@/lib/articleHelpers'

export default async function Article64Page() {
  const pcs = filterBySpecs(await fetchPcList('mobile'), {
    maxWeight: 1.3,
    minRam: 16,
    minRom: 512,
  })
  // ...
}
```

---

## トークン数削減効果

### AI生成時のプロンプトサイズ比較

**旧テンプレート:**
- テンプレートコード: ~145行（~4,500トークン）
- インラインCSS: ~30行（~800トークン）
- 状態管理パターン: ~20行（~500トークン）
- チェックリスト: ~70行（~2,000トークン）
- **合計: ~7,800トークン**

**新テンプレート:**
- テンプレートコード: ~25行（~700トークン）
- プロパティ説明: ~30行（~900トークン）
- クイックスタート: ~20行（~600トークン）
- **合計: ~2,200トークン**

**削減率: 約72%（5,600トークン削減）**

---

## メンテナンス性の改善

### CSS変更の場合

**旧パターン:**
- 全記事ファイル（37個）の該当箇所を個別に修正
- インラインスタイルの探索が必要
- 一貫性の保証が困難

**新パターン:**
- `PcDbArticle.tsx` の1箇所だけ修正
- 全記事に即座に反映
- 一貫性が自動保証

### 新機能追加の場合

**旧パターン:**
- 全記事にコードを追加
- 既存記事の動作検証が必要

**新パターン:**
- コンポーネントに機能追加
- プロパティ追加（既存記事は既定値で動作）
- 後方互換性の維持が容易

---

## 実装済み記事の例

すべての既存記事が新パターンを使用しています：

- **基本パターン**: `src/app/blog/article28/page.tsx`
- **カスタムフィルタ**: `src/app/blog/article60/page.tsx`
- **CPU指定フィルタ**: `src/app/blog/article47/page.tsx`

---

## まとめ

| 項目 | 旧パターン | 新パターン | 改善 |
|------|-----------|-----------|------|
| 行数 | ~145行 | ~25行 | **82%削減** |
| トークン | ~7,800 | ~2,200 | **72%削減** |
| レンダリング | クライアント | サーバー | **高速化** |
| 状態管理 | 手動 | 自動 | **簡素化** |
| CSS | インライン | 共有 | **保守性向上** |
| SEO | 手動 | 自動 | **最適化** |
| エラー処理 | 手動 | 自動 | **堅牢性向上** |

新パターンは**AIによる記事生成を大幅に効率化**し、**人間による保守も容易**にします。
