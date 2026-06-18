'use client'

import Link from 'next/link'
import type { ClientUsageCategory } from '../types'

interface GuideLink {
  href: string
  label: string
}

interface GuideContent {
  title: string
  lead: string
  priorities: string[]
  caution: string
  links: GuideLink[]
}

const usageGuides: Record<ClientUsageCategory, GuideContent> = {
  mobile: {
    title: '軽さを最優先しつつ、メインで使える構成かを見る',
    lead: '外出用は軽さだけで選ぶと、メモリやSSDが足りずに使いづらくなります。',
    priorities: ['1kg前後の重量', 'Excel作業の駆動時間', 'メモリ16GB', 'SSD512GB以上'],
    caution: '900g以下はかなり軽い一方で、画面や性能に割り切りが出やすいです。',
    links: [
      { href: '/blog/article61', label: '1kg以下×16GB/512GB' },
      { href: '/blog/article57', label: '1.3kg以下×16GB/512GB' },
      { href: '/blog/article62', label: '11インチ以下×実用構成' },
    ],
  },
  cafe: {
    title: '持ち運びやすさと作業画面のバランスを見る',
    lead: 'カフェ作業では、小さすぎる画面も重すぎる本体も疲れやすくなります。',
    priorities: ['13〜14インチ前後', '1.3kg以下', 'Excel作業の駆動時間', 'メモリ16GB'],
    caution: '価格だけで並べるより、重量と画面サイズを一緒に確認する方が失敗しにくいです。',
    links: [
      { href: '/blog/article58', label: '14インチ前後×実用構成' },
      { href: '/blog/article48', label: '1.3kg以下の軽量PC' },
      { href: '/blog/article37', label: '駆動時間で比較' },
    ],
  },
  home: {
    title: '画面の見やすさと処理性能を優先する',
    lead: '自宅中心なら、軽さよりもCPU、メモリ、SSD、画面サイズの余裕が効きます。',
    priorities: ['CPU性能', 'メモリ16GB以上', 'SSD512GB以上', '15.6インチ前後'],
    caution: '据え置き用途ではバッテリーより、作業中に詰まらない構成を重視します。',
    links: [
      { href: '/blog/article60', label: '15.6インチ前後×実用構成' },
      { href: '/blog/article55', label: '16GB/512GB構成' },
      { href: '/blog/article36', label: 'CPU型番で比較' },
    ],
  },
  cost_performance: {
    title: '安さだけでなく、最低限の実用構成を満たすかを見る',
    lead: 'コスパ比較では、安い理由がメモリやSSD不足ではないかを確認します。',
    priorities: ['7万円前後までの候補', 'メモリ16GB', 'SSD512GB以上', 'CPU型番'],
    caution: '5万円以下は軽作業向けとして見て、メインPCなら7万円前後まで広げるのが現実的です。',
    links: [
      { href: '/blog/article33', label: '価格分布メモ' },
      { href: '/blog/article54', label: '7万円以下PC' },
      { href: '/blog/article56', label: 'N95/N100/N150実用構成' },
    ],
  },
  gaming: {
    title: 'GPUを最初に見て、CPUとメモリで詰まりを避ける',
    lead: 'ゲーム向けは、価格やCPU名だけではなくGPUの有無と強さを確認します。',
    priorities: ['専用GPUまたは強めの内蔵GPU', 'メモリ16GB以上', 'SSD512GB以上', 'CPU性能'],
    caution: '軽量・長時間駆動とは相性が悪いため、持ち運び用とは別軸で見ます。',
    links: [
      { href: '/blog/article34', label: 'ゲーム向けPC比較' },
      { href: '/blog/article55', label: '16GB/512GB構成' },
      { href: '/blog/article36', label: 'CPU型番で比較' },
    ],
  },
  video_editing: {
    title: 'CPU、GPU、メモリ、SSDをまとめて見る',
    lead: '動画編集では、どれか1つだけ強くても体感が伸びにくいです。',
    priorities: ['CPU性能', 'GPU性能', 'メモリ16GB以上', 'SSD512GB以上'],
    caution: '安価な小型PCは編集用途では余裕が少ないため、作業頻度に合わせて上位候補を見ます。',
    links: [
      { href: '/blog/article35', label: '動画編集向けPC比較' },
      { href: '/blog/article55', label: '16GB/512GB構成' },
      { href: '/blog/article60', label: '大画面実用PC' },
    ],
  },
}

interface PcUsageGuideProps {
  usage: ClientUsageCategory
}

export default function PcUsageGuide({ usage }: PcUsageGuideProps) {
  const guide = usageGuides[usage]

  return (
    <section
      aria-label="ランキングの見方"
      style={{
        maxWidth: '1080px',
        margin: '18px auto 0',
        padding: '0 16px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(260px, 0.8fr)',
          gap: '14px',
          border: '1px solid #dbe4ef',
          borderRadius: '8px',
          backgroundColor: '#f8fafc',
          padding: '16px',
        }}
      >
        <div>
          <div style={{ color: '#2563eb', fontSize: '12px', fontWeight: 900, marginBottom: '6px' }}>
            このランキングの見方
          </div>
          <h2 style={{ margin: '0 0 8px', color: '#0f172a', fontSize: '18px', lineHeight: 1.45, fontWeight: 900 }}>
            {guide.title}
          </h2>
          <p style={{ margin: '0 0 12px', color: '#475569', fontSize: '13px', lineHeight: 1.7 }}>
            {guide.lead}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
            {guide.priorities.map((item) => (
              <span
                key={item}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  minHeight: '28px',
                  padding: '0 9px',
                  borderRadius: '999px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '12px',
                  fontWeight: 800,
                }}
              >
                {item}
              </span>
            ))}
          </div>
          <p style={{ margin: '12px 0 0', color: '#64748b', fontSize: '12px', lineHeight: 1.7 }}>
            {guide.caution}
          </p>
        </div>

        <div
          style={{
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            padding: '12px',
          }}
        >
          <div style={{ color: '#0f172a', fontSize: '13px', fontWeight: 900, marginBottom: '8px' }}>
            関連して見る
          </div>
          <div style={{ display: 'grid', gap: '7px' }}>
            {guide.links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: '34px',
                  padding: '0 9px',
                  borderRadius: '7px',
                  backgroundColor: '#f8fafc',
                  color: '#1d4ed8',
                  textDecoration: 'none',
                  fontSize: '12px',
                  fontWeight: 900,
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 720px) {
          section > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}
