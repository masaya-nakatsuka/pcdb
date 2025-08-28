# 記事作成チェックリスト（SEO最適化・ブロガー調）

## 【必須】記事作成前チェック

- [ ] **キーワード重複確認**: 既存記事のタイトル・主要キーワードと被らないことを確認
- [ ] **テーマ設定**: 読者の具体的な悩み・使用シーンを明確化
- [ ] **見出し構成設計**: 8-10個のH2見出しを先に決定（結論→早見表→選び方→用途別→価格帯→チェックリスト→ケーススタディ→CTA）
- [ ] **要素配分計画**: 箇条書きセクション1-2個、テーブルセクション0-1個の配置を決定

## 【必須】技術実装チェック

- [ ] **React import**: useEffect, useState, ClientPcList, fetchPcList, ClientPcWithCpuSpecをimport
- [ ] **状態管理**: pcs, isLoading, error のstate設定
- [ ] **データ取得**: useEffectでfetchPcList('cafe')を実行
- [ ] **Blogコンポーネント**: BlogParagraph, BlogList, BlogSection, BlogTable系のみ使用（生HTML禁止）

## 【必須】コンテンツ構造チェック

- [ ] **文字数**: 5000-8000文字の記事を作成
- [ ] **文章エレメント**: 各セクションに150文字以内のBlogParagraphを最低1個配置
- [ ] **文章連続**: BlogParagraphは最大2連続まで（70%の確率で2個目追加）
- [ ] **要素シーケンス**: 同種要素を連続配置しない（見出し/箇条書き/表/文章）
- [ ] **箇条書き**: BlogListは3-5項目、前後にBlogParagraph配置
- [ ] **テーブル**: BlogTableは適切なHeader/Body構造で作成

## 【必須】SEO・コンテンツ品質チェック

- [ ] **主キーワード**: タイトル・H2・本文前半に自然に配置
- [ ] **ニッチKW**: 2-3語の複合キーワードを自然に内包
- [ ] **体験談**: 1セクションで具体的な使用例・学びを記載
- [ ] **数値表現**: "目安"として扱い、断定を避ける
- [ ] **読者志向**: 押し売り感なく、選択肢を尊重する文体

## 【最重要】CTA実装チェック

- [ ] **埋め込みPCリスト**: 記事最後にClientPcListコンポーネントを配置（リンク禁止）
- [ ] **ローディング状態**: isLoading時のスピナー表示を実装
- [ ] **エラーハンドリング**: error時のエラーメッセージ表示を実装
- [ ] **実装コード確認**: 以下のJSXコードを最終セクション内に配置

```jsx
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
```

## 【禁止事項】必ず避けること

- [ ] **生HTML使用**: `<table>`, `<ul>`, `<p>`などの直接使用禁止
- [ ] **リンクCTA**: PC一覧へのリンク配置禁止（必ず埋め込み）
- [ ] **キーワード重複**: 同サイト内他記事との主要キーワード重複禁止
- [ ] **断定表現**: 過度な断定・誇張表現の使用禁止
- [ ] **要素連続**: 同種ブロック要素の連続配置禁止

## 【最終確認】公開前チェック

- [ ] **全体構成**: 見出し8-10個、適切な要素配分、自然な流れ
- [ ] **技術動作**: React hooks、state管理、PC リスト表示の正常動作
- [ ] **SEO最適化**: ユニークなキーワード、自然な配置、適切な文字数
- [ ] **読者体験**: 具体性、納得感、選択支援の3要素を確認

---

## 記事作成テンプレート

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
          {/* 記事内容 */}
          
          <BlogSection title="最終セクション（PCリスト埋め込み）">
            <BlogParagraph>最終的な選択指針...</BlogParagraph>
            {/* 上記のPCリスト埋め込みコード */}
          </BlogSection>
        </BlogContent>
      </BlogArticle>
    </BlogLayout>
  )
}
```

---

## 補足情報

### トーン・文体ガイドライン
- 読者の作業シーンを具体的に想像させる導入（例: カフェの小テーブル、膝上作業、会議続きの日）
- 比較軸を明確化（軽さ×画面×打鍵感、電池持ち×静音、価格×体験）
- 一般的アドバイス→ニッチ視点→ケーススタディの順で構成

### 文章エレメント詳細ルール
- 大文章エレメント: 100-150文字以内
- 小文章エレメント: 50-80文字以内  
- 大→小、小→大の組み合わせで連続配置
- 各セクション最低1個の文章エレメント必須

### SEO戦略詳細
- 主キーワード: 記事テーマのメイン（例: 「UMPC おすすめ 2025」）
- 複合・ニッチ: 2-3語の自然な組合せ
- 配置: タイトル/H2/H3/本文前半に自然挿入
- 過度な繰り返し・不自然な詰め込み禁止