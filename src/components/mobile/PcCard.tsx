'use client'

import { PcCardProps } from '../types'
import { getBatteryLifeProfileRows } from '../utils/batteryLifeDisplay'
import ImageComponent from './ImageComponent'

export default function PcCard({ pc }: PcCardProps) {
  const batteryLifeRows = getBatteryLifeProfileRows(pc.batteryLifeProfiles)

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
      backgroundColor: '#fff'
    }}>
      {/* カードヘッダー */}
      <div style={{ textAlign: 'center' }}>
        {/* デバイス名 */}
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold' }}>
          {pc.brand} / {pc.name || 'Unnamed PC'}
        </h3>
      </div>

      {/* カードボディ */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '16px' }}>

        {/* カード画像 */}
        <div style={{ flexShrink: 0 }}>
          {pc.img_url ? (
            <ImageComponent
              src={pc.img_url}
              alt={pc.name || 'PC Image'}
              style={{width: '120px', height: 'auto', borderRadius: '4px'}}
            />
          ) : (
            <div style={{
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
        <div>
          <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
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
              <div style={{ marginTop: '8px' }}>
                <div style={{ fontWeight: 700, marginBottom: '4px' }}>駆動時間目安</div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: '4px 8px',
                }}>
                  {batteryLifeRows.map(({ key, label, value }) => (
                    <div
                      key={key}
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
          <div style={{ marginTop: '12px', fontSize: '16px', fontWeight: 'bold' }}>
            {pc.price && (
              <span style={{ color: '#d32f2f' }}>¥{pc.price.toLocaleString()}</span>
            )}
            {pc.real_price && pc.real_price !== pc.price && (
              <span style={{
                color: '#666',
                fontSize: '14px',
                textDecoration: 'line-through',
                marginLeft: '8px'
              }}>
                ¥{pc.real_price.toLocaleString()}
              </span>
            )}
          </div>

          <div style={{ marginTop: '12px', fontSize: '16px', fontWeight: 'bold' }}>
            {pc.pcScore && <div><strong>スペック評価:</strong> {pc.pcScore}点</div>}
          </div>

          {pc.fetched_at && (
            <div style={{
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
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <a
            href={pc.af_url || pc.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="external-link-mark"
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
          </a>
        </div>
      )}
    </div>
  )
}
