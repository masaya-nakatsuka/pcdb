'use client'

import { PcCardProps } from '../types'
import { getBatteryLifeProfileRows } from '../utils/batteryLifeDisplay'
import {
  formatCurrency,
  formatDisplaySize,
  formatStorageSize,
  formatWeight,
  getPcHighlights,
  getProductLink,
} from '../utils/pcInsights'
import ImageComponent from './ImageComponent'

export default function PcCard({ pc }: PcCardProps) {
  const batteryLifeRows = getBatteryLifeProfileRows(pc.batteryLifeProfiles)
  const highlights = getPcHighlights(pc, 4)
  const productLink = getProductLink(pc)

  return (
    <div style={{
      border: '1px solid #dbe4ef',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
      backgroundColor: '#fff',
      boxShadow: '0 8px 18px rgba(15, 23, 42, 0.08)',
    }}>
      <div style={{ marginBottom: '12px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '16px', fontWeight: 800, lineHeight: 1.45 }}>
          {pc.brand} / {pc.name || 'Unnamed PC'}
        </h3>
        {highlights.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {highlights.map((highlight) => (
              <span
                key={highlight}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  minHeight: '24px',
                  padding: '0 8px',
                  borderRadius: '999px',
                  backgroundColor: '#eef6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                  fontSize: '11px',
                  fontWeight: 800,
                }}
              >
                {highlight}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <div style={{ flexShrink: 0 }}>
          {pc.img_url ? (
            productLink ? (
              <a href={productLink} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                <ImageComponent
                  src={pc.img_url}
                  alt={pc.name || 'PC Image'}
                  style={{ width: '118px', height: '88px', objectFit: 'contain', borderRadius: '6px' }}
                />
              </a>
            ) : (
              <ImageComponent
                src={pc.img_url}
                alt={pc.name || 'PC Image'}
                style={{ width: '118px', height: '88px', objectFit: 'contain', borderRadius: '6px' }}
              />
            )
          ) : (
            <div style={{
              width: '118px',
              height: '88px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#94a3b8',
              fontWeight: 700,
            }}>
              No Image
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '8px',
            marginBottom: '10px',
          }}>
            <div style={{ padding: '9px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 700, marginBottom: '3px' }}>スコア</div>
              <div style={{ color: '#0f172a', fontSize: '17px', fontWeight: 900 }}>
                {pc.pcScore != null ? `${pc.pcScore}点` : '-'}
              </div>
            </div>
            <div style={{ padding: '9px', borderRadius: '8px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa' }}>
              <div style={{ color: '#9a3412', fontSize: '11px', fontWeight: 700, marginBottom: '3px' }}>価格</div>
              <div style={{ color: '#dc2626', fontSize: '17px', fontWeight: 900 }}>
                {formatCurrency(pc.price ?? pc.real_price)}
              </div>
              {pc.price != null && pc.real_price != null && pc.real_price !== pc.price && (
                <div style={{ color: '#78716c', fontSize: '11px', textDecoration: 'line-through', marginTop: '2px' }}>
                  {formatCurrency(pc.real_price)}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gap: '5px', color: '#334155', fontSize: '13px', lineHeight: 1.45 }}>
            <div><strong>CPU:</strong> {pc.cpu || '-'}</div>
            {pc.gpu && <div><strong>GPU:</strong> {pc.gpu}</div>}
            <div><strong>メモリ/SSD:</strong> {formatStorageSize(pc.ram)} / {formatStorageSize(pc.rom)}</div>
            <div><strong>画面/重量:</strong> {formatDisplaySize(pc.display_size)} / {formatWeight(pc.weight)}</div>
          </div>
        </div>
      </div>

      {batteryLifeRows.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <div style={{ color: '#0f172a', fontSize: '13px', fontWeight: 800, marginBottom: '6px' }}>駆動時間目安</div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '6px',
          }}>
            {batteryLifeRows.map(({ key, label, value }) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '6px',
                  padding: '7px 8px',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
              >
                <span style={{ color: '#64748b', fontWeight: 700 }}>{label}</span>
                <span style={{ color: '#0f172a', fontWeight: 800 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {pc.fetched_at && (
        <div style={{
          fontSize: '10px',
          color: '#64748b',
          marginTop: '10px'
        }}>
          データ取得: {pc.fetched_at}
        </div>
      )}

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

      {productLink && (
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <a
            href={productLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              minHeight: '44px',
              padding: '0 14px',
              backgroundColor: '#ee5a24',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 800,
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
