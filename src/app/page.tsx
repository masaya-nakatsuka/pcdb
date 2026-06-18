import type { Metadata } from 'next'
import Link from 'next/link'
import PcSearchLauncher from '@/components/pc-list/PcSearchLauncher'
import { listedBlogArticles } from '@/lib/blogMetadata'

export const metadata: Metadata = {
  title: 'Specsy Hub - Amazon PC比較・ランキング',
  description: 'Amazon内のPCを用途別ランキング、価格帯、CPU、メモリ、SSD、重量などの条件で比較できます。',
}

const usageLinks = [
  {
    href: '/pc-list/cafe',
    label: 'カフェ作業',
    title: '持ち運びと作業性のバランスで見る',
    description: '画面サイズ、重量、電池持ち、基本性能をまとめて比較。',
    accent: '#2563eb',
  },
  {
    href: '/pc-list/cost-performance',
    label: 'コスパ',
    title: '価格と性能の釣り合いで見る',
    description: '画面サイズに引っ張られず、価格・CPU・メモリ・SSDを中心に比較。',
    accent: '#059669',
  },
  {
    href: '/pc-list/mobile',
    label: 'モバイル',
    title: '軽さと電池持ちを優先して見る',
    description: '1kg前後の軽量PCや小型ノートを探しやすいランキング。',
    accent: '#7c3aed',
  },
  {
    href: '/pc-list/gaming',
    label: 'ゲーム',
    title: 'GPUと基本性能を中心に見る',
    description: '専用GPUや内蔵GPUの強さを含めてゲーム向けに比較。',
    accent: '#dc2626',
  },
  {
    href: '/pc-list/video-editing',
    label: '動画編集',
    title: 'CPU/GPU/メモリ重視で見る',
    description: '編集作業で詰まりやすい性能軸を中心に比較。',
    accent: '#0f766e',
  },
  {
    href: '/pc-list/home',
    label: '自宅作業',
    title: '大画面と処理性能を優先して見る',
    description: '据え置き寄りのメインPC候補を比較。',
    accent: '#b45309',
  },
]

const focusLinks = [
  { href: '/blog/article33', label: '価格分布', title: 'いくら出せばいいかを見る' },
  { href: '/blog/article55', label: '16GB/512GB', title: '実用構成だけを見る' },
  { href: '/pc-list/used', label: '中古PC', title: '中古・整備済みだけを見る' },
  { href: '/blog/article61', label: '1kg以下', title: '超軽量メイン候補を見る' },
  { href: '/blog/article62', label: '11インチ以下', title: '超小型PCを見る' },
]

const presetLinks = [
  {
    href: '/pc-list/cost-performance?preset=budgetMain',
    label: '7万円以下',
    title: '安くて実用的な候補',
    description: '低価格帯から16GB/512GB以上をすぐ確認。',
  },
  {
    href: '/pc-list/mobile?preset=mobileMain',
    label: '持ち運び',
    title: '軽くて電池も見る候補',
    description: '軽量、実用構成、Excel駆動時間をまとめて反映。',
  },
  {
    href: '/pc-list/cafe?preset=cafeWork',
    label: 'カフェ作業',
    title: '14型前後の作業用候補',
    description: '画面サイズ、軽さ、基本スペックを絞って表示。',
  },
  {
    href: '/pc-list/gaming?preset=creativeGpu',
    label: 'GPU重視',
    title: 'ゲーム・編集寄りの候補',
    description: '実用構成とGPU性能を優先して比較。',
  },
]

const keywordLinks = [
  { href: '/pc-list/cost-performance?q=N100', label: 'N100' },
  { href: '/pc-list/cost-performance?q=Ryzen', label: 'Ryzen' },
  { href: '/pc-list/cost-performance?q=Core%20Ultra', label: 'Core Ultra' },
  { href: '/pc-list/mobile?q=Lenovo', label: 'Lenovo' },
  { href: '/pc-list/gaming?q=Radeon', label: 'Radeon' },
]

const latestArticles = listedBlogArticles.slice(0, 4)

export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
    }}>
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
      }}>
        <div style={{
          maxWidth: '1180px',
          margin: '0 auto',
          minHeight: '64px',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            color: '#0f172a',
            textDecoration: 'none',
            fontWeight: 900,
            whiteSpace: 'nowrap',
          }}>
            <span style={{
              width: '34px',
              height: '34px',
              display: 'inline-flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              gap: '3px',
              padding: '8px 7px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563eb 0%, #14b8a6 100%)',
            }} aria-hidden="true">
              <span style={{ width: '4px', height: '17px', borderRadius: '999px', backgroundColor: '#ffffff' }} />
              <span style={{ width: '4px', height: '12px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.88)' }} />
              <span style={{ width: '4px', height: '8px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.76)' }} />
            </span>
            <span>Specsy Hub</span>
          </Link>

          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }} aria-label="主要ナビゲーション">
            {[
              { href: '/pc-list/cafe', label: 'PCランキング' },
              { href: '/pc-list/cost-performance', label: 'コスパ' },
              { href: '/pc-list/used', label: '中古PC' },
              { href: '/blog', label: 'ブログ' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '34px',
                  padding: '0 10px',
                  borderRadius: '8px',
                  color: '#475569',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <section style={{
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
        }}>
          <div style={{
            maxWidth: '1180px',
            margin: '0 auto',
            padding: '38px 20px 26px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
            gap: '28px',
            alignItems: 'end',
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: '28px',
                padding: '0 10px',
                borderRadius: '999px',
                backgroundColor: '#ecfeff',
                border: '1px solid #a5f3fc',
                color: '#0e7490',
                fontSize: '12px',
                fontWeight: 900,
                marginBottom: '14px',
              }}>
                Amazon PC Comparison
              </div>
              <h1 style={{
                margin: '0 0 12px',
                color: '#0f172a',
                fontSize: 'clamp(32px, 5vw, 58px)',
                lineHeight: 1.06,
                fontWeight: 950,
                letterSpacing: 0,
              }}>
                Specsy Hub
              </h1>
              <p style={{
                maxWidth: '640px',
                margin: '0 0 20px',
                color: '#475569',
                fontSize: '16px',
                lineHeight: 1.8,
                fontWeight: 600,
              }}>
                Amazon内のPCを、用途・価格・CPU・メモリ・SSD・重量・推定駆動時間で比較するPC選び用のハブです。
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <Link href="/pc-list/cafe" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '44px',
                  padding: '0 16px',
                  borderRadius: '8px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: 900,
                }}>
                  PCランキングを見る
                </Link>
                <Link href="/blog/article33" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '44px',
                  padding: '0 16px',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  textDecoration: 'none',
                  fontWeight: 900,
                }}>
                  価格分布を見る
                </Link>
                <Link href="/pc-list/used" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '44px',
                  padding: '0 16px',
                  borderRadius: '8px',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #f59e0b',
                  color: '#92400e',
                  textDecoration: 'none',
                  fontWeight: 900,
                }}>
                  中古PCを見る
                </Link>
              </div>
            </div>

            <PcSearchLauncher />
          </div>
        </section>

        <section style={{ maxWidth: '1180px', margin: '0 auto', padding: '28px 20px 0' }}>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '14px',
          }}>
            <h2 style={{ margin: 0, color: '#0f172a', fontSize: '22px', fontWeight: 900 }}>
              用途別ランキング
            </h2>
            <Link href="/pc-list/cafe" style={{ color: '#2563eb', fontSize: '13px', fontWeight: 900, textDecoration: 'none' }}>
              一覧へ
            </Link>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '12px',
          }}>
            {usageLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'block',
                  minHeight: '154px',
                  padding: '16px',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  textDecoration: 'none',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
                }}
              >
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  minHeight: '26px',
                  padding: '0 9px',
                  borderRadius: '999px',
                  backgroundColor: `${item.accent}14`,
                  color: item.accent,
                  fontSize: '12px',
                  fontWeight: 900,
                  marginBottom: '12px',
                }}>
                  {item.label}
                </span>
                <h3 style={{ margin: '0 0 8px', color: '#0f172a', fontSize: '16px', fontWeight: 900, lineHeight: 1.45 }}>
                  {item.title}
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '13px', lineHeight: 1.65 }}>
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: '1180px', margin: '0 auto', padding: '28px 20px 0' }}>
          <h2 style={{ margin: '0 0 14px', color: '#0f172a', fontSize: '22px', fontWeight: 900 }}>
            条件から見る
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '12px',
            marginBottom: '12px',
          }}>
            {presetLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'block',
                  minHeight: '138px',
                  padding: '16px',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #bfdbfe',
                  textDecoration: 'none',
                  boxShadow: '0 1px 3px rgba(37, 99, 235, 0.08)',
                }}
              >
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  minHeight: '26px',
                  padding: '0 9px',
                  borderRadius: '999px',
                  backgroundColor: '#eff6ff',
                  color: '#1d4ed8',
                  fontSize: '12px',
                  fontWeight: 900,
                  marginBottom: '10px',
                }}>
                  {item.label}
                </div>
                <h3 style={{ margin: '0 0 7px', color: '#0f172a', fontSize: '16px', fontWeight: 900, lineHeight: 1.45 }}>
                  {item.title}
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '13px', lineHeight: 1.65 }}>
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
          }}>
            <span style={{
              color: '#64748b',
              fontSize: '12px',
              fontWeight: 900,
            }}>
              キーワード:
            </span>
            {keywordLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  minHeight: '30px',
                  padding: '0 10px',
                  borderRadius: '999px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  textDecoration: 'none',
                  fontSize: '12px',
                  fontWeight: 900,
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
          }}>
            {focusLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'block',
                  padding: '15px',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  textDecoration: 'none',
                }}
              >
                <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 900, marginBottom: '6px' }}>
                  {item.label}
                </div>
                <div style={{ color: '#1d4ed8', fontSize: '15px', fontWeight: 900, lineHeight: 1.45 }}>
                  {item.title}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: '1180px', margin: '0 auto', padding: '28px 20px 44px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '14px',
          }}>
            <h2 style={{ margin: 0, color: '#0f172a', fontSize: '22px', fontWeight: 900 }}>
              新しい調査メモ
            </h2>
            <Link href="/blog" style={{ color: '#2563eb', fontSize: '13px', fontWeight: 900, textDecoration: 'none' }}>
              ブログへ
            </Link>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '12px',
          }}>
            {latestArticles.map((article) => (
              <Link
                key={article.id}
                href={`/blog/article${article.id}`}
                style={{
                  display: 'block',
                  minHeight: '150px',
                  padding: '16px',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  textDecoration: 'none',
                }}
              >
                <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 900, marginBottom: '8px' }}>
                  {article.date}
                </div>
                <h3 style={{ margin: '0 0 8px', color: '#0f172a', fontSize: '15px', fontWeight: 900, lineHeight: 1.5 }}>
                  {article.title}
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '12px', lineHeight: 1.6 }}>
                  {article.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '28px 20px',
      }}>
        <div style={{
          maxWidth: '1180px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '18px',
          flexWrap: 'wrap',
          color: '#64748b',
          fontSize: '13px',
          lineHeight: 1.7,
        }}>
          <div>
            <p style={{ margin: '0 0 4px' }}>
              Amazonのアソシエイトとして、当メディアは適格販売により収入を得ています。
            </p>
            <p style={{ margin: 0 }}>
              このサイトはアフィリエイト広告（Amazonアソシエイト含む）を掲載しています。
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/privacy" style={{ color: '#475569', textDecoration: 'none', fontWeight: 800 }}>
              プライバシーポリシー
            </Link>
            <Link href="/about" style={{ color: '#475569', textDecoration: 'none', fontWeight: 800 }}>
              運営者情報
            </Link>
            <a href="mailto:contact@specsy-hub.com" style={{ color: '#475569', textDecoration: 'none', fontWeight: 800 }}>
              お問い合わせ
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
