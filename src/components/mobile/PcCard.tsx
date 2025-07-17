'use client'

import { PcCardProps } from '../../shared/types/components'
import ImageComponent from './ImageComponent'

export default function PcCard({ pc }: PcCardProps) {
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
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>

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
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
            {pc.cpu && <div><strong>CPU:</strong> {pc.cpu}</div>}
            {pc.ram && <div><strong>RAM:</strong> {pc.ram}GB</div>}
            {pc.rom && <div><strong>ROM:</strong> {pc.rom}GB</div>}
            {pc.display_size && <div><strong>Display:</strong> {pc.display_size} インチ</div>}
            {pc.battery_wh_normalized && <div><strong>Battery:</strong> {pc.battery_wh_normalized}Wh</div>}
            {pc.weight && <div><strong>Weight:</strong> {pc.weight}g</div>}
            {pc.cores && <div><strong>Cores:</strong> {pc.cores}</div>}
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

          {pc.fetched_at && (
            <div style={{ 
              fontSize: '12px', 
              color: '#666', 
              marginTop: '8px' 
            }}>
              データ取得: {pc.fetched_at}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}