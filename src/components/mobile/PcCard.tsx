'use client'

import { PcCardProps } from '../types'
import ImageComponent from './ImageComponent'

export default function PcCard({ pc, tone = 'default' }: PcCardProps) {
  const isPerformanceTone = tone === 'performance'

  return (
    <div className="pc-mobile-card" style={{
      border: isPerformanceTone ? '1px solid rgba(148, 163, 184, 0.24)' : '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
      background: isPerformanceTone
        ? 'linear-gradient(145deg, rgba(15, 23, 42, 0.96) 0%, rgba(2, 6, 23, 0.98) 100%)'
        : '#fff',
      color: isPerformanceTone ? '#e5e7eb' : '#111827',
      boxShadow: isPerformanceTone
        ? '0 18px 40px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.06)'
        : undefined
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
              backgroundColor: isPerformanceTone ? 'rgba(15, 23, 42, 0.92)' : '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              fontSize: '12px',
              color: isPerformanceTone ? '#94a3b8' : '#666',
              border: isPerformanceTone ? '1px solid rgba(148, 163, 184, 0.22)' : undefined
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
                {pc.gpu_score != null ? `（${pc.gpu_score}/10）` : ''}
              </div>
            )}
            {pc.ram && <div>🔴 メモリ：{pc.ram}GB</div>}
            {pc.rom && <div style={{ marginBottom: '8px' }}>🔴 ストレージ：{pc.rom}GB</div>}
            {pc.display_size && <div>画面サイズ：{pc.display_size} インチ</div>}
            {pc.weight && <div>重さ：{pc.weight}g</div>}
            {pc.estimatedBatteryLifeHours && <div>駆動時間(推定)：{pc.estimatedBatteryLifeHours}時間</div>}
          </div>

          {/* 価格 */}
          <div style={{ marginTop: '12px', fontSize: '16px', fontWeight: 'bold' }}>
            {pc.price && (
              <span style={{ color: isPerformanceTone ? '#fbbf24' : '#d32f2f' }}>¥{pc.price.toLocaleString()}</span>
            )}
            {pc.real_price && pc.real_price !== pc.price && (
              <span style={{ 
                color: isPerformanceTone ? '#94a3b8' : '#666',
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
              color: isPerformanceTone ? '#94a3b8' : '#666',
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
            style={{
              display: 'inline-block',
              margin: '6px 0',
              padding: '12px 36px',
              background: isPerformanceTone
                ? 'linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)'
                : '#ee5a24',
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
