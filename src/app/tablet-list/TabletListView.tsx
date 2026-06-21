'use client'

import { useEffect, useState } from 'react'
import type { Tablet } from '../../server/domain/models/tablet'
import { rankTablets, type TabletRecommendation } from '../../lib/tabletRecommendation'
import TrackableProductLink from '../../components/analytics/TrackableProductLink'
import PcListHeader from '../pc-list/PcListHeader'

const tabletColumns = [
  'おすすめ',
  'タブレット',
  'OS',
  'SoC',
  'RAM',
  'ROM',
  '画面',
  '駆動時間',
  '価格',
  '詳細',
]

const podiumRankStyles = {
  1: {
    label: '1位',
    ribbon: '#f59e0b',
    border: '#f8c46b',
    background: 'linear-gradient(180deg, #fffaf0 0%, #ffffff 46%)',
    minHeight: '420px',
    imageHeight: '190px',
  },
  2: {
    label: '2位',
    ribbon: '#64748b',
    border: '#cbd5e1',
    background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 48%)',
    minHeight: '386px',
    imageHeight: '160px',
  },
  3: {
    label: '3位',
    ribbon: '#b45309',
    border: '#d6b58a',
    background: 'linear-gradient(180deg, #fff7ed 0%, #ffffff 48%)',
    minHeight: '372px',
    imageHeight: '150px',
  },
} as const

function formatPrice(price: number | null): string {
  if (price == null) {
    return '-'
  }

  return `¥${price.toLocaleString('ja-JP')}`
}

function formatNumber(value: number | null, suffix: string): string {
  if (value == null) {
    return '-'
  }

  return `${value.toLocaleString('ja-JP')}${suffix}`
}

function formatDisplay(tablet: Tablet): string {
  const parts = [
    tablet.display_size_inch ? `${tablet.display_size_inch.toLocaleString('ja-JP')}インチ` : null,
    tablet.resolution,
    tablet.refresh_rate_hz ? `${tablet.refresh_rate_hz.toLocaleString('ja-JP')}Hz` : null,
  ].filter(Boolean)

  return parts.length > 0 ? parts.join(' / ') : '-'
}

function formatOs(tablet: Tablet): string {
  const osLabel = tablet.os_family === 'ipad'
    ? 'iPadOS'
    : tablet.os_family === 'android'
      ? 'Android'
      : null

  return [osLabel, tablet.os_version].filter(Boolean).join(' ') || '-'
}

function formatBattery(tablet: Tablet): string {
  if (tablet.battery_life_hours != null) {
    return `最大${tablet.battery_life_hours.toLocaleString('ja-JP')}時間`
  }

  if (tablet.battery_capacity_mah != null) {
    return `${tablet.battery_capacity_mah.toLocaleString('ja-JP')}mAh`
  }

  return '-'
}

function ProductImage({
  tablet,
  rank,
  linkPosition,
}: {
  tablet: Tablet
  rank?: number
  linkPosition: string
}) {
  const productUrl = tablet.af_url || tablet.url

  if (!tablet.img_url) {
    return (
      <div className="tablet-list__no-image">
        No Image
      </div>
    )
  }

  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={tablet.img_url}
      alt={tablet.name ?? 'タブレット画像'}
      className="tablet-list__image"
    />
  )

  if (!productUrl) {
    return image
  }

  return (
    <TrackableProductLink
      href={productUrl}
      productId={tablet.id}
      productName={`${tablet.brand ?? ''} / ${tablet.name ?? ''}`}
      productType="tablet"
      rank={rank}
      price={tablet.real_price ?? tablet.price}
      device="tablet"
      listing="new"
      linkPosition={linkPosition}
      isAffiliate={Boolean(tablet.af_url)}
      className="tablet-list__image-link"
    >
      {image}
    </TrackableProductLink>
  )
}

function TopRankedTabletPodium({ tablets }: { tablets: TabletRecommendation[] }) {
  if (tablets.length === 0) {
    return null
  }

  const rankedItems = tablets.slice(0, 3).map((item, index) => ({
    item,
    rank: (index + 1) as 1 | 2 | 3,
  }))
  const displayItems = rankedItems.length === 3
    ? [rankedItems[1], rankedItems[0], rankedItems[2]]
    : rankedItems

  return (
    <section className="tablet-list__podium" aria-label="上位タブレット">
      <h2 className="tablet-list__section-title">上位3モデル</h2>
      <div className="tablet-list__podium-grid">
        {displayItems.map(({ item, rank }) => {
          const { tablet, score, highlights } = item
          const productUrl = tablet.af_url || tablet.url
          const rankStyle = podiumRankStyles[rank]

          return (
            <article
              key={tablet.id}
              className="tablet-list__podium-card"
              style={{
                minHeight: rankStyle.minHeight,
                borderColor: rankStyle.border,
                background: rankStyle.background,
                boxShadow: rank === 1
                  ? '0 14px 30px rgba(15, 23, 42, 0.16)'
                  : '0 8px 18px rgba(15, 23, 42, 0.10)',
              }}
            >
              <div className="tablet-list__rank" style={{ backgroundColor: rankStyle.ribbon }}>
                {rankStyle.label}
              </div>
              <div className="tablet-list__podium-image" style={{ height: rankStyle.imageHeight }}>
                <ProductImage tablet={tablet} rank={rank} linkPosition="tablet_top_image" />
              </div>
              <div className="tablet-list__podium-body">
                <p className="tablet-list__brand">{tablet.brand ?? '-'}</p>
                <h3 className="tablet-list__product-name">
                  {productUrl ? (
                    <TrackableProductLink
                      href={productUrl}
                      productId={tablet.id}
                      productName={`${tablet.brand ?? ''} / ${tablet.name ?? ''}`}
                      productType="tablet"
                      rank={rank}
                      price={tablet.real_price ?? tablet.price}
                      device="tablet"
                      listing="new"
                      linkPosition="tablet_top_name"
                      isAffiliate={Boolean(tablet.af_url)}
                      className="tablet-list__name-link"
                    >
                      {tablet.name ?? '名称不明'}
                    </TrackableProductLink>
                  ) : (
                    tablet.name ?? '名称不明'
                  )}
                </h3>
                <div className="tablet-list__score">
                  <span>おすすめ</span>
                  <strong>{score}</strong>
                </div>
                <div className="tablet-list__chips">
                  {highlights.map((highlight) => (
                    <span key={highlight}>{highlight}</span>
                  ))}
                </div>
                <dl className="tablet-list__mini-specs">
                  <div>
                    <dt>OS</dt>
                    <dd>{formatOs(tablet)}</dd>
                  </div>
                  <div>
                    <dt>価格</dt>
                    <dd>{formatPrice(tablet.real_price ?? tablet.price)}</dd>
                  </div>
                </dl>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function TabletTable({ rankedTablets }: { rankedTablets: TabletRecommendation[] }) {
  return (
    <section className="tablet-list__table-section">
      <h2 className="tablet-list__section-title">Android/iPad 比較表</h2>
      <div className="tablet-list__table-wrap">
        <table className="tablet-list__table">
          <thead>
            <tr>
              {tabletColumns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rankedTablets.length === 0 ? (
              <tr>
                <td colSpan={tabletColumns.length} className="tablet-list__empty">
                  タブレットDB接続後、ここにAndroidタブレットとiPadの商品一覧を表示します。
                </td>
              </tr>
            ) : rankedTablets.map(({ tablet, score }, index) => {
              const productUrl = tablet.af_url || tablet.url

              return (
                <tr key={tablet.id}>
                  <td>
                    <span className="tablet-list__table-rank">{index + 1}位</span>
                    <span className="tablet-list__table-score">{score}</span>
                  </td>
                  <td className="tablet-list__product-cell">
                    <div className="tablet-list__table-product">
                      <div className="tablet-list__thumb">
                        <ProductImage tablet={tablet} rank={index + 1} linkPosition="tablet_table_image" />
                      </div>
                      <div>
                        <p className="tablet-list__brand">{tablet.brand ?? '-'}</p>
                        <p className="tablet-list__table-name">
                          {productUrl ? (
                            <TrackableProductLink
                              href={productUrl}
                              productId={tablet.id}
                              productName={`${tablet.brand ?? ''} / ${tablet.name ?? ''}`}
                              productType="tablet"
                              rank={index + 1}
                              price={tablet.real_price ?? tablet.price}
                              device="tablet"
                              listing="new"
                              linkPosition="tablet_table_name"
                              isAffiliate={Boolean(tablet.af_url)}
                              className="tablet-list__name-link"
                            >
                              {tablet.name ?? '名称不明'}
                            </TrackableProductLink>
                          ) : (
                            tablet.name ?? '名称不明'
                          )}
                        </p>
                        {tablet.series ? (
                          <p className="tablet-list__series">{tablet.series}</p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td>{formatOs(tablet)}</td>
                  <td>{tablet.soc ?? '-'}</td>
                  <td>{formatNumber(tablet.ram_gb, 'GB')}</td>
                  <td>{formatNumber(tablet.rom_gb, 'GB')}</td>
                  <td>{formatDisplay(tablet)}</td>
                  <td>{formatBattery(tablet)}</td>
                  <td>{formatPrice(tablet.real_price ?? tablet.price)}</td>
                  <td>
                    {productUrl ? (
                      <TrackableProductLink
                        href={productUrl}
                        productId={tablet.id}
                        productName={`${tablet.brand ?? ''} / ${tablet.name ?? ''}`}
                        productType="tablet"
                        rank={index + 1}
                        price={tablet.real_price ?? tablet.price}
                        device="tablet"
                        listing="new"
                        linkPosition="tablet_table_detail"
                        isAffiliate={Boolean(tablet.af_url)}
                        className="tablet-list__detail-link"
                      >
                        Amazon
                      </TrackableProductLink>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default function TabletListView() {
  const [tablets, setTablets] = useState<Tablet[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const rankedTablets = rankTablets(tablets)

  useEffect(() => {
    setIsLoading(true)
    setErrorMessage(null)

    fetch('/api/tablet-list')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('タブレット一覧の取得に失敗しました。')
        }

        const payload: unknown = await response.json()
        if (!Array.isArray(payload)) {
          throw new Error('タブレット一覧の形式が正しくありません。')
        }

        setTablets(payload as Tablet[])
      })
      .catch((error) => {
        setErrorMessage(error instanceof Error ? error.message : 'タブレット一覧の取得に失敗しました。')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  return (
    <div className="tablet-list">
      <PcListHeader />

      <main>
        <section className="tablet-list__hero">
          <div className="tablet-list__hero-inner">
            <h1>タブレット比較</h1>
            <p>
              AndroidタブレットとiPadだけを対象に、OS、SoC、RAM、ROM、画面、駆動時間、価格を比較します。
            </p>
          </div>
        </section>

        {isLoading ? (
          <div className="tablet-list__loading">
            タブレットデータを読み込み中...
          </div>
        ) : (
          <>
            {errorMessage ? (
              <div className="tablet-list__error">
                {errorMessage}
              </div>
            ) : null}

            <div className="tablet-list__content">
              <TopRankedTabletPodium tablets={rankedTablets} />
              <TabletTable rankedTablets={rankedTablets} />
            </div>
          </>
        )}
      </main>

      <footer className="tablet-list__footer">
        <p>Amazonのアソシエイトとして、当メディアは適格販売により収入を得ています。</p>
        <p>このサイトはアフィリエイト広告（Amazonアソシエイト含む）を掲載しています。</p>
      </footer>

      <style jsx global>{`
        .tablet-list {
          min-height: 100vh;
          background: #ffffff;
          color: #1f2937;
        }

        .tablet-list * {
          box-sizing: border-box;
        }

        .tablet-list__hero {
          border-bottom: 1px solid #e2e8f0;
          background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
        }

        .tablet-list__hero-inner {
          max-width: 960px;
          margin: 0 auto;
          padding: 28px 16px 24px;
          text-align: center;
        }

        .tablet-list__hero h1 {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: 28px;
          line-height: 1.3;
        }

        .tablet-list__hero p {
          margin: 0;
          color: #475569;
          font-size: 14px;
          line-height: 1.8;
        }

        .tablet-list__content {
          max-width: 1240px;
          margin: 0 auto;
          padding: 28px 16px 0;
        }

        .tablet-list__section-title {
          margin: 0 0 14px;
          color: #111827;
          font-size: 18px;
          font-weight: 800;
          text-align: center;
        }

        .tablet-list__podium {
          margin-bottom: 28px;
        }

        .tablet-list__podium-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          align-items: end;
          justify-content: center;
          gap: 16px;
        }

        .tablet-list__podium-card {
          position: relative;
          border: 1px solid;
          border-radius: 8px;
          overflow: hidden;
        }

        .tablet-list__rank {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 1;
          padding: 7px 12px;
          border-radius: 999px;
          color: white;
          font-size: 14px;
          font-weight: 800;
          line-height: 1;
          box-shadow: 0 4px 10px rgba(15, 23, 42, 0.18);
        }

        .tablet-list__podium-image {
          padding: 28px 20px 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.72);
        }

        .tablet-list__image-link {
          display: block;
          width: 100%;
          height: 100%;
        }

        .tablet-list__image {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .tablet-list__no-image {
          width: 100%;
          height: 100%;
          min-height: 96px;
          border-radius: 6px;
          background: #f1f5f9;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
        }

        .tablet-list__podium-body {
          padding: 14px 16px 16px;
        }

        .tablet-list__brand,
        .tablet-list__series {
          margin: 0;
          color: #64748b;
          font-size: 12px;
          font-weight: 800;
          line-height: 1.4;
        }

        .tablet-list__product-name {
          margin: 4px 0 10px;
          color: #0f172a;
          font-size: 15px;
          font-weight: 900;
          line-height: 1.35;
        }

        .tablet-list__name-link {
          color: inherit;
          text-decoration: none;
        }

        .tablet-list__name-link:hover {
          color: #2563eb;
          text-decoration: underline;
        }

        .tablet-list__score {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 12px;
          margin: 0 0 10px;
          padding: 10px 12px;
          border-radius: 8px;
          background: #eff6ff;
          color: #1d4ed8;
        }

        .tablet-list__score span {
          font-size: 12px;
          font-weight: 800;
        }

        .tablet-list__score strong {
          font-size: 24px;
          line-height: 1;
        }

        .tablet-list__chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }

        .tablet-list__chips span {
          padding: 5px 8px;
          border-radius: 999px;
          background: #f1f5f9;
          color: #334155;
          font-size: 12px;
          font-weight: 800;
        }

        .tablet-list__mini-specs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin: 0;
        }

        .tablet-list__mini-specs div {
          min-width: 0;
          padding: 8px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }

        .tablet-list__mini-specs dt {
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
        }

        .tablet-list__mini-specs dd {
          margin: 3px 0 0;
          color: #0f172a;
          font-size: 13px;
          font-weight: 900;
        }

        .tablet-list__table-section {
          margin-bottom: 40px;
        }

        .tablet-list__table-wrap {
          overflow-x: auto;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #ffffff;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
        }

        .tablet-list__table {
          width: 100%;
          min-width: 1120px;
          border-collapse: collapse;
          font-size: 13px;
        }

        .tablet-list__table th {
          position: sticky;
          top: 0;
          z-index: 1;
          padding: 12px 10px;
          background: #f8fafc;
          color: #334155;
          border-bottom: 1px solid #e2e8f0;
          font-size: 12px;
          font-weight: 900;
          text-align: left;
          white-space: nowrap;
        }

        .tablet-list__table td {
          padding: 12px 10px;
          border-bottom: 1px solid #eef2f7;
          color: #1f2937;
          vertical-align: middle;
        }

        .tablet-list__table tr:last-child td {
          border-bottom: 0;
        }

        .tablet-list__table-rank,
        .tablet-list__table-score {
          display: block;
          white-space: nowrap;
        }

        .tablet-list__table-rank {
          color: #64748b;
          font-size: 12px;
          font-weight: 900;
        }

        .tablet-list__table-score {
          margin-top: 2px;
          color: #2563eb;
          font-size: 18px;
          font-weight: 900;
        }

        .tablet-list__product-cell {
          min-width: 260px;
        }

        .tablet-list__table-product {
          display: grid;
          grid-template-columns: 76px minmax(0, 1fr);
          align-items: center;
          gap: 12px;
        }

        .tablet-list__thumb {
          width: 76px;
          height: 76px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tablet-list__table-name {
          margin: 3px 0;
          color: #0f172a;
          font-size: 13px;
          font-weight: 900;
          line-height: 1.45;
        }

        .tablet-list__detail-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 32px;
          padding: 0 12px;
          border-radius: 7px;
          background: #2563eb;
          color: #ffffff;
          font-size: 12px;
          font-weight: 900;
          text-decoration: none;
          white-space: nowrap;
        }

        .tablet-list__detail-link:hover {
          background: #1d4ed8;
        }

        .tablet-list__empty,
        .tablet-list__loading,
        .tablet-list__error {
          padding: 28px 20px;
          color: #64748b;
          text-align: center;
          font-size: 14px;
          line-height: 1.8;
        }

        .tablet-list__error {
          max-width: 960px;
          margin: 24px auto 0;
          border: 1px solid #fecaca;
          border-radius: 8px;
          background: #fef2f2;
          color: #b91c1c;
        }

        .tablet-list__loading {
          max-width: 960px;
          margin: 32px auto 0;
        }

        .tablet-list__footer {
          border-top: 1px solid #e2e8f0;
          padding: 32px 20px;
          margin-top: 48px;
          color: #64748b;
          font-size: 14px;
          line-height: 1.6;
          text-align: center;
        }

        .tablet-list__footer p {
          margin: 0 0 8px;
        }

        .tablet-list__footer p:last-child {
          margin-bottom: 0;
        }

        @media (max-width: 720px) {
          .tablet-list__hero-inner {
            padding: 24px 16px 20px;
          }

          .tablet-list__hero h1 {
            font-size: 24px;
          }

          .tablet-list__content {
            padding: 24px 12px 0;
          }

          .tablet-list__podium-grid {
            grid-template-columns: 1fr;
          }

          .tablet-list__mini-specs {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
