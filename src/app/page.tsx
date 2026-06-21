'use client'

import Link from 'next/link'

type PreviewPanel = {
  href: string
  label: string
  title: string
  lead: string
  chips: string[]
  columns: string[]
  featured?: boolean
}

type CategoryCard = {
  href: string
  label: string
  title: string
  description: string
  points: string[]
}

const previewPanels: PreviewPanel[] = [
  {
    href: '/pc-list',
    label: 'ノートPC',
    title: 'Amazon PC一覧スコア比較',
    lead: '用途別に候補を並べ替え',
    chips: ['軽量', 'コスパ', '仕事用'],
    columns: ['CPU', 'メモリ', '重量', '電池'],
    featured: true,
  },
  {
    href: '/pc-list/desktop',
    label: 'デスクトップ',
    title: 'デスクトップPC比較',
    lead: '据え置き性能と拡張性を見る',
    chips: ['ゲーム', '動画編集'],
    columns: ['CPU', 'GPU', 'RAM', 'SSD'],
  },
  {
    href: '/tablet-list',
    label: 'タブレット',
    title: 'タブレット比較',
    lead: 'AndroidとiPadを整理',
    chips: ['iPad', 'Android'],
    columns: ['SoC', 'RAM', 'ROM', '駆動'],
  },
  {
    href: '/monitor-list',
    label: 'モニター',
    title: 'モニター比較',
    lead: '作業用とゲーム用を分ける',
    chips: ['WQHD', 'USB-C'],
    columns: ['サイズ', '解像度', 'Hz', '端子'],
  },
]

const categoryCards: CategoryCard[] = [
  {
    href: '/pc-list',
    label: 'PC',
    title: 'ノートPCを用途別に比較',
    description: '軽量モバイル、カフェ作業、コスパ重視など、使い方から候補を絞れます。',
    points: ['CPU型番', 'メモリ', '重量', 'バッテリー'],
  },
  {
    href: '/pc-list/desktop',
    label: 'Desktop',
    title: 'デスクトップPCを比較',
    description: 'ゲーム、動画編集、据え置き作業向けに、CPU/GPU/拡張性を見比べます。',
    points: ['CPU', 'GPU', '拡張性', '価格'],
  },
  {
    href: '/tablet-list',
    label: 'Tablet',
    title: 'AndroidとiPadを比較',
    description: 'SoC、容量、画面、駆動時間を軸に、タブレット選びを整理します。',
    points: ['SoC', 'RAM/ROM', '画面', '駆動時間'],
  },
  {
    href: '/monitor-list',
    label: 'Monitor',
    title: 'モニターを用途別に比較',
    description: '作業用、ゲーム用、USB-C環境など、デスク周りの選び方に合わせます。',
    points: ['サイズ', '解像度', 'Hz', 'USB-C'],
  },
]

const useCaseLinks = [
  { href: '/pc-list/mobile', label: '軽量モバイル' },
  { href: '/pc-list/cost-performance', label: 'コスパ重視' },
  { href: '/pc-list/gaming', label: 'ゲーム向け' },
  { href: '/pc-list/video-editing', label: '動画編集' },
  { href: '/pc-list/mini-pc', label: 'Mini PC' },
  { href: '/monitor-list/gaming', label: 'ゲーミングモニター' },
]

function ScreenPreview({ panel }: { panel: PreviewPanel }) {
  return (
    <Link
      href={panel.href}
      className={`screenPreview${panel.featured ? ' screenPreviewFeatured' : ''}`}
      aria-label={`${panel.label}の比較画面を見る`}
    >
      <div className="screenTopbar">
        <span />
        <span />
        <span />
      </div>
      <div className="screenBody">
        <div className="screenMeta">{panel.label}</div>
        <div className="screenTitle">{panel.title}</div>
        <div className="screenLead">{panel.lead}</div>
        <div className="screenChips">
          {panel.chips.map((chip) => (
            <span key={chip}>{chip}</span>
          ))}
        </div>
        <div className="screenTable" aria-hidden="true">
          {panel.columns.map((column, index) => (
            <div key={column} className="screenRow">
              <span>{column}</span>
              <i style={{ width: `${78 - index * 10}%` }} />
            </div>
          ))}
        </div>
      </div>
    </Link>
  )
}

export default function HomePage() {
  return (
    <div className="homePage">
      <header className="siteHeader">
        <Link href="/" className="brand" aria-label="Specsy トップ">
          <span className="brandMark">S</span>
          <span>Specsy</span>
        </Link>
        <nav className="topNav" aria-label="主要カテゴリ">
          <Link href="/pc-list">PC</Link>
          <Link href="/pc-list/desktop">デスクトップ</Link>
          <Link href="/tablet-list">タブレット</Link>
          <Link href="/monitor-list">モニター</Link>
          <Link href="/blog">ブログ</Link>
        </nav>
        <Link href="/pc-list" className="headerCta">
          PCを比較
        </Link>
      </header>

      <main>
        <section className="heroSection" aria-labelledby="hero-title">
          <div className="heroCopy">
            <p className="eyebrow">PCまわりの購入前比較ハブ</p>
            <h1 id="hero-title">
              <span className="titleLine">PCまわりの買い物を</span>
              <span>用途とスペックで比較する</span>
            </h1>
            <p className="heroLead">
              ノートPC、デスクトップPC、Androidタブレット、iPad、モニターを、
              価格・スペック・用途別の見方で整理。買う前の候補選びをシンプルにします。
            </p>
            <div className="heroActions">
              <Link href="/pc-list" className="primaryAction">
                PCを比較する
              </Link>
              <Link href="/monitor-list" className="secondaryAction">
                モニターを見る
              </Link>
            </div>
            <div className="quickLinks" aria-label="カテゴリ別の入口">
              <Link href="/pc-list">ノートPC</Link>
              <Link href="/pc-list/desktop">デスクトップPC</Link>
              <Link href="/tablet-list">タブレット</Link>
              <Link href="/monitor-list">モニター</Link>
            </div>
          </div>

          <div className="previewStage" aria-label="各カテゴリの比較画面プレビュー">
            <div className="previewFrame">
              <div className="previewHeader">
                <div>
                  <span className="previewKicker">Live comparison preview</span>
                  <strong>カテゴリ別の比較画面</strong>
                </div>
                <span className="previewStatus">4 views</span>
              </div>
              <div className="previewGrid">
                {previewPanels.map((panel) => (
                  <ScreenPreview key={panel.href} panel={panel} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="categorySection" aria-labelledby="category-title">
          <div className="sectionHeading">
            <p className="eyebrow">Start by category</p>
            <h2 id="category-title">比較したいカテゴリから選ぶ</h2>
            <p>
              それぞれの画面で、用途に合わせたランキングと比較軸を確認できます。
            </p>
          </div>
          <div className="categoryGrid">
            {categoryCards.map((card) => (
              <Link key={card.href} href={card.href} className="categoryCard">
                <span className="categoryLabel">{card.label}</span>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <div className="pointList">
                  {card.points.map((point) => (
                    <span key={point}>{point}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="useCaseSection" aria-labelledby="usecase-title">
          <div className="sectionHeading compact">
            <p className="eyebrow">Use cases</p>
            <h2 id="usecase-title">用途が決まっている場合はこちら</h2>
          </div>
          <div className="useCaseLinks">
            {useCaseLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="siteFooter">
        <div className="footerInner">
          <div>
            <strong>Specsy</strong>
            <p>
              Amazonのアソシエイトとして、当メディアは適格販売により収入を得ています。
              このサイトはアフィリエイト広告を掲載しています。
            </p>
          </div>
          <div className="footerLinks" aria-label="補助リンク">
            <Link href="/about">運営者情報</Link>
            <Link href="/privacy">プライバシーポリシー</Link>
            <a href="mailto:contact@specsy-hub.com">お問い合わせ</a>
            <Link href="/todo/lp">Specsy Todo</Link>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .homePage {
          min-height: 100vh;
          background:
            linear-gradient(180deg, #f8fafc 0%, #ffffff 42%, #f8fafc 100%);
          color: #0f172a;
        }

        .siteHeader {
          width: min(1180px, calc(100% - 32px));
          min-height: 72px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 24px;
        }

        .brand,
        .topNav a,
        .headerCta,
        .primaryAction,
        .secondaryAction,
        .quickLinks a,
        .categoryCard,
        .useCaseLinks a,
        .footerLinks a,
        .screenPreview {
          text-decoration: none;
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #0f172a;
          font-size: 18px;
          font-weight: 900;
        }

        .brandMark {
          width: 34px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #0f172a;
          color: #ffffff;
          font-size: 15px;
          letter-spacing: 0;
        }

        .topNav {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 4px;
        }

        .topNav a {
          min-height: 36px;
          display: inline-flex;
          align-items: center;
          padding: 0 12px;
          border-radius: 8px;
          color: #475569;
          font-size: 13px;
          font-weight: 800;
        }

        .topNav a:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .headerCta {
          min-height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 16px;
          border-radius: 8px;
          background: #0f172a;
          color: #ffffff;
          font-size: 13px;
          font-weight: 900;
        }

        .heroSection {
          width: min(1180px, calc(100% - 32px));
          min-height: calc(100vh - 72px);
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(500px, 1.1fr);
          align-items: center;
          gap: 36px;
          padding: 28px 0 40px;
        }

        .heroCopy {
          max-width: 620px;
        }

        .eyebrow {
          margin: 0 0 14px;
          color: #2563eb;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0;
          text-transform: uppercase;
        }

        h1 {
          margin: 0;
          color: #0f172a;
          font-size: 44px;
          line-height: 1.04;
          letter-spacing: 0;
        }

        h1 span {
          display: block;
        }

        h1 span:not(.titleLine) {
          color: #1d4ed8;
        }

        .heroLead {
          max-width: 560px;
          margin: 22px 0 0;
          color: #475569;
          font-size: 16px;
          line-height: 1.9;
        }

        .heroActions {
          margin-top: 30px;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .primaryAction,
        .secondaryAction {
          min-height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 20px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 900;
        }

        .primaryAction {
          background: #2563eb;
          color: #ffffff;
          box-shadow: 0 14px 32px rgba(37, 99, 235, 0.22);
        }

        .secondaryAction {
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #0f172a;
        }

        .quickLinks {
          margin-top: 18px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .quickLinks a {
          min-height: 34px;
          display: inline-flex;
          align-items: center;
          padding: 0 11px;
          border: 1px solid #dbeafe;
          border-radius: 8px;
          background: #eff6ff;
          color: #1e3a8a;
          font-size: 12px;
          font-weight: 900;
        }

        .previewStage {
          min-width: 0;
        }

        .previewFrame {
          position: relative;
          padding: 16px;
          border: 1px solid #dbe3ef;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.86);
          box-shadow:
            0 28px 70px rgba(15, 23, 42, 0.14),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
          overflow: hidden;
        }

        .previewFrame::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, rgba(37, 99, 235, 0.08), transparent 42%),
            radial-gradient(circle at 78% 12%, rgba(6, 182, 212, 0.16), transparent 32%);
          pointer-events: none;
        }

        .previewHeader,
        .previewGrid {
          position: relative;
          z-index: 1;
        }

        .previewHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 14px;
        }

        .previewHeader strong {
          display: block;
          margin-top: 3px;
          color: #0f172a;
          font-size: 15px;
          line-height: 1.3;
        }

        .previewKicker,
        .previewStatus {
          color: #64748b;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0;
          text-transform: uppercase;
        }

        .previewStatus {
          min-height: 28px;
          display: inline-flex;
          align-items: center;
          padding: 0 10px;
          border: 1px solid #dbeafe;
          border-radius: 999px;
          background: #eff6ff;
          color: #1d4ed8;
          white-space: nowrap;
        }

        .previewGrid {
          display: grid;
          grid-template-columns: 1.2fr 0.92fr;
          grid-auto-rows: minmax(154px, auto);
          gap: 12px;
        }

        .screenPreview {
          min-width: 0;
          display: block;
          border: 1px solid #dbe3ef;
          border-radius: 14px;
          background: #ffffff;
          color: #0f172a;
          overflow: hidden;
          box-shadow: 0 10px 22px rgba(15, 23, 42, 0.08);
          transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
        }

        .screenPreview:hover {
          transform: translateY(-2px);
          border-color: #bfdbfe;
          box-shadow: 0 16px 34px rgba(15, 23, 42, 0.12);
        }

        .screenPreviewFeatured {
          grid-row: span 2;
        }

        .screenTopbar {
          height: 24px;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 0 10px;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .screenTopbar span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #cbd5e1;
        }

        .screenBody {
          padding: 12px;
        }

        .screenMeta {
          color: #2563eb;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0;
        }

        .screenTitle {
          margin-top: 4px;
          color: #0f172a;
          font-size: 14px;
          font-weight: 900;
          line-height: 1.35;
        }

        .screenLead {
          margin-top: 4px;
          color: #64748b;
          font-size: 11px;
          font-weight: 700;
          line-height: 1.45;
        }

        .screenChips {
          margin-top: 10px;
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .screenChips span {
          min-height: 22px;
          display: inline-flex;
          align-items: center;
          padding: 0 7px;
          border-radius: 999px;
          background: #f1f5f9;
          color: #334155;
          font-size: 10px;
          font-weight: 900;
        }

        .screenTable {
          margin-top: 12px;
          display: grid;
          gap: 8px;
        }

        .screenRow {
          display: grid;
          grid-template-columns: 48px 1fr;
          align-items: center;
          gap: 8px;
          min-height: 14px;
        }

        .screenRow span {
          color: #64748b;
          font-size: 10px;
          font-weight: 900;
        }

        .screenRow i {
          height: 8px;
          display: block;
          border-radius: 999px;
          background: linear-gradient(90deg, #bfdbfe, #67e8f9);
        }

        .categorySection,
        .useCaseSection {
          width: min(1180px, calc(100% - 32px));
          margin: 0 auto;
          padding: 54px 0;
        }

        .sectionHeading {
          max-width: 720px;
          margin-bottom: 24px;
        }

        .sectionHeading.compact {
          margin-bottom: 18px;
        }

        .sectionHeading h2 {
          margin: 0;
          color: #0f172a;
          font-size: 30px;
          line-height: 1.25;
        }

        .sectionHeading p:not(.eyebrow) {
          margin: 10px 0 0;
          color: #64748b;
          font-size: 15px;
          line-height: 1.8;
        }

        .categoryGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .categoryCard {
          display: flex;
          min-height: 244px;
          flex-direction: column;
          padding: 18px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #ffffff;
          color: #0f172a;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
        }

        .categoryCard:hover {
          border-color: #bfdbfe;
          box-shadow: 0 16px 34px rgba(15, 23, 42, 0.1);
        }

        .categoryLabel {
          color: #2563eb;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0;
          text-transform: uppercase;
        }

        .categoryCard h3 {
          margin: 12px 0 0;
          font-size: 18px;
          line-height: 1.35;
        }

        .categoryCard p {
          margin: 10px 0 0;
          color: #64748b;
          font-size: 13px;
          line-height: 1.7;
        }

        .pointList {
          margin-top: auto;
          padding-top: 16px;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .pointList span {
          min-height: 26px;
          display: inline-flex;
          align-items: center;
          padding: 0 8px;
          border-radius: 8px;
          background: #f8fafc;
          color: #334155;
          font-size: 11px;
          font-weight: 900;
        }

        .useCaseSection {
          padding-top: 10px;
        }

        .useCaseLinks {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .useCaseLinks a {
          min-height: 40px;
          display: inline-flex;
          align-items: center;
          padding: 0 14px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #ffffff;
          color: #0f172a;
          font-size: 13px;
          font-weight: 900;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
        }

        .siteFooter {
          margin-top: 28px;
          border-top: 1px solid #e2e8f0;
          background: #0f172a;
          color: #cbd5e1;
        }

        .footerInner {
          width: min(1180px, calc(100% - 32px));
          margin: 0 auto;
          padding: 34px 0;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 24px;
          align-items: start;
        }

        .footerInner strong {
          color: #ffffff;
          font-size: 16px;
        }

        .footerInner p {
          max-width: 680px;
          margin: 10px 0 0;
          font-size: 13px;
          line-height: 1.7;
        }

        .footerLinks {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 10px;
        }

        .footerLinks a {
          color: #e2e8f0;
          font-size: 13px;
          font-weight: 800;
        }

        @media (max-width: 980px) {
          .siteHeader {
            grid-template-columns: 1fr auto;
          }

          .topNav {
            display: none;
          }

          .heroSection {
            min-height: auto;
            grid-template-columns: 1fr;
            gap: 30px;
            padding-top: 40px;
          }

          .heroCopy {
            max-width: none;
          }

          h1 {
            max-width: 760px;
            font-size: 42px;
          }

          .previewGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .screenPreviewFeatured {
            grid-row: auto;
          }

          .categoryGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .siteHeader {
            width: min(100% - 24px, 1180px);
            min-height: 64px;
            gap: 12px;
          }

          .brand {
            font-size: 16px;
          }

          .brandMark {
            width: 30px;
            height: 30px;
            border-radius: 8px;
          }

          .headerCta {
            min-height: 36px;
            padding: 0 12px;
          }

          .heroSection,
          .categorySection,
          .useCaseSection,
          .footerInner {
            width: min(100% - 24px, 1180px);
          }

          .heroSection {
            padding: 30px 0 34px;
          }

          h1 {
            font-size: 32px;
            line-height: 1.08;
          }

          .heroLead {
            font-size: 14px;
            line-height: 1.8;
          }

          .heroActions {
            display: grid;
            grid-template-columns: 1fr;
          }

          .primaryAction,
          .secondaryAction {
            width: 100%;
          }

          .quickLinks {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .quickLinks a {
            justify-content: center;
          }

          .previewFrame {
            padding: 12px;
            border-radius: 14px;
          }

          .previewHeader {
            align-items: flex-start;
          }

          .previewGrid,
          .categoryGrid {
            grid-template-columns: 1fr;
          }

          .screenPreview:nth-child(n + 3) {
            display: none;
          }

          .categorySection,
          .useCaseSection {
            padding: 38px 0;
          }

          .sectionHeading h2 {
            font-size: 24px;
          }

          .categoryCard {
            min-height: 0;
          }

          .useCaseLinks {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .useCaseLinks a {
            justify-content: center;
            text-align: center;
          }

          .footerInner {
            grid-template-columns: 1fr;
          }

          .footerLinks {
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  )
}
