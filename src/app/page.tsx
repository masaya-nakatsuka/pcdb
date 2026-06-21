'use client'

import Link from 'next/link'

type CategorySection = {
  eyebrow: string
  title: string
  body: string
  href: string
  cta: string
  image: string
  specs: string[]
  tone: 'blue' | 'green' | 'slate' | 'purple' | 'cyan' | 'amber'
}

const categories: CategorySection[] = [
  {
    eyebrow: 'New laptops',
    title: 'ノートPC（新品）',
    body: '軽量モバイル、カフェ作業、在宅用、コスパ重視まで。新品PCを用途とスペックで絞り込みます。',
    href: '/pc-list',
    cta: '新品ノートPCを見る',
    image: '/lp/specsy-laptop-new.webp',
    specs: ['CPU型番', 'メモリ', 'SSD', '重量', '駆動時間'],
    tone: 'blue',
  },
  {
    eyebrow: 'Used laptops',
    title: 'ノートPC（中古）',
    body: '価格を抑えたい人向けに、中古・整備済みPCを分けて確認。状態や実用スペックを見ながら探せます。',
    href: '/pc-list/used',
    cta: '中古ノートPCを見る',
    image: '/lp/specsy-laptop-used.webp',
    specs: ['価格差', '状態', 'CPU世代', 'メモリ', 'SSD'],
    tone: 'green',
  },
  {
    eyebrow: 'Desktop PCs',
    title: 'デスクトップPC',
    body: 'ゲーム、動画編集、据え置き作業向け。CPU/GPU/RAM/ストレージを軸に比較します。',
    href: '/pc-list/desktop',
    cta: 'デスクトップPCを見る',
    image: '/lp/specsy-desktop.webp',
    specs: ['CPU', 'GPU', 'RAM', 'SSD', '拡張性'],
    tone: 'slate',
  },
  {
    eyebrow: 'Mini PCs',
    title: 'Mini PC',
    body: '省スペースな据え置きPCを、性能、端子、価格で比較。デスクを広く使いたい人向けです。',
    href: '/pc-list/mini-pc',
    cta: 'Mini PCを見る',
    image: '/lp/specsy-mini-pc.webp',
    specs: ['CPU', 'RAM', 'SSD', '端子', 'サイズ'],
    tone: 'purple',
  },
  {
    eyebrow: 'Tablets',
    title: 'タブレット',
    body: 'AndroidとiPadを分けて、SoC、RAM、ROM、画面、駆動時間を確認できます。',
    href: '/tablet-list',
    cta: 'タブレットを見る',
    image: '/lp/specsy-tablet.webp',
    specs: ['iPad/Android', 'SoC', 'RAM', 'ROM', '駆動時間'],
    tone: 'cyan',
  },
  {
    eyebrow: 'Monitors',
    title: 'モニター',
    body: '作業用、ゲーム用、USB-C環境など、デスクまわりに合わせてサイズや解像度を比較します。',
    href: '/monitor-list',
    cta: 'モニターを見る',
    image: '/lp/specsy-monitor.webp',
    specs: ['サイズ', '解像度', 'Hz', 'パネル', 'USB-C'],
    tone: 'amber',
  },
]

const heroLinks = [
  { href: '/pc-list', label: '新品ノートPC' },
  { href: '/pc-list/used', label: '中古ノートPC' },
  { href: '/pc-list/desktop', label: 'デスクトップPC' },
  { href: '/pc-list/mini-pc', label: 'Mini PC' },
  { href: '/tablet-list', label: 'タブレット' },
  { href: '/monitor-list', label: 'モニター' },
]

export default function HomePage() {
  return (
    <div className="lpPage">
      <header className="siteHeader">
        <Link href="/" className="brand" aria-label="Specsy トップ">
          <span className="brandMark">S</span>
          <span>Specsy</span>
        </Link>
        <nav className="topNav" aria-label="主要カテゴリ">
          {heroLinks.slice(0, 5).map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <Link href="/pc-check" className="headerCta">
          購入診断
        </Link>
      </header>

      <main>
        <section className="heroSection" aria-labelledby="hero-title">
          <div className="heroText">
            <p className="eyebrow">PC comparison hub</p>
            <h1 id="hero-title">
              <span>PCまわりの買い物を</span>
              <span>カテゴリ別に比較する</span>
            </h1>
            <p className="heroLead">
              ノートPC、デスクトップPC、Mini PC、タブレット、モニターまで。
              まずは探したいカテゴリを選んで、用途とスペックに合う候補を確認できます。
            </p>
            <div className="heroActions">
              <Link href="/pc-list" className="primaryAction">
                新品ノートPCを見る
              </Link>
              <Link href="#categories" className="secondaryAction">
                カテゴリから選ぶ
              </Link>
            </div>
          </div>

          <div className="heroVisual" aria-label="PC関連カテゴリの商品集合画像">
            <div className="heroImage" />
          </div>
        </section>

        <section className="quickCategorySection" aria-label="カテゴリ一覧">
          <div className="quickCategoryGrid">
            {heroLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        <section id="categories" className="categorySections" aria-label="商品カテゴリ">
          {categories.map((category, index) => (
            <section
              key={category.href}
              className={`categoryBlock categoryBlock-${category.tone}${index % 2 === 1 ? ' categoryBlockReverse' : ''}`}
              aria-labelledby={`category-${index}`}
            >
              <div className="categoryImageWrap">
                <div
                  className="categoryImage"
                  style={{ backgroundImage: `linear-gradient(135deg, var(--image-tint), transparent 58%), url(${category.image})` }}
                  aria-hidden="true"
                >
                  <div className="deviceHint">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
              <div className="categoryCopy">
                <p className="eyebrow">{category.eyebrow}</p>
                <h2 id={`category-${index}`}>{category.title}</h2>
                <p>{category.body}</p>
                <div className="specList" aria-label={`${category.title}の比較軸`}>
                  {category.specs.map((spec) => (
                    <span key={spec}>{spec}</span>
                  ))}
                </div>
                <Link href={category.href} className="categoryCta">
                  {category.cta}
                </Link>
              </div>
            </section>
          ))}
        </section>

        <section className="todoSection" aria-labelledby="todo-title">
          <div>
            <p className="eyebrow">Specsy Todo</p>
            <h2 id="todo-title">買う前後のやることも整理する</h2>
            <p>
              PC選びが終わった後は、購入前チェック、初期設定、移行作業、周辺機器の準備もまとめて確認できます。
            </p>
          </div>
          <Link href="/todo/lp" className="todoCta">
            Todoを見る
          </Link>
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
            <Link href="/blog">ブログ</Link>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .lpPage {
          min-height: 100vh;
          background: #f7f8fb;
          color: #121826;
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
        .quickCategoryGrid a,
        .categoryCta,
        .todoCta,
        .footerLinks a {
          text-decoration: none;
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #121826;
          font-size: 18px;
          font-weight: 900;
        }

        .brandMark {
          width: 34px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: #121826;
          color: #ffffff;
          font-size: 15px;
          letter-spacing: 0;
        }

        .topNav {
          display: flex;
          justify-content: center;
          gap: 4px;
        }

        .topNav a {
          min-height: 36px;
          display: inline-flex;
          align-items: center;
          padding: 0 11px;
          border-radius: 8px;
          color: #526074;
          font-size: 13px;
          font-weight: 800;
          white-space: nowrap;
        }

        .topNav a:hover {
          background: #ffffff;
          color: #121826;
        }

        .headerCta {
          min-height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 16px;
          border-radius: 8px;
          background: #121826;
          color: #ffffff;
          font-size: 13px;
          font-weight: 900;
          white-space: nowrap;
        }

        .heroSection {
          width: min(1180px, calc(100% - 32px));
          min-height: calc(100vh - 72px);
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(460px, 1.1fr);
          align-items: center;
          gap: 44px;
          padding: 26px 0 58px;
        }

        .heroText {
          max-width: 590px;
        }

        .eyebrow {
          margin: 0 0 14px;
          color: #2563eb;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0;
          text-transform: uppercase;
        }

        h1,
        h2 {
          margin: 0;
          color: #121826;
          letter-spacing: 0;
        }

        h1 {
          max-width: 720px;
          font-size: 54px;
          line-height: 1.04;
        }

        h1 span {
          display: block;
        }

        .heroLead {
          max-width: 570px;
          margin: 24px 0 0;
          color: #526074;
          font-size: 16px;
          line-height: 1.9;
        }

        .heroActions {
          margin-top: 32px;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .primaryAction,
        .secondaryAction,
        .categoryCta,
        .todoCta {
          min-height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 20px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 900;
        }

        .primaryAction,
        .categoryCta {
          background: #2563eb;
          color: #ffffff;
          box-shadow: 0 14px 32px rgba(37, 99, 235, 0.18);
        }

        .secondaryAction,
        .todoCta {
          border: 1px solid #d7dde8;
          background: #ffffff;
          color: #121826;
        }

        .heroVisual {
          min-width: 0;
        }

        .heroImage {
          min-height: 520px;
          border-radius: 22px;
          border: 1px solid rgba(215, 221, 232, 0.9);
          background-image:
            linear-gradient(90deg, rgba(247, 248, 251, 0.98) 0%, rgba(247, 248, 251, 0.5) 24%, rgba(247, 248, 251, 0.04) 56%),
            radial-gradient(circle at 78% 28%, rgba(37, 99, 235, 0.15), transparent 34%),
            url('/lp/specsy-hero-devices.webp');
          background-size: cover;
          background-position: center;
          box-shadow: 0 28px 70px rgba(18, 24, 38, 0.12);
        }

        .quickCategorySection {
          width: min(1180px, calc(100% - 32px));
          margin: -28px auto 0;
          position: relative;
          z-index: 2;
        }

        .quickCategoryGrid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 8px;
          padding: 10px;
          border: 1px solid #e1e6ef;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 18px 42px rgba(18, 24, 38, 0.08);
          backdrop-filter: blur(12px);
        }

        .quickCategoryGrid a {
          min-height: 46px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 10px;
          border-radius: 8px;
          color: #121826;
          font-size: 13px;
          font-weight: 900;
          text-align: center;
        }

        .quickCategoryGrid a:hover {
          background: #eff6ff;
          color: #1d4ed8;
        }

        .categorySections {
          width: min(1180px, calc(100% - 32px));
          margin: 0 auto;
          padding: 80px 0 54px;
          display: grid;
          gap: 28px;
        }

        .categoryBlock {
          --image-tint: rgba(37, 99, 235, 0.16);
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(380px, 0.95fr);
          gap: 34px;
          align-items: center;
          min-height: 460px;
          padding: 28px;
          border: 1px solid #e1e6ef;
          border-radius: 20px;
          background: #ffffff;
          box-shadow: 0 16px 40px rgba(18, 24, 38, 0.06);
        }

        .categoryBlockReverse {
          grid-template-columns: minmax(380px, 0.95fr) minmax(0, 1.05fr);
        }

        .categoryBlockReverse .categoryImageWrap {
          order: 2;
        }

        .categoryBlockReverse .categoryCopy {
          order: 1;
        }

        .categoryBlock-green {
          --image-tint: rgba(20, 184, 166, 0.16);
        }

        .categoryBlock-slate {
          --image-tint: rgba(71, 85, 105, 0.18);
        }

        .categoryBlock-purple {
          --image-tint: rgba(124, 58, 237, 0.16);
        }

        .categoryBlock-cyan {
          --image-tint: rgba(6, 182, 212, 0.16);
        }

        .categoryBlock-amber {
          --image-tint: rgba(245, 158, 11, 0.16);
        }

        .categoryImageWrap {
          min-width: 0;
        }

        .categoryImage {
          position: relative;
          min-height: 360px;
          border-radius: 16px;
          background-color: #f2f5fa;
          background-size: cover;
          background-position: center;
          overflow: hidden;
        }

        .deviceHint {
          position: absolute;
          right: 24px;
          bottom: 22px;
          display: flex;
          align-items: flex-end;
          gap: 10px;
          opacity: 0.42;
        }

        .deviceHint span {
          display: block;
          border-radius: 8px;
          background: rgba(18, 24, 38, 0.18);
        }

        .deviceHint span:nth-child(1) {
          width: 90px;
          height: 58px;
        }

        .deviceHint span:nth-child(2) {
          width: 32px;
          height: 32px;
        }

        .deviceHint span:nth-child(3) {
          width: 122px;
          height: 76px;
        }

        .categoryCopy {
          max-width: 480px;
        }

        .categoryCopy h2,
        .todoSection h2 {
          font-size: 34px;
          line-height: 1.18;
        }

        .categoryCopy p,
        .todoSection p {
          margin: 16px 0 0;
          color: #526074;
          font-size: 15px;
          line-height: 1.85;
        }

        .specList {
          margin-top: 22px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .specList span {
          min-height: 32px;
          display: inline-flex;
          align-items: center;
          padding: 0 10px;
          border-radius: 8px;
          background: #f2f5fa;
          color: #364154;
          font-size: 12px;
          font-weight: 900;
        }

        .categoryCta {
          margin-top: 28px;
        }

        .todoSection {
          width: min(1180px, calc(100% - 32px));
          margin: 0 auto 70px;
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 24px;
          padding: 30px;
          border: 1px solid #e1e6ef;
          border-radius: 18px;
          background: #ffffff;
        }

        .todoSection > div {
          max-width: 720px;
        }

        .siteFooter {
          border-top: 1px solid #e1e6ef;
          background: #121826;
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
          max-width: 690px;
          margin: 10px 0 0;
          color: #cbd5e1;
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
            gap: 28px;
            padding-top: 42px;
          }

          h1 {
            font-size: 44px;
          }

          .heroImage {
            min-height: 420px;
          }

          .quickCategoryGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .categoryBlock,
          .categoryBlockReverse {
            grid-template-columns: 1fr;
          }

          .categoryBlockReverse .categoryImageWrap,
          .categoryBlockReverse .categoryCopy {
            order: initial;
          }

          .categoryCopy {
            max-width: none;
          }
        }

        @media (max-width: 640px) {
          .siteHeader,
          .heroSection,
          .quickCategorySection,
          .categorySections,
          .todoSection,
          .footerInner {
            width: min(100% - 24px, 1180px);
          }

          .siteHeader {
            min-height: 64px;
            gap: 12px;
          }

          .brand {
            font-size: 16px;
          }

          .brandMark {
            width: 30px;
            height: 30px;
          }

          .headerCta {
            min-height: 36px;
            padding: 0 12px;
          }

          .heroSection {
            padding: 28px 0 42px;
          }

          h1 {
            font-size: 34px;
            line-height: 1.08;
          }

          .heroLead {
            font-size: 14px;
          }

          .heroActions {
            display: grid;
            grid-template-columns: 1fr;
          }

          .primaryAction,
          .secondaryAction {
            width: 100%;
          }

          .heroImage {
            min-height: 310px;
            border-radius: 16px;
          }

          .quickCategorySection {
            margin-top: -18px;
          }

          .quickCategoryGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .categorySections {
            padding: 50px 0 38px;
            gap: 18px;
          }

          .categoryBlock {
            min-height: 0;
            padding: 14px;
            gap: 22px;
            border-radius: 16px;
          }

          .categoryImage {
            min-height: 230px;
            border-radius: 12px;
          }

          .categoryCopy {
            padding: 0 4px 6px;
          }

          .categoryCopy h2,
          .todoSection h2 {
            font-size: 26px;
          }

          .categoryCopy p,
          .todoSection p {
            font-size: 14px;
          }

          .categoryCta,
          .todoCta {
            width: 100%;
          }

          .todoSection {
            grid-template-columns: 1fr;
            margin-bottom: 48px;
            padding: 22px;
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
