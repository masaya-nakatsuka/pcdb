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
      <header style={{
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
      }}>
        <div style={{
          maxWidth: '1200px',
          minHeight: '64px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}>
          <Link href="/" style={{
            color: '#0f172a',
            textDecoration: 'none',
            fontWeight: 900,
            fontSize: '18px',
            whiteSpace: 'nowrap',
          }}>
            Specsy Hub
          </Link>
          <Link href="/pc-list/cafe" style={{
            color: '#475569',
            textDecoration: 'none',
            fontWeight: 800,
            fontSize: '13px',
            whiteSpace: 'nowrap',
          }}>
            PCランキング
          </Link>
        </div>
      </header>

      <main>
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
            gap: '8px',
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
                    minHeight: '36px',
                    padding: '8px 12px',
                    borderRadius: '999px',
                    border: isActive ? '1px solid #0f172a' : '1px solid #cbd5e1',
                    backgroundColor: isActive ? '#0f172a' : '#ffffff',
                    color: isActive ? '#ffffff' : '#334155',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: 900,
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
    </div>
  )
}
