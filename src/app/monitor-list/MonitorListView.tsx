import Link from 'next/link'
import type { Monitor } from '../../server/domain/models/monitor'
import { fetchMonitorList } from '../../server/usecase/fetchMonitorList'
import {
  getMonitorUsageOption,
  getMonitorUsagePath,
  MonitorUsage,
  monitorUsageOptions,
  rankMonitors,
} from '../../lib/monitorRecommendation'
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
]

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
          <nav aria-label="モニター用途" style={{
            marginTop: '18px',
            display: 'flex',
            justifyContent: 'center',
            gap: '2px',
            flexWrap: 'wrap',
            padding: '4px',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            backgroundColor: 'rgba(248, 250, 252, 0.84)',
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
                    minHeight: '34px',
                    padding: '0 11px',
                    borderRadius: '7px',
                    backgroundColor: isActive ? '#ffffff' : 'transparent',
                    color: isActive ? '#2563eb' : '#475569',
                    boxShadow: isActive ? '0 1px 3px rgba(15, 23, 42, 0.12)' : 'none',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {option.label}
                </Link>
              )
            })}
          </nav>
        </section>

        <section style={{
          maxWidth: '1200px',
          margin: '28px auto 0',
          padding: '0 16px',
        }}>
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
                ) : rankedMonitors.map(({ monitor, score, highlights }) => {
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
                          <span style={{ fontSize: '18px' }}>{score}</span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>/100</span>
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
                              <a href={productUrl} target="_blank" rel="noopener noreferrer" className="external-link-mark" style={{
                                color: '#0f172a',
                                fontWeight: 800,
                                textDecoration: 'none',
                                lineHeight: 1.45,
                              }}>
                                {monitor.name}
                              </a>
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
