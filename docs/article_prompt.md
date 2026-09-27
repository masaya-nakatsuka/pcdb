# 記事作成ガイド（PcDbArticle パターン）

本ドキュメントは、Specsy記事を**最小限のコード**で生成するための最新ガイドです。

## 重要な前提

✅ **PcDbArticleコンポーネントを使用** → ボイラープレートコードは不要  
✅ **サーバーコンポーネント** → 'use client' / useState / useEffect 不要  
✅ **共有CSSスタイル** → インラインスタイル記述は不要  
✅ **型安全** → TypeScriptによる型チェック完備

## 記事作成フロー

### 1. メタデータ登録（`src/lib/blogMetadata.ts`）

新記事のID・タイトル・説明・日付を `blogArticles` 配列の**先頭**に追加：

```typescript
{
  id: 64,  // 次のID番号
  title: '記事タイトル | キーワード 2026',
  description: '記事の要約説明（120-160文字、検索結果に表示される）',
  date: '2026-06-25',
}
```

### 2. 記事ファイル作成（`src/app/blog/article64/page.tsx`）

**基本テンプレート（最小構成）：**

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
      lead="リード文（記事の導入、150-250文字）"
      conclusionTitle="結論の見出し"
      conclusion="結論の本文"
      criteriaTitle="選び方のポイント"
      criteria={[
        'ポイント1',
        'ポイント2',
        'ポイント3',
        'ポイント4',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="Specsyの強み・データベースの活用方法"
      faq={[
        {
          question: 'よくある質問1',
          answer: '回答文1',
        },
        {
          question: 'よくある質問2',
          answer: '回答文2',
        },
      ]}
      pcs={pcs}
    />
  )
}
```

**データフィルタリングが必要な場合：**

```typescript
import type { ServerPcWithCpuSpec } from '@/server/types'

function filterCustomPcs(pcs: ServerPcWithCpuSpec[]) {
  return pcs.filter((pc) => (
    // カスタム条件（例：価格・スペック・サイズ等）
    (pc.price ?? 0) <= 100000 &&
    (pc.ram ?? 0) >= 16 &&
    (pc.rom ?? 0) >= 512
  ))
}

export default async function Article64Page() {
  const pcs = filterCustomPcs(await fetchPcList('cafe'))
  // ...以下同じ
}
```

## PcDbArticle プロパティ一覧

| プロパティ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `articlePath` | string | ✅ | `/blog/article64` 形式 |
| `title` | string | ✅ | 記事タイトル |
| `date` | string | ✅ | `YYYY-MM-DD` 形式 |
| `usage` | ClientUsageCategory | ✅ | `'cafe'` / `'mobile'` / `'gaming'` 等 |
| `listHref` | string | ✅ | PC一覧ページへのリンク |
| `listLabel` | string | ✅ | リンクボタンのラベル |
| `lead` | string | ✅ | リード文（導入部分） |
| `conclusionTitle` | string | ✅ | 結論セクションの見出し |
| `conclusion` | string | ✅ | 結論の本文 |
| `criteriaTitle` | string | ✅ | 選び方セクションの見出し |
| `criteria` | string[] | ✅ | 選び方のポイント（箇条書き） |
| `dataAngleTitle` | string | ✅ | データ活用セクションの見出し |
| `dataAngle` | string | ✅ | データ活用の説明 |
| `faq` | FAQ[] | ✅ | よくある質問（2-4個推奨） |
| `pcs` | ClientPcWithCpuSpec[] | ✅ | PC一覧データ |
| `tableDescription` | string | - | テーブル説明（省略可） |
| `batteryDisplay` | 'excel' \| 'profiles' | - | バッテリー表示形式 |
| `secondaryLead` | string \| null | - | 第2リード文（null でデフォルト） |
| `conclusionIntro` | string \| null | - | 結論の導入文（null でデフォルト） |
| `tableIntro` | string \| null | - | テーブルの導入文（null でデフォルト） |

## 記事コンテンツ作成のポイント

### 構成設計

1. **リード文（150-250文字）**
   - 読者の具体的な悩み・使用シーンを提示
   - 記事で解決できることを明示
   - SpecsyのPC-DBを使う理由を簡潔に説明

2. **結論セクション**
   - 見出し: 核心的な判断基準を端的に表現
   - 本文: 最重要ポイントを2-3文で簡潔に

3. **選び方のポイント（4-5項目）**
   - 各項目は具体的な判断基準
   - 優先順位が高い順に並べる
   - 例: 「毎日持ち運ぶなら重量1.3kg以下を優先する」

4. **データ活用セクション**
   - SpecsyのDB機能の強みを具体的に説明
   - なぜ他の比較記事より優れているかを示す

5. **FAQ（2-4個）**
   - 記事テーマに関連する具体的な疑問
   - 回答は簡潔に（80-150文字目安）

### トーン・文体

- 読者の作業シーンを具体的に想像させる
- 比較軸を明確化（軽さ×画面×打鍵感、など）
- 数値は「目安」として扱い、断定を避ける
- 押し売り感なく、選択肢を尊重する

### SEO最適化

- 主キーワード: タイトル・見出し・本文前半に自然配置
- ニッチKW: 2-3語の複合キーワードを含める
- 過度な繰り返し・不自然な詰め込み禁止

## fetchPcList カテゴリ選択

適切なカテゴリを選択してください：

- `'cafe'` - 一般的なノートPC
- `'mobile'` - モバイル・軽量ノートPC
- `'home'` - 自宅用・大画面PC
- `'gaming'` - ゲーム向けPC
- `'video_editing'` - 動画編集向けPC
- `'cost_performance'` - コスパ重視PC
- `'desktop'` - デスクトップPC
- `'mini_pc'` - ミニPC
- `'used'` - 中古PC

## ビルド・確認

```bash
# 型チェック
npm run build

# 開発サーバー起動
npm run dev

# 記事URL
http://localhost:3000/blog/article64
```

## 禁止事項

❌ `'use client'` ディレクティブの使用  
❌ `useState` / `useEffect` / クライアントフック  
❌ インラインスタイルの記述  
❌ 手動でのローディング状態管理  
❌ 生HTML（`<table>`, `<ul>`, `<p>`）の直接使用  
❌ PC一覧へのリンクCTA（必ず埋め込み）  

## 既存記事の参考例

- **基本パターン**: `src/app/blog/article28/page.tsx`
- **カスタムフィルタ**: `src/app/blog/article60/page.tsx`
- **メタデータ登録**: `src/lib/blogMetadata.ts`

## よくあるトラブル

**Q: ビルドエラーが出る**
- メタデータ登録忘れ → `blogMetadata.ts` に追加
- 型エラー → プロパティ名・型を確認

**Q: 記事が表示されない**
- `export const dynamic = 'force-dynamic'` の記述確認
- ファイルパスが `src/app/blog/article<ID>/page.tsx` になっているか確認

**Q: PC一覧が空になる**
- `fetchPcList` のカテゴリが適切か確認
- フィルタ条件が厳しすぎないか確認

## まとめ

現在のテンプレートは**20-40行程度**で記事を作成できます。  
旧テンプレート（~145行）と比較して：

✅ **トークン数 70%削減**  
✅ **ボイラープレート完全削除**  
✅ **CSS一元管理による保守性向上**  
✅ **サーバーコンポーネントによるパフォーマンス改善**

---

参照: `docs/docs_master.md` - 記事作成ワークフロー全体  
参照: `docs/article_tone_reference.md` - トーン・文体の詳細
