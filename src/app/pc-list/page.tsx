'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import { fetchPcList } from './fetchPcs'
import { ClientPcWithCpuSpec } from '../../components/types'
import ClientPcList from './ClientPcList'

function BackLink() {
  return (
    <Link 
      href="/"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        color: '#3b82f6',
        fontWeight: '500',
        textDecoration: 'none',
        transition: 'color 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = '#1d4ed8'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = '#3b82f6'
      }}
    >
      ← ホームに戻る
    </Link>
  )
}

export default function PcListPage() {
  const [pcs, setPcs] = useState<ClientPcWithCpuSpec[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
      .catch(error => {
        setError(error.message || 'PC一覧の取得に失敗しました')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  return (
    <>
      <Head>
        <title>PC一覧 - スペクシーハブ</title>
        <meta name="description" content="用途別にPCを比較。スペック評価、価格、バッテリー性能でパソコンを選ぼう。" />
      </Head>
      <div>
      <div style={{
        backgroundColor: 'white',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '16px'
        }}>
          <BackLink />
        </div>
      </div>
      {isLoading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <div style={{
            color: '#6b7280',
            fontSize: '16px',
            fontWeight: '500'
          }}>
            PCデータを読み込み中...
          </div>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : error ? (
        <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>
          エラー: {error}
        </div>
      ) : (
        <ClientPcList pcs={pcs} />
      )}

      {/* このアプリについて（PC一覧用セクション） */}
      <div style={{
        backgroundColor: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        padding: '40px 16px',
        marginTop: '40px'
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            color: '#0f172a'
          }}>
            <h2 style={{
              margin: '0 0 6px 0',
              fontSize: '18px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>このアプリについて</h2>
            <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(59,130,246,0.5), rgba(139,92,246,0.5))', margin: '0 0 12px 0' }} />

            <p style={{ margin: '0 0 12px 0', color: '#334155', lineHeight: 1.8 }}>
              本サイトは、パソコンの各スペックを“わかる数字”に落とし込み、総合スコアとしてランキング化することで、専門知識がなくても用途に最適で高パフォーマンスなPCを選べるよう設計された比較プラットフォームです。CPU・GPU・メモリ・ストレージ・重量・価格・入出力などの多要素を横断的に捉え、迷いやすい比較作業をシンプルに。“どれが自分に合っているのか”を直感的に掴める体験を提供します。
            </p>

            <h3 style={{ margin: '14px 0 6px 0', fontSize: '14px', fontWeight: 800, display: 'inline-block', padding: '6px 10px', borderRadius: '8px', backgroundColor: 'rgba(15,23,42,0.04)', border: '1px solid #e2e8f0', borderLeft: '3px solid #3b82f6' }}>コンセプト</h3>
            <p style={{ margin: '0 0 12px 0', color: '#334155', lineHeight: 1.8 }}>
              情報が多いほど選択は難しくなります。本サイトは“比較のための比較”をやめ、用途ベースで最適解に近づくための土台として、スペックを定量化・可視化。表面的な数字の羅列ではなく、実用の観点から“体験の質”に結び付けて評価することを目指しています。
            </p>

            <h3 style={{ margin: '14px 0 6px 0', fontSize: '14px', fontWeight: 800, display: 'inline-block', padding: '6px 10px', borderRadius: '8px', backgroundColor: 'rgba(15,23,42,0.04)', border: '1px solid #e2e8f0', borderLeft: '3px solid #3b82f6' }}>完全スコアリングの強み</h3>
            <p style={{ margin: '0 0 12px 0', color: '#334155', lineHeight: 1.8 }}>
              ランキングは完全なシステムによってスコア化しています。他にはない独自性で、評価のブレや個人の主観を極力排除。具体的な計算式や配点、算出手順は日々改良を重ねており、詳細は公開していませんが、常に最新の市場動向・実用性・コストバランスが反映されるよう調整しています。結果として、“用途に対するコスパ”まで含めた総合力が見やすく、比較の迷いを最小化できます。
            </p>

            <h3 style={{ margin: '14px 0 6px 0', fontSize: '14px', fontWeight: 800, display: 'inline-block', padding: '6px 10px', borderRadius: '8px', backgroundColor: 'rgba(15,23,42,0.04)', border: '1px solid #e2e8f0', borderLeft: '3px solid #3b82f6' }}>ニッチ領域まで網羅（UMPC/コンバーチブル/タブレット型PCなど）</h3>
            <p style={{ margin: '0 0 12px 0', color: '#334155', lineHeight: 1.8 }}>
              メジャーなノートPCやデスクトップだけでなく、アマゾン内で人気が高まりつつあるUMPC（超小型PC）やコンバーチブルPC、タブレット型PCなど、ニッチで比較しづらい領域も積極的にカバーしています。小型・軽量・多用途といった特性を持つこれらのカテゴリは、従来の比較軸だけでは評価しにくい分、総合スコア化の価値が大きく表れる分野です。今後も取り扱いジャンルは継続的に拡大していきます。
            </p>

            <h3 style={{ margin: '14px 0 6px 0', fontSize: '14px', fontWeight: 800, display: 'inline-block', padding: '6px 10px', borderRadius: '8px', backgroundColor: 'rgba(15,23,42,0.04)', border: '1px solid #e2e8f0', borderLeft: '3px solid #3b82f6' }}>バッテリー駆動時間の独自推定</h3>
            <p style={{ margin: '0 0 12px 0', color: '#334155', lineHeight: 1.8 }}>
              各PCのバッテリー駆動時間は、独自の計算に基づいて“なるべくフェアな条件”で推定しています。現実の使用に近い前提を置きつつ、モデル間の比較がしやすいよう標準化。具体的な算出方法や内部パラメータは非公開ですが、実利用での体感差が見えやすいよう継続的に改善しています。
            </p>

            <h3 style={{ margin: '14px 0 6px 0', fontSize: '14px', fontWeight: 800, display: 'inline-block', padding: '6px 10px', borderRadius: '8px', backgroundColor: 'rgba(15,23,42,0.04)', border: '1px solid #e2e8f0', borderLeft: '3px solid #3b82f6' }}>こんな方におすすめ</h3>
            <ul style={{ margin: '0 0 12px 0', paddingLeft: '18px', color: '#475569', lineHeight: 1.8 }}>
              <li>PCに詳しくないが、用途に合う“失敗しない1台”をスムーズに見つけたい</li>
              <li>UMPCやコンバーチブル、タブレット型PCなどのニッチカテゴリも比較したい</li>
              <li>価格・性能・携帯性・電池持ちを総合的に見て、コスパ重視で選びたい</li>
              <li>ランキングで大枠を掴みつつ、個別スペックも納得して決めたい</li>
            </ul>

            <h3 style={{ margin: '14px 0 6px 0', fontSize: '14px', fontWeight: 800, display: 'inline-block', padding: '6px 10px', borderRadius: '8px', backgroundColor: 'rgba(15,23,42,0.04)', border: '1px solid #e2e8f0', borderLeft: '3px solid #3b82f6' }}>使い方の流れ（かんたん3ステップ）</h3>
            <ul style={{ margin: '0 0 12px 0', paddingLeft: '18px', color: '#475569', lineHeight: 1.8 }}>
              <li>1) 用途を選ぶ: 学習/仕事/クリエイティブ/ゲーム/持ち運び重視 などを想定</li>
              <li>2) ランキングで全体像を掴む: 総合スコアで候補を素早く絞り込み</li>
              <li>3) 詳細を確認: 価格・重量・電池持ち・入出力など、優先軸で最終調整</li>
            </ul>

            <h3 style={{ margin: '14px 0 6px 0', fontSize: '14px', fontWeight: 800, display: 'inline-block', padding: '6px 10px', borderRadius: '8px', backgroundColor: 'rgba(15,23,42,0.04)', border: '1px solid #e2e8f0', borderLeft: '3px solid #3b82f6' }}>今後の拡張</h3>
            <ul style={{ margin: 0, paddingLeft: '18px', color: '#475569', lineHeight: 1.8 }}>
              <li>対応カテゴリの拡大（UMPC/コンバーチブル/タブレット型PCの更なる充実）</li>
              <li>より現実に近い電池持ち推定への継続的アップデート</li>
              <li>ユーザーの用途プロファイルに合わせたレコメンドの高度化</li>
            </ul>
          </div>
        </div>
      </div>

      {/* フッター */}
      <div style={{
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #e9ecef',
        padding: '40px 20px',
        marginTop: '60px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          {/* アフィリエイト開示 */}
          <div style={{
            marginBottom: '24px',
            color: '#6c757d',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            <p style={{ margin: '0 0 8px 0' }}>
              Amazonのアソシエイトとして、当メディアは適格販売により収入を得ています。
            </p>
            <p style={{ margin: '0' }}>
              このサイトはアフィリエイト広告（Amazonアソシエイト含む）を掲載しています。
            </p>
          </div>

          {/* コピーライト */}
          <div style={{
            borderTop: '1px solid #e9ecef',
            paddingTop: '24px',
            color: '#6c757d',
            fontSize: '14px'
          }}>
            © 2025 Specsy. All rights reserved.
          </div>
        </div>
      </div>
      </div>
    </>
  )
}