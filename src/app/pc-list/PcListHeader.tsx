'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/pc-check', label: '購入診断' },
  { href: '/pc-list/cafe', label: 'ノートPC（新品）' },
  { href: '/pc-list/used', label: 'ノートPC（中古）' },
  { href: '/tablet-list', label: 'タブレット' },
  { href: '/pc-list/desktop', label: 'デスクトップ' },
  { href: '/pc-list/mini-pc', label: 'ミニPC' },
  { href: '/monitor-list', label: 'モニター' },
]

export default function PcListHeader() {
  const pathname = usePathname()

  const isActiveNav = (href: string) => {
    if (href === '/pc-list/cafe') {
      return (
        pathname === '/pc-list' ||
        (
          pathname.startsWith('/pc-list') &&
          pathname !== '/pc-list/used' &&
          pathname !== '/pc-list/desktop' &&
          pathname !== '/pc-list/mini-pc'
        )
      )
    }

    if (href === '/monitor-list') {
      return pathname === '/monitor-list' || pathname.startsWith('/monitor-list/')
    }

    if (href === '/tablet-list') {
      return pathname === '/tablet-list' || pathname.startsWith('/tablet-list/')
    }

    return pathname === href
  }

  return (
    <header className="pc-list-header">
      <div className="pc-list-header__inner">
        <Link href="/" className="pc-list-header__brand" aria-label="Specsy Hub ホーム">
          <span className="pc-list-header__mark" aria-hidden="true">
            <span className="pc-list-header__mark-bar pc-list-header__mark-bar--high" />
            <span className="pc-list-header__mark-bar pc-list-header__mark-bar--mid" />
            <span className="pc-list-header__mark-bar pc-list-header__mark-bar--low" />
          </span>
          <span className="pc-list-header__brand-copy">
            <span className="pc-list-header__logo">Specsy Hub</span>
            <span className="pc-list-header__tagline">Amazon PCを用途別に比較</span>
          </span>
        </Link>

        <div className="pc-list-header__navigation">
          <nav className="pc-list-header__nav" aria-label="商品一覧と購入診断">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`pc-list-header__nav-link${isActiveNav(item.href) ? ' pc-list-header__nav-link--active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <style jsx global>{`
        .pc-list-header {
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
          border-bottom: 1px solid #e2e8f0;
          color: #0f172a;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
        }

        .pc-list-header * {
          box-sizing: border-box;
        }

        .pc-list-header__inner {
          max-width: 1280px;
          min-height: 72px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 28px;
        }

        .pc-list-header__brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          color: #0f172a;
          text-decoration: none;
          white-space: nowrap;
        }

        .pc-list-header__mark {
          width: 40px;
          height: 40px;
          display: inline-flex;
          align-items: flex-end;
          justify-content: center;
          gap: 3px;
          padding: 9px 8px;
          border-radius: 10px;
          background:
            linear-gradient(135deg, #2563eb 0%, #14b8a6 100%);
          box-shadow: 0 12px 22px rgba(37, 99, 235, 0.22);
          flex: 0 0 auto;
        }

        .pc-list-header__mark-bar {
          width: 5px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.95);
        }

        .pc-list-header__mark-bar--high {
          height: 20px;
        }

        .pc-list-header__mark-bar--mid {
          height: 14px;
          opacity: 0.88;
        }

        .pc-list-header__mark-bar--low {
          height: 9px;
          opacity: 0.76;
        }

        .pc-list-header__brand-copy {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }

        .pc-list-header__logo {
          font-size: 19px;
          font-weight: 900;
          line-height: 1;
        }

        .pc-list-header__tagline {
          color: #475569;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.2;
        }

        .pc-list-header__navigation {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 14px;
          min-width: 0;
          flex: 1;
        }

        .pc-list-header__nav {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 2px;
          min-width: 0;
          padding: 4px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.72);
          overflow-x: auto;
          scrollbar-width: none;
        }

        .pc-list-header__nav::-webkit-scrollbar {
          display: none;
        }

        .pc-list-header__nav-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 34px;
          padding: 0 11px;
          color: #475569;
          border-radius: 7px;
          font-size: 13px;
          font-weight: 800;
          text-decoration: none;
          white-space: nowrap;
          transition: background-color 0.16s ease, color 0.16s ease, box-shadow 0.16s ease;
        }

        .pc-list-header__nav-link:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .pc-list-header__nav-link--active {
          color: #2563eb;
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.12);
        }

        @media (max-width: 980px) {
          .pc-list-header__inner {
            min-height: auto;
            padding: 10px 16px;
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }

          .pc-list-header__navigation {
            width: 100%;
            justify-content: space-between;
            gap: 12px;
          }

          .pc-list-header__nav {
            justify-content: flex-start;
            flex: 1;
          }
        }

        @media (max-width: 640px) {
          .pc-list-header__navigation {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }

          .pc-list-header__nav {
            width: 100%;
            justify-content: flex-start;
          }

          .pc-list-header__nav-link {
            padding: 0 9px;
            font-size: 13px;
          }

          .pc-list-header__tagline {
            font-size: 11px;
          }
        }
      `}</style>
    </header>
  )
}
