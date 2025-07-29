'use client'

import { useState, useEffect } from 'react'
import { PcTableProps, ClientSortOptions, ClientSortField, ClientSortOrder, ClientUsageCategory } from '../types'
import { sortPcs } from '../utils/pcSort'
import { fetchPcList } from '../../app/pc-list/fetchPcs'
import ImageComponent from './ImageComponent'

export default function PcTable({ pcs: initialPcs }: PcTableProps) {
  const [pcs, setPcs] = useState(initialPcs)
  const [sortOptions, setSortOptions] = useState<ClientSortOptions>({ field: 'pcScore', order: 'desc' })
  const [cpuOrderList, setCpuOrderList] = useState<string[]>([])
  const [selectedUsage, setSelectedUsage] = useState<ClientUsageCategory>('cafe')
  const [loading, setLoading] = useState(false)

  // initialPcsが変更されたときにpcsを更新
  useEffect(() => {
    setPcs(initialPcs)
  }, [initialPcs])

  // ページ読み込み時にCPUリストを取得
  useEffect(() => {
    const loadCpuList = async () => {
      try {
        const response = await fetch('/api/cpu-list')
        if (response.ok) {
          const cpuList = await response.json()
          setCpuOrderList(cpuList)
        }
      } catch (error) {
        console.error('Failed to fetch CPU list:', error)
      }
    }
    
    loadCpuList()
  }, [])

  const handleUsageChange = async (usage: ClientUsageCategory) => {
    setLoading(true)
    try {
      const newPcs = await fetchPcList(usage)
      setPcs(newPcs)
      setSelectedUsage(usage)
      setSortOptions({ field: 'pcScore', order: 'desc' })
    } catch (error) {
      console.error('Failed to fetch PCs for usage:', usage, error)
    } finally {
      setLoading(false)
    }
  }

  const handleSortChange = (field: ClientSortField) => {
    const newOrder: ClientSortOrder = sortOptions.field === field && sortOptions.order === 'desc' ? 'asc' : 'desc'
    const newSortOptions = { field, order: newOrder }
    setSortOptions(newSortOptions)
    
    const sortedPcs = sortPcs(pcs, newSortOptions, cpuOrderList)
    setPcs(sortedPcs)
  }

  const getSortIcon = (field: ClientSortField) => {
    if (sortOptions.field !== field) return ''
    return sortOptions.order === 'desc' ? ' ↓' : ' ↑'
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      {/* 用途選択ボタン */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', color: '#333', marginBottom: '16px', textAlign: 'center' }}>用途を選択</h2>
        <div style={{ 
          display: 'flex', 
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={() => handleUsageChange('mobile')}
            disabled={loading}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: selectedUsage === 'mobile' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                : 'linear-gradient(135deg, #667eea80 0%, #764ba280 100%)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: loading ? 0.7 : 1
            }}>
            🚀 外出先でサッと使用
          </button>
          
          <button 
            onClick={() => handleUsageChange('cafe')}
            disabled={loading}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: selectedUsage === 'cafe' 
                ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)' 
                : 'linear-gradient(135deg, #ff6b6b80 0%, #ee5a2480 100%)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: loading ? 0.7 : 1
            }}>
            ☕ カフェで集中作業
          </button>
          
          <button 
            onClick={() => handleUsageChange('home')}
            disabled={loading}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: selectedUsage === 'home' 
                ? 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)' 
                : 'linear-gradient(135deg, #4ecdc480 0%, #44a08d80 100%)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: loading ? 0.7 : 1
            }}>
            🏠 家でじっくり作業
          </button>
        </div>
      </div>

      {/* ソート機能 */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', color: '#333', marginBottom: '16px', textAlign: 'center' }}>並び替え</h3>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'center'
        }}>
          {[
            { field: 'pcScore' as ClientSortField, label: 'スコア' },
            { field: 'cpu' as ClientSortField, label: 'CPU' },
            { field: 'ram' as ClientSortField, label: 'メモリ' },
            { field: 'rom' as ClientSortField, label: 'ストレージ' },
            { field: 'display_size' as ClientSortField, label: '画面サイズ' },
            { field: 'estimatedBatteryLifeHours' as ClientSortField, label: '駆動時間' },
            { field: 'weight' as ClientSortField, label: '重量' },
            { field: 'price' as ClientSortField, label: '価格' }
          ].map(({ field, label }) => {
            const isActive = sortOptions.field === field
            const isDesc = isActive && sortOptions.order === 'desc'
            
            return (
              <button
                key={field}
                onClick={() => handleSortChange(field)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  backgroundColor: isActive ? '#f0f0f0' : 'white',
                  color: '#333',
                  fontSize: '14px',
                  fontWeight: isActive ? '600' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {label}
                <span style={{ fontSize: '12px' }}>
                  {isActive ? (isDesc ? '↓' : '↑') : ''}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {loading && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px',
          fontSize: '16px',
          color: '#666'
        }}>
          読み込み中...
        </div>
      )}

      {!loading && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            borderCollapse: 'collapse', 
            width: '100%',
            minWidth: '1000px',
            backgroundColor: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
      <thead>
        <tr style={{ backgroundColor: '#f8f9fa' }}>
          <th style={{
            border: '1px solid #dee2e6', 
            padding: '12px 8px',
            fontWeight: '600',
            color: '#495057',
            textAlign: 'center'
          }}>画像</th>
          <th style={{
            border: '1px solid #dee2e6', 
            padding: '12px 8px',
            fontWeight: '600',
            color: '#495057',
            minWidth: '200px'
          }}>ブランド / 製品名</th>
          <th style={{
            border: '1px solid #dee2e6', 
            padding: '12px 8px', 
            cursor: 'pointer',
            backgroundColor: sortOptions.field === 'cpu' ? '#e9ecef' : 'transparent',
            fontWeight: '600',
            color: '#495057',
            transition: 'background-color 0.2s ease',
            minWidth: '150px'
          }} onClick={() => handleSortChange('cpu')}>
            CPU{getSortIcon('cpu')}
          </th>
          <th style={{
            border: '1px solid #dee2e6', 
            padding: '12px 8px', 
            cursor: 'pointer',
            backgroundColor: sortOptions.field === 'ram' ? '#e9ecef' : 'transparent',
            fontWeight: '600',
            color: '#495057',
            transition: 'background-color 0.2s ease',
            minWidth: '80px'
          }} onClick={() => handleSortChange('ram')}>
            メモリ{getSortIcon('ram')}
          </th>
          <th style={{
            border: '1px solid #dee2e6', 
            padding: '12px 8px', 
            cursor: 'pointer',
            backgroundColor: sortOptions.field === 'rom' ? '#e9ecef' : 'transparent',
            fontWeight: '600',
            color: '#495057',
            transition: 'background-color 0.2s ease',
            minWidth: '100px'
          }} onClick={() => handleSortChange('rom')}>
            ストレージ{getSortIcon('rom')}
          </th>
          <th style={{
            border: '1px solid #dee2e6', 
            padding: '12px 8px', 
            cursor: 'pointer',
            backgroundColor: sortOptions.field === 'display_size' ? '#e9ecef' : 'transparent',
            fontWeight: '600',
            color: '#495057',
            transition: 'background-color 0.2s ease',
            minWidth: '100px'
          }} onClick={() => handleSortChange('display_size')}>
            画面サイズ{getSortIcon('display_size')}
          </th>
          <th style={{
            border: '1px solid #dee2e6', 
            padding: '12px 8px', 
            cursor: 'pointer',
            backgroundColor: sortOptions.field === 'weight' ? '#e9ecef' : 'transparent',
            fontWeight: '600',
            color: '#495057',
            transition: 'background-color 0.2s ease',
            minWidth: '80px'
          }} onClick={() => handleSortChange('weight')}>
            重さ{getSortIcon('weight')}
          </th>
          <th style={{
            border: '1px solid #dee2e6', 
            padding: '12px 8px', 
            cursor: 'pointer',
            backgroundColor: sortOptions.field === 'estimatedBatteryLifeHours' ? '#e9ecef' : 'transparent',
            fontWeight: '600',
            color: '#495057',
            transition: 'background-color 0.2s ease',
            minWidth: '90px'
          }} onClick={() => handleSortChange('estimatedBatteryLifeHours')}>
            駆動時間{getSortIcon('estimatedBatteryLifeHours')}
          </th>
          <th style={{
            border: '1px solid #dee2e6', 
            padding: '12px 8px', 
            cursor: 'pointer',
            backgroundColor: sortOptions.field === 'price' ? '#e9ecef' : 'transparent',
            fontWeight: '600',
            color: '#495057',
            transition: 'background-color 0.2s ease',
            minWidth: '120px'
          }} onClick={() => handleSortChange('price')}>
            価格{getSortIcon('price')}
          </th>
          <th style={{
            border: '1px solid #dee2e6', 
            padding: '12px 8px', 
            cursor: 'pointer',
            backgroundColor: sortOptions.field === 'pcScore' ? '#e9ecef' : 'transparent',
            fontWeight: '600',
            color: '#495057',
            transition: 'background-color 0.2s ease',
            minWidth: '100px'
          }} onClick={() => handleSortChange('pcScore')}>
            スペック評価{getSortIcon('pcScore')}
          </th>
          <th style={{
            border: '1px solid #dee2e6', 
            padding: '12px 8px',
            fontWeight: '600',
            color: '#495057',
            minWidth: '80px',
            textAlign: 'center'
          }}>詳細</th>
        </tr>
      </thead>
      <tbody>
        {pcs.map((pc) => (
          <tr key={pc.id}>
            <td style={{border: '1px solid #ddd', padding: '8px', textAlign: 'center'}}>
              {pc.img_url ? (
                <ImageComponent 
                  src={pc.img_url} 
                  alt={pc.name || 'PC Image'} 
                  style={{width: '80px', height: 'auto', borderRadius: '4px'}} 
                />
              ) : (
                <div style={{
                  width: '80px',
                  height: '60px',
                  backgroundColor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  fontSize: '10px',
                  color: '#666'
                }}>
                  No Image
                </div>
              )}
            </td>
            <td style={{border: '1px solid #ddd', padding: '8px', position: 'relative'}}>
              <div style={{fontWeight: 'bold', fontSize: '14px'}}>
                {pc.brand} / {pc.name || 'Unnamed PC'}
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
            </td>
            <td style={{border: '1px solid #ddd', padding: '8px', fontSize: '12px'}}>{pc.cpu}</td>
            <td style={{border: '1px solid #ddd', padding: '8px', fontSize: '12px'}}>{pc.ram}GB</td>
            <td style={{border: '1px solid #ddd', padding: '8px', fontSize: '12px'}}>{pc.rom}GB</td>
            <td style={{border: '1px solid #ddd', padding: '8px', fontSize: '12px'}}>{pc.display_size}インチ</td>
            <td style={{border: '1px solid #ddd', padding: '8px', fontSize: '12px'}}>{pc.weight}g</td>
            <td style={{border: '1px solid #ddd', padding: '8px', fontSize: '12px'}}>
              {pc.estimatedBatteryLifeHours ? `${pc.estimatedBatteryLifeHours}時間` : '-'}
            </td>
            <td style={{border: '1px solid #ddd', padding: '8px'}}>
              {pc.price && (
                <div>
                  <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                    ¥{pc.price.toLocaleString()}
                  </span>
                  {pc.real_price && pc.real_price !== pc.price && (
                    <div style={{ 
                      color: '#666', 
                      fontSize: '12px', 
                      textDecoration: 'line-through'
                    }}>
                      ¥{pc.real_price.toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </td>
            <td style={{border: '1px solid #ddd', padding: '8px', textAlign: 'center'}}>
              {pc.pcScore && (
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                  {pc.pcScore}点
                </span>
              )}
            </td>
            <td style={{border: '1px solid #ddd', padding: '8px', textAlign: 'center'}}>
              {(pc.af_url || pc.url) && (
                <a 
                  href={pc.af_url || pc.url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    backgroundColor: '#ee5a24',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  詳細
                </a>
              )}
            </td>
          </tr>
        ))}
      </tbody>
          </table>
        </div>
      )}
    </div>
  )
}