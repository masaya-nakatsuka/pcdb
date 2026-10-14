import Link from 'next/link'
import type { Metadata } from 'next'
import {
  cartogramAreas,
  cartogramNote,
  rankedSakaedoCities,
  sakaedoFormula,
} from '@/lib/urbanSakaedo'
import { createPageMetadata } from '@/lib/seoMetadata'
import styles from './page.module.css'

export const metadata: Metadata = createPageMetadata({
  title: '体感さかえ度 色分けマップ | Specsy',
  description:
    'DID人口の厚み、中心商業地価、市街地集中率を重み付けし、市単位で通常の日本地図に体感さかえ度の色を載せるSpecsy Labsの可視化です。',
  path: '/sakaedo-map',
})

const topCities = rankedSakaedoCities.slice(0, 10)

const mapCalloutPositions: Record<string, { x: number; y: number; anchor: 'start' | 'middle' | 'end' }> = {
  '13100': { x: 454, y: 318, anchor: 'start' },
  '27100': { x: 267, y: 382, anchor: 'end' },
  '23100': { x: 382, y: 360, anchor: 'start' },
  '14100': { x: 450, y: 344, anchor: 'start' },
  '40130': { x: 172, y: 392, anchor: 'end' },
  '01100': { x: 462, y: 134, anchor: 'start' },
  '04100': { x: 462, y: 268, anchor: 'start' },
  '34100': { x: 216, y: 368, anchor: 'end' },
}

const mapCallouts = Object.entries(mapCalloutPositions)
  .map(([code, position]) => {
    const city = rankedSakaedoCities.find((item) => item.code === code)
    return city ? { city, ...position } : null
  })
  .filter((item): item is NonNullable<typeof item> => item !== null)

export default function SakaedoMapPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Specsy トップ">
          <span className={styles.brandMark}>S</span>
          <span>Specsy</span>
        </Link>
        <nav className={styles.nav} aria-label="主要リンク">
          <Link href="/pc-list">PC比較</Link>
          <Link href="/tablet-list">タブレット</Link>
          <Link href="/monitor-list">モニター</Link>
          <Link href="/blog">ブログ</Link>
        </nav>
        <Link href="/pc-check" className={styles.headerLink}>
          購入診断
        </Link>
      </header>

      <main className={styles.main}>
        <section className={styles.hero} aria-labelledby="sakaedo-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Specsy Labs / Color Map</p>
            <h1 id="sakaedo-title">
              <span>地図はそのまま</span>
              <span>栄え度だけ色で見る</span>
            </h1>
            <p className={styles.lead}>
              変形はやめて、通常の日本地図の市区町村面に体感さかえ度の色だけを載せます。
              東京23区・大阪市・名古屋市・横浜市・福岡市のような都市部ほど濃い暖色で表示し、町村部は低彩度で残します。
            </p>
            <div className={styles.formulaBadge}>{sakaedoFormula}</div>
            <div className={styles.actions}>
              <a href="#ranking" className={styles.primaryLink}>
                上位を見る
              </a>
              <a href="#method" className={styles.secondaryLink}>
                色分けルールを見る
              </a>
            </div>
          </div>

          <div className={styles.mapPanel} aria-label="体感さかえ度で色分けした市単位の日本地図">
            <div className={styles.mapTop}>
              <strong>地図形状は変えない</strong>
              <span>全自治体の通常形状に、体感さかえ度の色だけを載せています。</span>
            </div>

            <svg className={styles.mapSvg} viewBox="0 35 720 650" role="img" aria-labelledby="map-title map-desc">
              <title id="map-title">体感さかえ度の市単位色分けマップ</title>
              <desc id="map-desc">
                DID人口の厚み、中心商業地価、市街地集中率から計算したスコアで、通常の日本地図を市単位に色分けした図。
              </desc>

              <text className={styles.seaLabel} x="58" y="278">
                SEA OF JAPAN
              </text>
              <text className={styles.seaLabel} x="552" y="620">
                PACIFIC
              </text>

              <g>
                {cartogramAreas.map((area, index) => (
                  <path
                    key={`${area.code}-${index}`}
                    className={area.isScoredCity ? styles.cityShape : styles.surfaceShape}
                    d={area.path}
                    fill={area.color}
                  >
                    <title>{area.isScoredCity ? `${area.title}: ${area.score.toFixed(1)}` : area.title}</title>
                  </path>
                ))}
              </g>

              {mapCallouts.map(({ city, x, y, anchor }) => (
                <g key={`${city.code}-callout`} className={styles.callout}>
                  <line
                    className={styles.calloutLine}
                    x1={city.labelX}
                    y1={city.labelY}
                    x2={x}
                    y2={y - 5}
                  />
                  <circle className={styles.calloutDot} cx={city.labelX} cy={city.labelY} r="2.5" />
                  <text
                    className={styles.calloutLabel}
                    x={x}
                    y={y}
                    textAnchor={anchor}
                  >
                    {city.shortName}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </section>

        <section className={styles.contentGrid}>
          <div className={styles.formulaPanel}>
            <p className={styles.eyebrow}>Formula</p>
            <h2 className={styles.panelTitle}>栄えて見える理由を3つに分ける</h2>
            <p className={styles.panelText}>
              DID人口は「街の人の厚み」、中心商業地価は「中心部の強さ」、
              市街地集中率は「街が散らばらずまとまっている感じ」として扱います。
            </p>

            <div className={styles.weights} aria-label="体感さかえ度の重み">
              <div className={styles.weightItem}>
                <span>DID人口の厚み</span>
                <div className={styles.weightTrack} aria-hidden="true">
                  <div className={styles.weightBar} style={{ width: '50%' }} />
                </div>
                <span>50%</span>
              </div>
              <div className={styles.weightItem}>
                <span>中心商業地価</span>
                <div className={styles.weightTrack} aria-hidden="true">
                  <div className={`${styles.weightBar} ${styles.weightBarLand}`} style={{ width: '40%' }} />
                </div>
                <span>40%</span>
              </div>
              <div className={styles.weightItem}>
                <span>市街地集中率</span>
                <div className={styles.weightTrack} aria-hidden="true">
                  <div
                    className={`${styles.weightBar} ${styles.weightBarConcentration}`}
                    style={{ width: '10%' }}
                  />
                </div>
                <span>10%</span>
              </div>
            </div>

            <div className={styles.legend} aria-label="地図の凡例">
              <div className={styles.legendRow}>
                <span className={`${styles.legendSwatch} ${styles.swatchHighest}`} />
                <span>80以上: 全国でも別格に濃く表示</span>
              </div>
              <div className={styles.legendRow}>
                <span className={`${styles.legendSwatch} ${styles.swatchHigh}`} />
                <span>68〜79: 大都市圏として強い</span>
              </div>
              <div className={styles.legendRow}>
                <span className={`${styles.legendSwatch} ${styles.swatchMiddle}`} />
                <span>52〜67: 広域中心地の厚みがある</span>
              </div>
              <div className={styles.legendRow}>
                <span className={`${styles.legendSwatch} ${styles.swatchLow}`} />
                <span>51以下・町村: 控えめな色で表示</span>
              </div>
            </div>
          </div>

          <div id="ranking" className={styles.rankingPanel}>
            <p className={styles.eyebrow}>Ranking</p>
            <h2 className={styles.panelTitle}>体感さかえ度 市単位上位</h2>
            <div className={styles.rankingList}>
              {topCities.map((city) => (
                <div className={styles.rankingItem} key={city.code}>
                  <span className={styles.rank}>{city.rank}</span>
                  <span className={styles.rankingName}>
                    <strong>{city.name}</strong>
                    <span>
                      {city.prefecture} / DID {city.didPopulationDepth}・地価{' '}
                      {city.commercialLandValue}・集中 {city.urbanConcentration}
                    </span>
                  </span>
                  <span className={styles.rankingScore}>{city.score.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="method" className={styles.methodPanel}>
          <p className={styles.eyebrow}>Implementation note</p>
          <h2 className={styles.panelTitle}>通常の地図に色だけを載せる</h2>
          <p className={styles.panelText}>
            全自治体の形状を読み込み、座標は変形せずに、体感さかえ度のスコアだけを色へ変換しています。
            面積の大小は実際の地図形状のままなので、栄え度は色の濃さで読ませます。
          </p>
          <div className={styles.methodGrid}>
            <div className={styles.methodItem}>
              <strong>1. 市ごとに採点</strong>
              <span>主要都市の暫定値と周辺補間を使い、50/40/10の重みで合成します。</span>
            </div>
            <div className={styles.methodItem}>
              <strong>2. 全自治体の面へ配置</strong>
              <span>市区町村の通常SVGパスをそのまま使います。</span>
            </div>
            <div className={styles.methodItem}>
              <strong>3. 色だけ変える</strong>
              <span>座標ワープや面積補正は行わず、スコアに応じて塗り色だけを変えます。</span>
            </div>
          </div>
          <p className={styles.note}>{cartogramNote}</p>
        </section>
      </main>
    </div>
  )
}
