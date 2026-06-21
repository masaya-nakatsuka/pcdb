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

type DeleteAction =
  | { action: 'delete_all' }
  | { action: 'delete_click'; click_id: string }

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

function formatProductType(value: string): string {
  if (value === 'pc') {
    return 'PC'
  }
  if (value === 'monitor') {
    return 'モニター'
  }
  if (value === 'tablet') {
    return 'タブレット'
  }
  return value || '-'
}

function formatMinuteLabel(value: string): string {
  const parts = value.split('T')
  return parts[1] ?? value
}

function formatDayLabel(value: string): string {
  return value.replace(/^\d{4}-/, '').replace('-', '/')
}

function shortText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength)}...`
}

function ChartPanel({
  title,
  caption,
  series,
  formatLabel,
}: {
  title: string
  caption: string
  series: Array<{ label: string; count: number }>
  formatLabel: (value: string) => string
}) {
  const max = Math.max(1, ...series.map((item) => item.count))
  const total = series.reduce((sum, item) => sum + item.count, 0)
  const chartWidth = 640
  const chartHeight = 190
  const paddingX = 18
  const paddingY = 16
  const baseline = chartHeight - paddingY
  const usableWidth = chartWidth - paddingX * 2
  const usableHeight = chartHeight - paddingY * 2
  const points = series.map((item, index) => {
    const x = paddingX + (usableWidth * index) / Math.max(1, series.length - 1)
    const y = baseline - (item.count / max) * usableHeight
    return { ...item, x, y }
  })
  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`
    : ''
  const barWidth = Math.max(3, Math.min(18, usableWidth / Math.max(1, series.length) - 2))

  return (
    <section className="analyticsPanel">
      <div className="panelHeader">
        <div>
          <h2>{title}</h2>
          <p className="panelCaption">{caption}</p>
        </div>
        <span>{total.toLocaleString('ja-JP')}クリック</span>
      </div>
      <div className="lineChartWrap">
        <svg className="lineChart" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
          <line x1={paddingX} y1={baseline} x2={chartWidth - paddingX} y2={baseline} className="chartAxis" />
          <line x1={paddingX} y1={paddingY} x2={paddingX} y2={baseline} className="chartAxis" />
          {areaPath ? <path d={areaPath} className="chartArea" /> : null}
          {points.map((point) => {
            const height = Math.max(2, baseline - point.y)
            return (
              <rect
                key={point.label}
                className="chartBar"
                x={point.x - barWidth / 2}
                y={baseline - height}
                width={barWidth}
                height={height}
              />
            )
          })}
          {linePath ? <path d={linePath} className="chartLine" /> : null}
          {points.map((point) => (
            point.count > 0 ? (
              <circle key={point.label} cx={point.x} cy={point.y} r="4" className="chartPoint">
                <title>{`${formatLabel(point.label)}: ${point.count}クリック`}</title>
              </circle>
            ) : null
          ))}
        </svg>
      </div>
      <div className="axisLabels">
        <span>{series[0]?.label ? formatLabel(series[0].label) : '-'}</span>
        <span>最大 {max.toLocaleString('ja-JP')}</span>
        <span>{series[series.length - 1]?.label ? formatLabel(series[series.length - 1].label) : '-'}</span>
      </div>
    </section>
  )
}

function ProductRankBars({ products }: { products: ProductClickStats[] }) {
  const topProducts = products.slice(0, 10)
  const max = Math.max(1, ...topProducts.map((product) => product.count))

  return (
    <section className="analyticsPanel">
      <div className="panelHeader">
        <div>
          <h2>商品別クリック数</h2>
          <p className="panelCaption">クリックが多い商品トップ10</p>
        </div>
        <span>{products.length.toLocaleString('ja-JP')}商品</span>
      </div>
      <div className="rankBars">
        {topProducts.length > 0 ? topProducts.map((product) => (
          <div className="rankRow" key={product.product_key}>
            <div className="rankLabel">
              <strong>{product.product_name || product.product_id}</strong>
              <span>{formatProductType(product.product_type)} / {product.outbound_domain || '-'}</span>
            </div>
            <div className="rankTrack">
              <div className="rankFill" style={{ width: `${Math.max(6, (product.count / max) * 100)}%` }} />
            </div>
            <div className="rankCount">{product.count.toLocaleString('ja-JP')}</div>
          </div>
        )) : (
          <p className="emptyText">まだ商品クリックがありません。</p>
        )}
      </div>
    </section>
  )
}

export default function ClickAnalyticsClient() {
  const [activePassword, setActivePassword] = useState('')
  const [snapshot, setSnapshot] = useState<ClickAnalyticsSnapshot | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState('')

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
        throw new Error(body.error || 'データを読み込めませんでした')
      }

      const nextSnapshot = await response.json() as ClickAnalyticsSnapshot
      setSnapshot(nextSnapshot)
      setActivePassword(passwordValue)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'データを読み込めませんでした')
    } finally {
      setLoading(false)
    }
  }

  const deleteAnalytics = async (deleteAction: DeleteAction) => {
    if (!activePassword) {
      setError('先にパスワードを入力してください')
      return
    }

    setDeletingId(deleteAction.action === 'delete_all' ? 'all' : deleteAction.click_id)
    setError('')

    try {
      const response = await fetch('/api/admin/click-analytics', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: activePassword,
          ...deleteAction,
        }),
        cache: 'no-store',
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({})) as { error?: string }
        throw new Error(body.error || '削除できませんでした')
      }

      const nextSnapshot = await response.json() as ClickAnalyticsSnapshot
      setSnapshot(nextSnapshot)
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : '削除できませんでした')
    } finally {
      setDeletingId('')
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const passwordValue = String(formData.get('password') ?? '')
    void loadSnapshot(passwordValue)
  }

  const handleDeleteClick = (click: StoredProductClick) => {
    const productName = click.product_name || click.product_id
    if (!window.confirm(`このクリック履歴を削除しますか？\n${productName}\n${formatTime(click.clicked_at)}`)) {
      return
    }

    void deleteAnalytics({ action: 'delete_click', click_id: click.id })
  }

  const handleDeleteAll = () => {
    if (!window.confirm('すべてのクリック分析データを削除します。元に戻せません。実行しますか？')) {
      return
    }

    void deleteAnalytics({ action: 'delete_all' })
  }

  useEffect(() => {
    if (!activePassword) {
      return
    }

    const timer = window.setInterval(() => {
      if (!deletingId) {
        void loadSnapshot(activePassword)
      }
    }, 15000)

    return () => window.clearInterval(timer)
  }, [activePassword, deletingId])

  const last60Clicks = useMemo(() => {
    return snapshot?.minute_series.reduce((sum, item) => sum + item.count, 0) ?? 0
  }, [snapshot])

  const last30DayClicks = useMemo(() => {
    return snapshot?.day_series.reduce((sum, item) => sum + item.count, 0) ?? 0
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
          <p className="eyebrow">Specsy 管理用</p>
          <h1>クリック分析</h1>
          <p className="lead">商品リンクが、いつ・どこから・どの商品で押されたかを確認します。</p>
        </div>
        <form className="passwordForm" onSubmit={handleSubmit}>
          <input
            name="password"
            type="password"
            placeholder="管理パスワード"
            autoComplete="current-password"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? '読み込み中' : '開く'}
          </button>
        </form>
      </section>

      {error ? <p className="errorText">{error}</p> : null}

      {snapshot ? (
        <>
          <section className="toolbar">
            <div>
              <strong>最終更新: {formatTime(snapshot.last_updated_at)}</strong>
              <span>15秒ごとに自動更新</span>
            </div>
            <button
              type="button"
              className="dangerButton"
              onClick={handleDeleteAll}
              disabled={Boolean(deletingId) || snapshot.total_clicks === 0}
            >
              {deletingId === 'all' ? '削除中' : 'すべて削除'}
            </button>
          </section>

          <section className="metricsGrid">
            <div className="metricBox">
              <span>総クリック数</span>
              <strong>{snapshot.total_clicks.toLocaleString('ja-JP')}</strong>
            </div>
            <div className="metricBox">
              <span>直近60分</span>
              <strong>{last60Clicks.toLocaleString('ja-JP')}</strong>
            </div>
            <div className="metricBox">
              <span>過去30日</span>
              <strong>{last30DayClicks.toLocaleString('ja-JP')}</strong>
            </div>
            <div className="metricBox">
              <span>クリック商品数</span>
              <strong>{snapshot.product_stats.length.toLocaleString('ja-JP')}</strong>
            </div>
          </section>

          <div className="chartsGrid">
            <ChartPanel
              title="リアルタイム推移"
              caption="直近60分の分単位クリック"
              series={minuteSeries}
              formatLabel={formatMinuteLabel}
            />
            <ChartPanel
              title="日別クリック推移"
              caption="過去30日の日別クリック"
              series={daySeries}
              formatLabel={formatDayLabel}
            />
          </div>

          <ProductRankBars products={snapshot.product_stats} />

          <section className="analyticsPanel">
            <div className="panelHeader">
              <div>
                <h2>商品別集計</h2>
                <p className="panelCaption">クリック数が多い順</p>
              </div>
              <span>全期間</span>
            </div>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>クリック</th>
                    <th>商品</th>
                    <th>種別</th>
                    <th>価格</th>
                    <th>最終クリック</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.product_stats.length > 0 ? snapshot.product_stats.map((product) => (
                    <tr key={product.product_key}>
                      <td className="numberCell">{product.count.toLocaleString('ja-JP')}</td>
                      <td>
                        <div className="productName">{product.product_name || product.product_id}</div>
                        <div className="subText">{product.outbound_domain || product.product_id}</div>
                      </td>
                      <td>{formatProductType(product.product_type)}</td>
                      <td>{formatPrice(product.price)}</td>
                      <td>{formatTime(product.last_seen_at)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="emptyCell">まだ商品クリックがありません。</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="analyticsPanel">
            <div className="panelHeader">
              <div>
                <h2>最近のクリック</h2>
                <p className="panelCaption">最大250件。不要なテストクリックは個別に削除できます。</p>
              </div>
              <span>{snapshot.recent_clicks.length.toLocaleString('ja-JP')}件</span>
            </div>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>時刻</th>
                    <th>商品</th>
                    <th>ページ</th>
                    <th>流入</th>
                    <th>リンク</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.recent_clicks.length > 0 ? snapshot.recent_clicks.map((click) => (
                    <tr key={click.id}>
                      <td>{formatTime(click.clicked_at)}</td>
                      <td>
                        <div className="productName">{click.product_name || click.product_id}</div>
                        <div className="subText">
                          {formatProductType(click.product_type)} / {formatPrice(click.price)}
                        </div>
                      </td>
                      <td>
                        <div>{click.source_page || '-'}</div>
                        <div className="subText">{click.usage || click.device || click.listing || '-'}</div>
                      </td>
                      <td>
                        <div>{click.utm_campaign || '-'}</div>
                        <div className="subText">{shortText(`${click.utm_source || ''} ${click.utm_medium || ''}`.trim() || '-', 40)}</div>
                      </td>
                      <td>
                        <div>{click.outbound_domain || '-'}</div>
                        <div className="subText">{click.link_position || '-'}</div>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="rowDeleteButton"
                          onClick={() => handleDeleteClick(click)}
                          disabled={Boolean(deletingId)}
                        >
                          {deletingId === click.id ? '削除中' : '削除'}
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="emptyCell">最近のクリックはありません。</td>
                    </tr>
                  )}
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
        .emptyState,
        .toolbar {
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

        .lead,
        .panelCaption {
          margin-top: 6px;
          color: #607089;
          font-size: 13px;
          line-height: 1.5;
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

        .dangerButton {
          background: #b42318;
        }

        .rowDeleteButton {
          height: 32px;
          background: #fff2f0;
          border: 1px solid #f3b8b2;
          color: #b42318;
          padding: 0 10px;
        }

        .errorText {
          margin: 0 0 16px;
          color: #b42318;
          font-size: 14px;
        }

        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 18px;
          margin-bottom: 16px;
        }

        .toolbar strong {
          display: block;
          font-size: 14px;
        }

        .toolbar span {
          display: block;
          margin-top: 4px;
          color: #607089;
          font-size: 12px;
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
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }

        .lineChartWrap {
          height: 210px;
          border: 1px solid #edf0f5;
          border-radius: 8px;
          background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
          padding: 10px;
        }

        .lineChart {
          display: block;
          width: 100%;
          height: 100%;
        }

        .chartAxis {
          stroke: #d9dee8;
          stroke-width: 1;
        }

        .chartArea {
          fill: rgba(47, 111, 237, 0.12);
        }

        .chartLine {
          fill: none;
          stroke: #2f6fed;
          stroke-width: 3;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .chartBar {
          fill: rgba(47, 111, 237, 0.24);
        }

        .chartPoint {
          fill: #2f6fed;
          stroke: #ffffff;
          stroke-width: 2;
        }

        .axisLabels {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
          color: #607089;
          font-size: 11px;
        }

        .rankBars {
          display: grid;
          gap: 12px;
        }

        .rankRow {
          display: grid;
          grid-template-columns: minmax(220px, 1.4fr) minmax(160px, 2fr) 48px;
          align-items: center;
          gap: 12px;
        }

        .rankLabel strong {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 13px;
        }

        .rankLabel span {
          display: block;
          margin-top: 3px;
          color: #607089;
          font-size: 12px;
        }

        .rankTrack {
          height: 12px;
          overflow: hidden;
          background: #edf0f5;
          border-radius: 999px;
        }

        .rankFill {
          height: 100%;
          background: #2f6fed;
          border-radius: inherit;
        }

        .rankCount {
          text-align: right;
          font-weight: 800;
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

        .emptyState,
        .emptyCell,
        .emptyText {
          color: #607089;
        }

        .emptyState {
          padding: 24px;
        }

        .emptyCell {
          padding: 22px 8px;
          text-align: center;
        }

        @media (max-width: 900px) {
          .clickAnalyticsPage {
            padding: 16px;
          }

          .loginBlock,
          .toolbar {
            display: block;
          }

          .passwordForm {
            margin-top: 18px;
          }

          input {
            width: 100%;
          }

          .toolbar button {
            width: 100%;
            margin-top: 14px;
          }

          .metricsGrid,
          .chartsGrid {
            grid-template-columns: 1fr;
          }

          .rankRow {
            grid-template-columns: 1fr;
            gap: 6px;
          }

          .rankCount {
            text-align: left;
          }
        }
      `}</style>
    </main>
  )
}
