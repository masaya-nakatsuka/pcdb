'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/pc-list/cafe', label: 'PCランキング' },
  { href: '/pc-list/cost-performance', label: 'コスパPC' },
  { href: '/blog', label: 'ブログ' },
]

export default function PcListHeader() {
  const pathname = usePathname()

  const isActiveNav = (href: string) => {
    if (href === '/pc-list/cafe') {
      return pathname === '/pc-list' || (pathname.startsWith('/pc-list') && pathname !== '/pc-list/cost-performance')
    }

    return pathname === href
  }

  return (
    <header className="pc-list-header">
      <div className="pc-list-header__inner">
        <Link href="/" className="pc-list-header__brand" aria-label="Specsy Hub ホーム">
          <span className="pc-list-header__logo">Specsy</span>
          <span className="pc-list-header__tagline">PC比較・ランキング</span>
        </Link>

        <nav className="pc-list-header__nav" aria-label="主要ナビゲーション">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`pc-list-header__nav-link${isActiveNav(item.href) ? ' pc-list-header__nav-link--active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/" className="pc-list-header__home-link">
            ホーム
          </Link>
        </nav>
      </div>

      <style jsx>{`
        .pc-list-header {
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          color: #0f172a;
        }

        .pc-list-header__inner {
          max-width: 1280px;
          min-height: 64px;
          margin: 0 auto;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .pc-list-header__brand {
          display: inline-flex;
          align-items: baseline;
          gap: 10px;
          min-width: 0;
          color: #0f172a;
          text-decoration: none;
          white-space: nowrap;
        }

        .pc-list-header__logo {
          font-size: 20px;
          font-weight: 900;
          line-height: 1;
        }

        .pc-list-header__tagline {
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
        }

        .pc-list-header__nav {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 4px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .pc-list-header__nav::-webkit-scrollbar {
          display: none;
        }

        .pc-list-header__nav-link,
        .pc-list-header__home-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 36px;
          padding: 0 12px;
          color: #334155;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
          transition: background-color 0.16s ease, color 0.16s ease;
        }

        .pc-list-header__nav-link:hover,
        .pc-list-header__home-link:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .pc-list-header__nav-link--active {
          color: #2563eb;
          background: #eff6ff;
        }

        .pc-list-header__home-link {
          color: #64748b;
        }

        @media (max-width: 640px) {
          .pc-list-header__inner {
            min-height: auto;
            padding: 12px 16px 10px;
            align-items: flex-start;
            flex-direction: column;
            gap: 10px;
          }

          .pc-list-header__brand {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .pc-list-header__tagline {
            font-size: 11px;
          }

          .pc-list-header__nav {
            width: 100%;
            justify-content: flex-start;
            padding-bottom: 2px;
          }

          .pc-list-header__nav-link,
          .pc-list-header__home-link {
            min-height: 34px;
            padding: 0 10px;
            font-size: 13px;
          }
        }
      `}</style>
    </header>
  )
}
