'use client'

import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'

interface StoredProductClick {
  id: string
  clicked_at: string
  clicked_day: string
  clicked_minute: string
  product_id: string
  product_name?: string
  product_type: string
  source_page?: string
  usage?: string
  device?: string
  listing?: string
  outbound_domain?: string
  price?: number
  rank?: number
  link_position?: string
  is_affiliate?: boolean
  destination_url?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
}

interface ProductClickStats {
  product_key: string
  product_id: string
  product_name: string
  product_type: string
  count: number
  price?: number
  destination_url?: string
  outbound_domain?: string
  last_seen_at?: string
}

interface ClickAnalyticsSnapshot {
  total_clicks: number
  last_updated_at: string
  recent_clicks: StoredProductClick[]
  product_stats: ProductClickStats[]
  minute_series: Array<{ minute: string; count: number }>
  day_series: Array<{ day: string; count: number }>
}

function formatTime(value?: string): string {
  if (!value) {
    return '-'
  }

  return new Date(value).toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatPrice(value?: number): string {
  if (!value) {
    return '-'
  }

  return `¥${value.toLocaleString('ja-JP')}`
}

function shortLabel(value: string): string {
  return value.replace(/^\d{4}-/, '').replace('T', ' ')
}

function GraphBars({
  title,
  series,
  compact = false,
}: {
  title: string
  series: Array<{ label: string; count: number }>
  compact?: boolean
}) {
  const max = Math.max(1, ...series.map((item) => item.count))

  return (
    <section className="analyticsPanel">
      <div className="panelHeader">
        <h2>{title}</h2>
        <span>{series.reduce((sum, item) => sum + item.count, 0)} clicks</span>
      </div>
      <div className={`barChart ${compact ? 'compactBars' : ''}`}>
        {series.map((item) => (
          <div className="barItem" key={item.label} title={`${item.label}: ${item.count}`}>
            <div
              className="barFill"
              style={{ height: `${Math.max(4, (item.count / max) * 100)}%` }}
            />
            <span>{item.count || ''}</span>
          </div>
        ))}
      </div>
      <div className="axisLabels">
        <span>{series[0]?.label ? shortLabel(series[0].label) : '-'}</span>
        <span>{series[series.length - 1]?.label ? shortLabel(series[series.length - 1].label) : '-'}</span>
      </div>
    </section>
  )
}

export default function ClickAnalyticsClient() {
  const [activePassword, setActivePassword] = useState('')
  const [snapshot, setSnapshot] = useState<ClickAnalyticsSnapshot | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const loadSnapshot = async (passwordValue: string) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/click-analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: passwordValue }),
        cache: 'no-store',
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({})) as { error?: string }
        throw new Error(body.error || 'failed to load')
      }

      const nextSnapshot = await response.json() as ClickAnalyticsSnapshot
      setSnapshot(nextSnapshot)
      setActivePassword(passwordValue)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'failed to load')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const passwordValue = String(formData.get('password') ?? '')
    void loadSnapshot(passwordValue)
  }

  useEffect(() => {
    if (!activePassword) {
      return
    }

    const timer = window.setInterval(() => {
      void loadSnapshot(activePassword)
    }, 15000)

    return () => window.clearInterval(timer)
  }, [activePassword])

  const last60Clicks = useMemo(() => {
    return snapshot?.minute_series.reduce((sum, item) => sum + item.count, 0) ?? 0
  }, [snapshot])

  const minuteSeries = snapshot?.minute_series.map((item) => ({
    label: item.minute,
    count: item.count,
  })) ?? []

  const daySeries = snapshot?.day_series.map((item) => ({
    label: item.day,
    count: item.count,
  })) ?? []

  return (
    <main className="clickAnalyticsPage">
      <section className="loginBlock">
        <div>
          <p className="eyebrow">Specsy internal</p>
          <h1>Click Analytics</h1>
          <p className="lead">商品クリック、Amazon遷移、日別推移を確認する直打ち専用ページです。</p>
        </div>
        <form className="passwordForm" onSubmit={handleSubmit}>
          <input
            name="password"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Loading' : 'Open'}
          </button>
        </form>
      </section>

      {error ? <p className="errorText">{error}</p> : null}

      {snapshot ? (
        <>
          <section className="metricsGrid">
            <div className="metricBox">
              <span>Total clicks</span>
              <strong>{snapshot.total_clicks.toLocaleString('ja-JP')}</strong>
            </div>
            <div className="metricBox">
              <span>Last 60 min</span>
              <strong>{last60Clicks.toLocaleString('ja-JP')}</strong>
            </div>
            <div className="metricBox">
              <span>Products</span>
              <strong>{snapshot.product_stats.length.toLocaleString('ja-JP')}</strong>
            </div>
            <div className="metricBox">
              <span>Updated</span>
              <strong>{formatTime(snapshot.last_updated_at)}</strong>
            </div>
          </section>

          <div className="chartsGrid">
            <GraphBars title="Realtime clicks by minute" series={minuteSeries} compact />
            <GraphBars title="Daily clicks" series={daySeries} />
          </div>

          <section className="analyticsPanel">
            <div className="panelHeader">
              <h2>Product clicks</h2>
              <span>all time</span>
            </div>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>Clicks</th>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Last seen</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.product_stats.map((product) => (
                    <tr key={product.product_key}>
                      <td className="numberCell">{product.count}</td>
                      <td>
                        <div className="productName">{product.product_name || product.product_id}</div>
                        <div className="subText">{product.outbound_domain || product.product_id}</div>
                      </td>
                      <td>{product.product_type}</td>
                      <td>{formatPrice(product.price)}</td>
                      <td>{formatTime(product.last_seen_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="analyticsPanel">
            <div className="panelHeader">
              <h2>Recent clicks</h2>
              <span>{snapshot.recent_clicks.length} rows</span>
            </div>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Product</th>
                    <th>Page</th>
                    <th>Campaign</th>
                    <th>Link</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.recent_clicks.map((click) => (
                    <tr key={click.id}>
                      <td>{formatTime(click.clicked_at)}</td>
                      <td>
                        <div className="productName">{click.product_name || click.product_id}</div>
                        <div className="subText">
                          {click.product_type} / {formatPrice(click.price)}
                        </div>
                      </td>
                      <td>
                        <div>{click.source_page || '-'}</div>
                        <div className="subText">{click.usage || click.device || click.listing || '-'}</div>
                      </td>
                      <td>
                        <div>{click.utm_campaign || '-'}</div>
                        <div className="subText">{click.utm_source || ''} {click.utm_medium || ''}</div>
                      </td>
                      <td>
                        <div>{click.outbound_domain || '-'}</div>
                        <div className="subText">{click.link_position || '-'}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <section className="emptyState">
          <p>パスワードを入力すると分析データを読み込みます。</p>
        </section>
      )}

      <style jsx>{`
        .clickAnalyticsPage {
          min-height: 100vh;
          background: #f7f8fb;
          color: #172033;
          padding: 32px;
        }

        .loginBlock,
        .analyticsPanel,
        .metricBox,
        .emptyState {
          background: #ffffff;
          border: 1px solid #d9dee8;
          border-radius: 8px;
        }

        .loginBlock {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          padding: 24px;
          margin-bottom: 16px;
        }

        .eyebrow {
          margin: 0 0 6px;
          color: #607089;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
        }

        h1,
        h2,
        p {
          margin: 0;
        }

        h1 {
          font-size: 28px;
          line-height: 1.2;
        }

        h2 {
          font-size: 16px;
        }

        .lead {
          margin-top: 8px;
          color: #607089;
          font-size: 14px;
        }

        .passwordForm {
          display: flex;
          gap: 8px;
        }

        input,
        button {
          height: 40px;
          border-radius: 6px;
          font-size: 14px;
        }

        input {
          width: 240px;
          border: 1px solid #c7cfdd;
          padding: 0 12px;
          color: #172033;
          background: #ffffff;
        }

        button {
          border: 0;
          background: #172033;
          color: #ffffff;
          font-weight: 700;
          padding: 0 16px;
          cursor: pointer;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .errorText {
          margin: 0 0 16px;
          color: #b42318;
          font-size: 14px;
        }

        .metricsGrid,
        .chartsGrid {
          display: grid;
          gap: 16px;
          margin-bottom: 16px;
        }

        .metricsGrid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .chartsGrid {
          grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
        }

        .metricBox {
          padding: 18px;
        }

        .metricBox span,
        .panelHeader span,
        .subText {
          color: #607089;
          font-size: 12px;
        }

        .metricBox strong {
          display: block;
          margin-top: 8px;
          font-size: 26px;
          line-height: 1;
        }

        .analyticsPanel {
          padding: 18px;
          margin-bottom: 16px;
        }

        .panelHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }

        .barChart {
          display: flex;
          align-items: end;
          gap: 3px;
          height: 180px;
          border-bottom: 1px solid #d9dee8;
        }

        .compactBars {
          gap: 2px;
        }

        .barItem {
          position: relative;
          flex: 1;
          min-width: 3px;
          height: 100%;
          display: flex;
          align-items: end;
          justify-content: center;
        }

        .barFill {
          width: 100%;
          background: #2f6fed;
          border-radius: 3px 3px 0 0;
        }

        .barItem span {
          position: absolute;
          bottom: 100%;
          color: #607089;
          font-size: 10px;
          line-height: 1.2;
        }

        .axisLabels {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
          color: #607089;
          font-size: 11px;
        }

        .tableWrap {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        th,
        td {
          border-top: 1px solid #edf0f5;
          padding: 10px 8px;
          text-align: left;
          vertical-align: top;
        }

        th {
          color: #607089;
          font-size: 12px;
          font-weight: 700;
        }

        .numberCell {
          font-weight: 800;
        }

        .productName {
          max-width: 520px;
          font-weight: 700;
          line-height: 1.35;
        }

        .subText {
          margin-top: 3px;
          line-height: 1.35;
        }

        .emptyState {
          padding: 24px;
          color: #607089;
        }

        @media (max-width: 900px) {
          .clickAnalyticsPage {
            padding: 16px;
          }

          .loginBlock {
            display: block;
          }

          .passwordForm {
            margin-top: 18px;
          }

          input {
            width: 100%;
          }

          .metricsGrid,
          .chartsGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  )
}
