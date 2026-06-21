'use client'

import { PcCardProps } from '../types'
import TrackableProductLink from '../analytics/TrackableProductLink'
import { getBatteryLifeProfileRows } from '../utils/batteryLifeDisplay'
import ImageComponent from './ImageComponent'

export default function PcCard({ pc }: PcCardProps) {
  const batteryLifeRows = getBatteryLifeProfileRows(pc.batteryLifeProfiles)

  return (
    <div className="pc-mobile-card" style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
      backgroundColor: '#fff'
    }}>
      {/* カードヘッダー */}
      <div style={{ textAlign: 'center' }}>
        {/* デバイス名 */}
        <h3 className="pc-mobile-card__title" style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold' }}>
          {pc.brand} / {pc.name || 'Unnamed PC'}
        </h3>
      </div>

      {/* カードボディ */}
      <div className="pc-mobile-card__body" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '16px' }}>

        {/* カード画像 */}
        <div className="pc-mobile-card__image-wrap" style={{ flexShrink: 0 }}>
          {pc.img_url ? (
            <ImageComponent
              src={pc.img_url}
              alt={pc.name || 'PC Image'}
              style={{width: '120px', height: 'auto', borderRadius: '4px'}}
            />
          ) : (
            <div className="pc-mobile-card__no-image" style={{
              width: '120px',
              height: '80px',
              backgroundColor: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#666'
            }}>
              No Image
            </div>
          )}
        </div>

        {/* PC情報 */}
        <div className="pc-mobile-card__info">
          <div className="pc-mobile-card__specs" style={{ fontSize: '14px', lineHeight: '1.5' }}>
            {pc.cpu && <div>🔴 CPU：{pc.cpu}</div>}
            {pc.gpu && (
              <div>
                🔴 GPU：{pc.gpu}
              </div>
            )}
            {pc.ram && <div>🔴 メモリ：{pc.ram}GB</div>}
            {pc.rom && <div style={{ marginBottom: '8px' }}>🔴 ストレージ：{pc.rom}GB</div>}
            {pc.display_size && <div>画面サイズ：{pc.display_size} インチ</div>}
            {pc.weight && <div>重さ：{pc.weight}g</div>}
            {batteryLifeRows.length > 0 && (
              <div className="pc-mobile-card__battery" style={{ marginTop: '8px' }}>
                <div className="pc-mobile-card__battery-title" style={{ fontWeight: 700, marginBottom: '4px' }}>駆動時間目安</div>
                <div className="pc-mobile-card__battery-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: '4px 8px',
                }}>
                  {batteryLifeRows.map(({ key, label, value }) => (
                    <div
                      key={key}
                      className="pc-mobile-card__battery-row"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '6px',
                        padding: '3px 6px',
                        borderRadius: '6px',
                        backgroundColor: '#f8fafc',
                      }}
                    >
                      <span style={{ color: '#64748b' }}>{label}</span>
                      <span style={{ fontWeight: 700 }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 価格 */}
          <div className="pc-mobile-card__price" style={{ marginTop: '12px', fontSize: '16px', fontWeight: 'bold' }}>
            {pc.price && (
              <span style={{ color: '#d32f2f' }}>¥{pc.price.toLocaleString()}</span>
            )}
            {pc.real_price && pc.real_price !== pc.price && (
              <span className="pc-mobile-card__real-price" style={{
                color: '#666',
                fontSize: '14px',
                textDecoration: 'line-through',
                marginLeft: '8px'
              }}>
                ¥{pc.real_price.toLocaleString()}
              </span>
            )}
          </div>

          <div className="pc-mobile-card__score" style={{ marginTop: '12px', fontSize: '16px', fontWeight: 'bold' }}>
            {pc.pcScore && <div><strong>スペック評価:</strong> {pc.pcScore}点</div>}
          </div>

          {pc.fetched_at && (
            <div className="pc-mobile-card__date" style={{
              fontSize: '10px',
              color: '#666',
              marginTop: '2px'
            }}>
              データ取得: {pc.fetched_at}
            </div>
          )}
        </div>
      </div>

      {/* インプレッション計測用1pxトラッキング画像 */}
      {pc.imp_img_url && (
        <img
          src={pc.imp_img_url}
          alt=""
          style={{
            width: '1px',
            height: '1px',
            position: 'absolute',
            opacity: 0,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* af_url/url遷移ボタン */}
      {(pc.af_url || pc.url) && (
        <div className="pc-mobile-card__cta-wrap" style={{ marginTop: '16px', textAlign: 'center' }}>
          <TrackableProductLink
            href={pc.af_url || pc.url || '#'}
            productId={pc.id}
            productName={`${pc.brand ?? ''} / ${pc.name ?? ''}`}
            productType="pc"
            price={pc.price}
            linkPosition="pc_mobile_card_button"
            isAffiliate={Boolean(pc.af_url)}
            className="pc-mobile-card__cta external-link-mark"
            style={{
              display: 'inline-block',
              margin: '6px 0',
              padding: '12px 36px',
              backgroundColor: '#ee5a24',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '100px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            詳細を見る
          </TrackableProductLink>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 767px) {
          .pc-mobile-card {
            padding: 10px !important;
            margin-bottom: 10px !important;
            border-radius: 7px !important;
          }

          .pc-mobile-card__title {
            margin-bottom: 8px !important;
            font-size: 13px !important;
            line-height: 1.35 !important;
            text-align: left !important;
          }

          .pc-mobile-card__body {
            justify-content: flex-start !important;
            gap: 10px !important;
          }

          .pc-mobile-card__image-wrap :global(img),
          .pc-mobile-card__no-image {
            width: 92px !important;
          }

          .pc-mobile-card__no-image {
            height: 62px !important;
            font-size: 10px !important;
          }

          .pc-mobile-card__info {
            min-width: 0;
            flex: 1;
          }

          .pc-mobile-card__specs {
            font-size: 12px !important;
            line-height: 1.38 !important;
            overflow-wrap: anywhere;
          }

          .pc-mobile-card__battery {
            margin-top: 6px !important;
          }

          .pc-mobile-card__battery-title {
            margin-bottom: 3px !important;
            font-size: 11px !important;
          }

          .pc-mobile-card__battery-grid {
            gap: 3px 4px !important;
          }

          .pc-mobile-card__battery-row {
            gap: 4px !important;
            padding: 2px 4px !important;
            border-radius: 5px !important;
            font-size: 10px !important;
          }

          .pc-mobile-card__price {
            margin-top: 8px !important;
            font-size: 15px !important;
          }

          .pc-mobile-card__real-price {
            display: block;
            margin-left: 0 !important;
            font-size: 11px !important;
          }

          .pc-mobile-card__score {
            margin-top: 5px !important;
            font-size: 12px !important;
          }

          .pc-mobile-card__date {
            font-size: 9px !important;
          }

          .pc-mobile-card__cta-wrap {
            margin-top: 10px !important;
          }

          :global(.pc-mobile-card__cta) {
            box-sizing: border-box;
            width: 100% !important;
            margin: 0 !important;
            padding: 9px 16px !important;
            border-radius: 12px !important;
            font-size: 13px !important;
            line-height: 1.2 !important;
          }
        }
      `}</style>
    </div>
  )
}
