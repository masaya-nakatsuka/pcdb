import Link from 'next/link'
import type { Monitor } from '../../server/domain/models/monitor'
import { fetchMonitorList } from '../../server/usecase/fetchMonitorList'
import {
  getMonitorUsageOption,
  getMonitorUsagePath,
  monitorUsageOptions,
  rankMonitors,
} from '../../lib/monitorRecommendation'
import type { MonitorRecommendation, MonitorUsage } from '../../lib/monitorRecommendation'
import TrackableProductLink from '../../components/analytics/TrackableProductLink'
import PcListHeader from '../pc-list/PcListHeader'

const monitorColumns = [
  'おすすめ',
  'モニター',
  'サイズ',
  '解像度',
  'Hz',
  'パネル',
  'USB-C',
  '価格',
  '詳細',
]

const podiumRankStyles = {
  1: {
    label: '1位',
    ribbon: '#f59e0b',
    border: '#f8c46b',
    background: 'linear-gradient(180deg, #fffaf0 0%, #ffffff 46%)',
    minHeight: '430px',
    imageHeight: '200px',
  },
  2: {
    label: '2位',
    ribbon: '#64748b',
    border: '#cbd5e1',
    background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 48%)',
    minHeight: '394px',
    imageHeight: '164px',
  },
  3: {
    label: '3位',
    ribbon: '#b45309',
    border: '#d6b58a',
    background: 'linear-gradient(180deg, #fff7ed 0%, #ffffff 48%)',
    minHeight: '380px',
    imageHeight: '154px',
  },
} as const

function formatPrice(price: number | null): string {
  if (price == null) {
    return '-'
  }

  return `¥${price.toLocaleString('ja-JP')}`
}

function formatSize(size: number | null): string {
  if (size == null) {
    return '-'
  }

  return `${size.toLocaleString('ja-JP')}インチ`
}

function formatRefreshRate(refreshRate: number | null): string {
  if (refreshRate == null) {
    return '-'
  }

  return `${refreshRate.toLocaleString('ja-JP')}Hz`
}

function formatUsbC(hasUsbC: boolean | null, powerDelivery: number | null): string {
  if (!hasUsbC) {
    return '-'
  }

  return powerDelivery ? `USB-C ${powerDelivery}W` : 'USB-C'
}

function TopRankedMonitorPodium({
  monitors,
  usage,
}: {
  monitors: MonitorRecommendation[]
  usage: MonitorUsage
}) {
  if (monitors.length === 0) {
    return null
  }

  const rankedItems = monitors.slice(0, 3).map((item, index) => ({
    item,
    rank: (index + 1) as 1 | 2 | 3,
  }))
  const displayItems = rankedItems.length === 3
    ? [rankedItems[1], rankedItems[0], rankedItems[2]]
    : rankedItems

  return (
    <section style={{ marginBottom: '24px' }}>
      <h3 style={{
        margin: '0 0 14px',
        color: '#111827',
        fontSize: '18px',
        fontWeight: 700,
        textAlign: 'center',
      }}>
        上位3モデル
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        alignItems: 'end',
        justifyContent: 'center',
        gap: '16px',
      }}>
        {displayItems.map(({ item, rank }) => {
          const { monitor, score, highlights } = item
          const productUrl = monitor.af_url || monitor.url
          const rankStyle = podiumRankStyles[rank]

          return (
            <article
              key={monitor.id}
              style={{
                position: 'relative',
                minHeight: rankStyle.minHeight,
                border: `1px solid ${rankStyle.border}`,
                borderRadius: '8px',
                background: rankStyle.background,
                boxShadow: rank === 1
                  ? '0 14px 30px rgba(15, 23, 42, 0.16)'
                  : '0 8px 18px rgba(15, 23, 42, 0.10)',
                overflow: 'hidden',
              }}
            >
              <div style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                zIndex: 1,
                padding: rank === 1 ? '7px 12px' : '6px 10px',
                borderRadius: '999px',
                backgroundColor: rankStyle.ribbon,
                color: 'white',
                fontSize: rank === 1 ? '15px' : '13px',
                fontWeight: 800,
                lineHeight: 1,
                boxShadow: '0 4px 10px rgba(15, 23, 42, 0.18)',
              }}>
                {rankStyle.label}
              </div>
              <div style={{
                height: rankStyle.imageHeight,
                padding: rank === 1 ? '28px 22px 10px' : '28px 18px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.72)',
              }}>
                {monitor.img_url ? (
                  productUrl ? (
                    <TrackableProductLink
                      href={productUrl}
                      productId={monitor.id}
                      productName={`${monitor.brand ?? ''} / ${monitor.name ?? ''}`}
                      productType="monitor"
                      rank={rank}
                      price={monitor.real_price ?? monitor.price}
                      usage={usage}
                      device="monitor"
                      listing="new"
                      linkPosition="monitor_top_image"
                      isAffiliate={Boolean(monitor.af_url)}
                      style={{ display: 'block', width: '100%', height: '100%' }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={monitor.img_url}
                        alt={monitor.name ?? 'モニター画像'}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </TrackableProductLink>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={monitor.img_url}
                      alt={monitor.name ?? 'モニター画像'}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  )
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '6px',
                    backgroundColor: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}>
                    No Image
                  </div>
                )}
              </div>
              <div style={{ padding: '14px 16px 16px' }}>
                <div style={{
                  marginBottom: '8px',
                  color: '#0f172a',
                  fontSize: rank === 1 ? '16px' : '14px',
                  fontWeight: 800,
                  lineHeight: 1.35,
                  minHeight: rank === 1 ? '44px' : '38px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {monitor.brand ?? 'Unknown'} / {monitor.name ?? 'Unnamed Monitor'}
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: '8px',
                  marginBottom: '12px',
                }}>
                  <div style={{
                    padding: '8px',
                    borderRadius: '6px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}>
                    <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 600 }}>スコア</div>
                    <div style={{ color: '#0f172a', fontSize: '15px', fontWeight: 800 }}>
                      {score}点
                    </div>
                  </div>
                  <div style={{
                    padding: '8px',
                    borderRadius: '6px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}>
                    <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 600 }}>価格</div>
                    <div style={{ color: '#dc2626', fontSize: '15px', fontWeight: 800 }}>
                      {formatPrice(monitor.real_price ?? monitor.price)}
                    </div>
                  </div>
                </div>
                <div style={{
                  display: 'grid',
                  gap: '5px',
                  marginBottom: '14px',
                  color: '#334155',
                  fontSize: '12px',
                  lineHeight: 1.45,
                }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {formatSize(monitor.size_inch)} / {monitor.resolution ?? '-'} / {formatRefreshRate(monitor.refresh_rate_hz)}
                  </div>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {highlights.length > 0 ? highlights.join(' / ') : formatUsbC(monitor.has_usb_c, monitor.usb_c_power_delivery_w)}
                  </div>
                </div>
                {productUrl && (
                  <TrackableProductLink
                    href={productUrl}
                    productId={monitor.id}
                    productName={`${monitor.brand ?? ''} / ${monitor.name ?? ''}`}
                    productType="monitor"
                    rank={rank}
                    price={monitor.real_price ?? monitor.price}
                    usage={usage}
                    device="monitor"
                    listing="new"
                    linkPosition="monitor_top_button"
                    isAffiliate={Boolean(monitor.af_url)}
                    className="external-link-mark"
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#ee5a24',
                      color: 'white',
                      textAlign: 'center',
                      textDecoration: 'none',
                      fontSize: '13px',
                      fontWeight: 800,
                    }}
                  >
                    詳細を見る
                  </TrackableProductLink>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

interface MonitorListViewProps {
  usage: MonitorUsage
}

export default async function MonitorListView({ usage }: MonitorListViewProps) {
  const usageOption = getMonitorUsageOption(usage)
  let monitors: Monitor[] = []

  try {
    monitors = await fetchMonitorList()
  } catch (error) {
    console.error('Failed to fetch monitors:', error)
  }

  const rankedMonitors = rankMonitors(monitors, usage)

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      color: '#1f2937',
    }}>
      <PcListHeader />

      <main id="monitor-list-results">
        <section style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '28px 16px 0',
          textAlign: 'center',
        }}>
          <h1 style={{
            margin: '0 0 8px',
            fontSize: '28px',
            color: '#0f172a',
            lineHeight: 1.3,
          }}>
            モニター比較
          </h1>
          <p style={{
            margin: 0,
            color: '#475569',
            fontSize: '14px',
            lineHeight: 1.8,
          }}>
            {usageOption.description}
          </p>
        </section>

        <section style={{
          maxWidth: '1200px',
          margin: '28px auto 0',
          padding: '0 16px',
        }}>
          <TopRankedMonitorPodium monitors={rankedMonitors} usage={usage} />

          <section style={{
            marginBottom: '28px',
            padding: '18px',
            border: '1px solid #dbe4ef',
            borderRadius: '8px',
            backgroundColor: '#f8fafc',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
          }}>
            <div style={{ marginBottom: '18px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '18px', color: '#0f172a', margin: 0, fontWeight: 800 }}>
                ランキング条件
              </h2>
            </div>
            <div>
              <h3 style={{ fontSize: '14px', color: '#334155', margin: '0 0 12px', textAlign: 'left' }}>
                用途を選択
              </h3>
              <nav aria-label="モニター用途" style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-start',
                flexWrap: 'wrap',
              }}>
                {monitorUsageOptions.map((option) => {
                  const isActive = option.value === usage

                  return (
                    <Link
                      key={option.value}
                      href={getMonitorUsagePath(option.value)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '42px',
                        padding: '0 18px',
                        borderRadius: '8px',
                        border: 'none',
                        background: isActive
                          ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)'
                          : 'linear-gradient(135deg, rgba(255, 107, 107, 0.50) 0%, rgba(238, 90, 36, 0.50) 100%)',
                        color: 'white',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        boxShadow: isActive ? '0 8px 18px rgba(238, 90, 36, 0.18)' : 'none',
                      }}
                    >
                      {option.label}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </section>

          <div style={{
            overflowX: 'auto',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            boxShadow: '0 18px 30px rgba(148, 163, 184, 0.12)',
          }}>
            <table style={{
              width: '100%',
              minWidth: '860px',
              borderCollapse: 'collapse',
            }}>
              <thead>
                <tr>
                  {monitorColumns.map((column) => (
                    <th key={column} style={{
                      padding: '12px',
                      borderBottom: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      color: '#334155',
                      fontSize: '13px',
                      fontWeight: 900,
                      textAlign: 'left',
                      whiteSpace: 'nowrap',
                    }}>
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monitors.length === 0 ? (
                  <tr>
                    <td colSpan={monitorColumns.length} style={{
                      padding: '40px 16px',
                      color: '#64748b',
                      fontSize: '14px',
                      textAlign: 'center',
                      borderBottom: '1px solid #f1f5f9',
                    }}>
                      モニターDB接続後、ここに商品一覧を表示します。
                    </td>
                  </tr>
                ) : rankedMonitors.map(({ monitor, score, highlights }, index) => {
                  const productUrl = monitor.af_url || monitor.url

                  return (
                    <tr key={monitor.id}>
                      <td style={{
                        padding: '12px',
                        borderBottom: '1px solid #f1f5f9',
                        whiteSpace: 'nowrap',
                      }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'baseline',
                          gap: '4px',
                          color: '#0f172a',
                          fontWeight: 900,
                        }}>
                          <span style={{ fontSize: '14px' }}>{score}点</span>
                        </div>
                      </td>
                      <td style={{
                        padding: '12px',
                        borderBottom: '1px solid #f1f5f9',
                        minWidth: '280px',
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                        }}>
                          {monitor.img_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={monitor.img_url}
                              alt={monitor.name ?? 'モニター画像'}
                              style={{
                                width: '56px',
                                height: '56px',
                                objectFit: 'contain',
                                flex: '0 0 auto',
                              }}
                            />
                          ) : null}
                          <div>
                            <div style={{
                              color: '#64748b',
                              fontSize: '12px',
                              fontWeight: 700,
                              marginBottom: '3px',
                            }}>
                              {monitor.brand ?? 'Unknown'}
                            </div>
                            {productUrl ? (
                              <TrackableProductLink
                                href={productUrl}
                                productId={monitor.id}
                                productName={`${monitor.brand ?? ''} / ${monitor.name ?? ''}`}
                                productType="monitor"
                                rank={index + 1}
                                price={monitor.real_price ?? monitor.price}
                                usage={usage}
                                device="monitor"
                                listing="new"
                                linkPosition="monitor_table_name"
                                isAffiliate={Boolean(monitor.af_url)}
                                className="external-link-mark"
                                style={{
                                color: '#2563eb',
                                fontWeight: 800,
                                textDecoration: 'underline',
                                textUnderlineOffset: '2px',
                                lineHeight: 1.45,
                              }}>
                                {monitor.name}
                              </TrackableProductLink>
                            ) : (
                              <span style={{
                                color: '#0f172a',
                                fontWeight: 800,
                                lineHeight: 1.45,
                              }}>
                                {monitor.name}
                              </span>
                            )}
                            {highlights.length > 0 ? (
                              <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '5px',
                                marginTop: '7px',
                              }}>
                                {highlights.map((highlight) => (
                                  <span key={highlight} style={{
                                    display: 'inline-flex',
                                    padding: '3px 6px',
                                    borderRadius: '999px',
                                    backgroundColor: '#f1f5f9',
                                    color: '#475569',
                                    fontSize: '11px',
                                    fontWeight: 800,
                                  }}>
                                    {highlight}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                        {formatSize(monitor.size_inch)}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                        {monitor.resolution ?? '-'}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                        {formatRefreshRate(monitor.refresh_rate_hz)}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                        {monitor.panel_type ?? '-'}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                        {formatUsbC(monitor.has_usb_c, monitor.usb_c_power_delivery_w)}
                      </td>
                      <td style={{
                        padding: '12px',
                        borderBottom: '1px solid #f1f5f9',
                        color: '#0f172a',
                        fontWeight: 900,
                        whiteSpace: 'nowrap',
                      }}>
                        {formatPrice(monitor.real_price ?? monitor.price)}
                      </td>
                      <td style={{
                        padding: '12px',
                        borderBottom: '1px solid #f1f5f9',
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                      }}>
                        {productUrl ? (
                          <TrackableProductLink
                            href={productUrl}
                            productId={monitor.id}
                            productName={`${monitor.brand ?? ''} / ${monitor.name ?? ''}`}
                            productType="monitor"
                            rank={index + 1}
                            price={monitor.real_price ?? monitor.price}
                            usage={usage}
                            device="monitor"
                            listing="new"
                            linkPosition="monitor_table_button"
                            isAffiliate={Boolean(monitor.af_url)}
                            className="external-link-mark"
                            style={{
                              display: 'inline-block',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              backgroundColor: '#ee5a24',
                              color: 'white',
                              textDecoration: 'none',
                              fontSize: '12px',
                              fontWeight: 800,
                            }}
                          >
                            詳細を見る
                          </TrackableProductLink>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '12px' }}>-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '32px 20px',
        marginTop: '48px',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '14px',
          lineHeight: 1.6,
        }}>
          <p style={{ margin: '0 0 8px' }}>
            Amazonのアソシエイトとして、当メディアは適格販売により収入を得ています。
          </p>
          <p style={{ margin: 0 }}>
            このサイトはアフィリエイト広告（Amazonアソシエイト含む）を掲載しています。
          </p>
        </div>
      </footer>
    </div>
  )
}
