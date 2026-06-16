'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { PcTableProps, ClientPcWithCpuSpec, ClientSortOptions, ClientSortField, ClientSortOrder, ClientUsageCategory } from '../types'
import { sortPcs } from '../utils/pcSort'
import { fetchPcList } from '../../app/pc-list/fetchPcs'
import { getPcListUsagePath } from '../../app/pc-list/usageConfig'
import ImageComponent from './ImageComponent'

export default function PcTable({ pcs: initialPcs, defaultCpu, defaultMaxDisplaySize, initialUsage = 'cafe', urlBasedUsage = false }: PcTableProps) {
  const router = useRouter()
  const [pcs, setPcs] = useState(initialPcs)
  const [allPcs, setAllPcs] = useState(initialPcs)
  const [sortOptions, setSortOptions] = useState<ClientSortOptions>({ field: 'pcScore', order: 'desc' })
  const [cpuOrderList, setCpuOrderList] = useState<string[]>([])
  const [selectedUsage, setSelectedUsage] = useState<ClientUsageCategory>(initialUsage)
  const [selectedCpu, setSelectedCpu] = useState<string>(defaultCpu ?? 'all')
  const [selectedDisplaySize, setSelectedDisplaySize] = useState<string>(
    defaultMaxDisplaySize ? `max:${defaultMaxDisplaySize}` : 'all'
  )
  const [isSortApplied, setIsSortApplied] = useState(false)
  const [loading, setLoading] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const [showLeftScrollCue, setShowLeftScrollCue] = useState(false)
  const [showRightScrollCue, setShowRightScrollCue] = useState(false)

  const availableCpuOptions = useMemo(() => {
    const cpuSet = new Set(allPcs.map((pc) => pc.cpu).filter((cpu): cpu is string => Boolean(cpu)))

    if (cpuOrderList.length === 0) {
      return Array.from(cpuSet).sort()
    }

    const ordered = cpuOrderList.filter((cpu) => cpuSet.has(cpu))
    const missing = Array.from(cpuSet).filter((cpu) => !ordered.includes(cpu))

    return [...ordered, ...missing]
  }, [allPcs, cpuOrderList])

  const availableDisplaySizeOptions = useMemo(() => {
    const sizeSet = new Set<number>()
    allPcs.forEach((pc) => {
      if (typeof pc.display_size === 'number') {
        sizeSet.add(pc.display_size)
      }
    })

    return Array.from(sizeSet).sort((a, b) => a - b)
  }, [allPcs])

  const applyCpuFilterAndSort = useCallback((
    sourcePcs: ClientPcWithCpuSpec[],
    cpuName: string,
    displaySize: string,
    options: ClientSortOptions,
    sortApplied: boolean
  ) => {
    let filtered = cpuName === 'all' ? sourcePcs : sourcePcs.filter((pc) => pc.cpu === cpuName)

    if (displaySize.startsWith('max:')) {
      const limit = Number(displaySize.replace('max:', ''))
      filtered = filtered.filter((pc) =>
        typeof pc.display_size === 'number' ? pc.display_size <= limit : false
      )
    } else if (displaySize !== 'all') {
      const targetSize = Number(displaySize)
      filtered = filtered.filter((pc) => pc.display_size === targetSize)
    }

    const displayed = sortApplied ? sortPcs(filtered, options, cpuOrderList) : filtered
    setPcs(displayed)
  }, [cpuOrderList])

  // initialPcsが変更されたときに基データを更新
  useEffect(() => {
    setAllPcs(initialPcs)
    setIsSortApplied(false)

    const initialCpuFilter = defaultCpu ?? 'all'
    const initialDisplayFilter = defaultMaxDisplaySize ? `max:${defaultMaxDisplaySize}` : 'all'

    const baseSortOptions: ClientSortOptions = { field: 'pcScore', order: 'desc' }
    setSortOptions(baseSortOptions)
    setSelectedCpu(initialCpuFilter)
    setSelectedDisplaySize(initialDisplayFilter)
    setSelectedUsage(initialUsage)
    applyCpuFilterAndSort(initialPcs, initialCpuFilter, initialDisplayFilter, baseSortOptions, false)
  }, [initialPcs, defaultCpu, defaultMaxDisplaySize, initialUsage, applyCpuFilterAndSort])

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
    if (urlBasedUsage) {
      if (usage !== selectedUsage) {
        setSelectedUsage(usage)
        router.push(getPcListUsagePath(usage))
      }
      return
    }

    setLoading(true)
    try {
      const newPcs = await fetchPcList(usage)
      setAllPcs(newPcs)
      setSelectedCpu(defaultCpu ?? 'all')
      setSelectedDisplaySize(defaultMaxDisplaySize ? `max:${defaultMaxDisplaySize}` : 'all')
      setIsSortApplied(false)
      const baseSortOptions: ClientSortOptions = { field: 'pcScore', order: 'desc' }
      setSortOptions(baseSortOptions)
      applyCpuFilterAndSort(
        newPcs,
        defaultCpu ?? 'all',
        defaultMaxDisplaySize ? `max:${defaultMaxDisplaySize}` : 'all',
        baseSortOptions,
        false
      )
      setSelectedUsage(usage)
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
    setIsSortApplied(true)

    applyCpuFilterAndSort(allPcs, selectedCpu, selectedDisplaySize, newSortOptions, true)
  }

  const getSortIcon = (field: ClientSortField) => {
    if (sortOptions.field !== field) return ''
    return sortOptions.order === 'desc' ? ' ↓' : ' ↑'
  }

  const handleCpuFilterChange = (cpuName: string) => {
    setSelectedCpu(cpuName)
    applyCpuFilterAndSort(allPcs, cpuName, selectedDisplaySize, sortOptions, isSortApplied)
  }

  const handleDisplaySizeChange = (size: string) => {
    setSelectedDisplaySize(size)
    applyCpuFilterAndSort(allPcs, selectedCpu, size, sortOptions, isSortApplied)
  }

  useEffect(() => {
    if (isSortApplied && sortOptions.field === 'cpu') {
      applyCpuFilterAndSort(allPcs, selectedCpu, selectedDisplaySize, sortOptions, true)
    }
  }, [cpuOrderList, isSortApplied, sortOptions, allPcs, selectedCpu, selectedDisplaySize, applyCpuFilterAndSort])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const updateScrollCue = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container
      const maxScrollLeft = scrollWidth - clientWidth
      setShowLeftScrollCue(scrollLeft > 0)
      setShowRightScrollCue(maxScrollLeft > 0 && scrollLeft < maxScrollLeft - 1)

    }

    updateScrollCue()
    container.addEventListener('scroll', updateScrollCue)

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            updateScrollCue()
          })
        : null
    resizeObserver?.observe(container)

    return () => {
      container.removeEventListener('scroll', updateScrollCue)
      resizeObserver?.disconnect()
    }
  }, [pcs])

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

          <button
            onClick={() => handleUsageChange('cost_performance')}
            disabled={loading}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: selectedUsage === 'cost_performance'
                ? 'linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%)'
                : 'linear-gradient(135deg, #0ea5e980 0%, #22c55e80 100%)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: loading ? 0.7 : 1
            }}>
            💰 コスパ
          </button>

          <button
            onClick={() => handleUsageChange('gaming')}
            disabled={loading}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: selectedUsage === 'gaming'
                ? 'linear-gradient(135deg, #111827 0%, #ef4444 100%)'
                : 'linear-gradient(135deg, #11182780 0%, #ef444480 100%)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: loading ? 0.7 : 1
            }}>
            🎮 ゲーム
          </button>

          <button
            onClick={() => handleUsageChange('video_editing')}
            disabled={loading}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: selectedUsage === 'video_editing'
                ? 'linear-gradient(135deg, #0f766e 0%, #f59e0b 100%)'
                : 'linear-gradient(135deg, #0f766e80 0%, #f59e0b80 100%)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: loading ? 0.7 : 1
            }}>
            🎬 動画編集
          </button>
      </div>
    </div>

      {/* フィルター */}
      <div style={{
        marginBottom: '20px',
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <div
          style={{
            minWidth: '180px',
            maxWidth: '220px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <label htmlFor="cpuFilter" style={{ fontSize: '14px', color: '#333' }}>
            CPUで絞り込み
          </label>
          <select
            id="cpuFilter"
            value={selectedCpu}
            onChange={(event) => handleCpuFilterChange(event.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '13px',
              backgroundColor: '#fff',
              color: '#333'
            }}
          >
            <option value="all">すべて</option>
            {availableCpuOptions.map((cpu) => (
              <option key={cpu} value={cpu}>
                {cpu}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            minWidth: '160px',
            maxWidth: '200px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <label htmlFor="displaySizeFilter" style={{ fontSize: '14px', color: '#333' }}>
            画面サイズで絞り込み
          </label>
        <select
          id="displaySizeFilter"
          value={selectedDisplaySize}
          onChange={(event) => handleDisplaySizeChange(event.target.value)}
          style={{
            width: '100%',
            padding: '8px 10px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            fontSize: '13px',
            backgroundColor: '#fff',
            color: '#333'
          }}
        >
          <option value="all">すべて</option>
          {defaultMaxDisplaySize && (
            <option value={`max:${defaultMaxDisplaySize}`}>
              {defaultMaxDisplaySize}インチ以下
            </option>
          )}
          {availableDisplaySizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}インチ
            </option>
          ))}
          </select>
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
            { field: 'gpu_score' as ClientSortField, label: 'GPU' },
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
        <div
          style={{
            position: 'relative',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            backgroundColor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}
        >
          <div
            ref={scrollContainerRef}
            className="pc-scroll-container"
            style={{
              overflowX: 'scroll',
              overflowY: 'hidden',
              scrollbarWidth: 'auto',
              msOverflowStyle: 'auto',
              WebkitOverflowScrolling: 'touch',
              scrollbarGutter: 'auto'
            }}
          >
            <table
              style={{
                borderCollapse: 'collapse',
                width: '100%',
                minWidth: '1120px'
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
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
                    textAlign: 'center',
                    minWidth: '100px'
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
                    backgroundColor: sortOptions.field === 'gpu_score' ? '#e9ecef' : 'transparent',
                    fontWeight: '600',
                    color: '#495057',
                    transition: 'background-color 0.2s ease',
                    minWidth: '130px'
                  }} onClick={() => handleSortChange('gpu_score')}>
                    GPU{getSortIcon('gpu_score')}
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
                    fontWeight: '600',
                    color: '#495057',
                    minWidth: '80px',
                    textAlign: 'center'
                  }}>詳細</th>
                </tr>
              </thead>
              <tbody>
                {pcs.map((pc) => {
                  const productLink = pc.af_url || pc.url

                  return (
                    <tr key={pc.id}>
                      <td style={{border: '1px solid #ddd', padding: '8px', textAlign: 'center'}}>
                        {pc.pcScore && (
                          <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                            {pc.pcScore}点
                          </span>
                        )}
                      </td>
                      <td style={{border: '1px solid #ddd', padding: '8px', textAlign: 'center'}}>
                        {pc.img_url ? (
                          productLink ? (
                            <a
                              href={productLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ display: 'inline-block' }}
                            >
                              <ImageComponent
                                src={pc.img_url}
                                alt={pc.name || 'PC Image'}
                                style={{width: '180px', height: 'auto', borderRadius: '8px'}}
                              />
                            </a>
                          ) : (
                            <ImageComponent
                              src={pc.img_url}
                              alt={pc.name || 'PC Image'}
                              style={{width: '180px', height: 'auto', borderRadius: '8px'}}
                            />
                          )
                        ) : (
                          <div style={{
                            width: '180px',
                            height: '110px',
                            backgroundColor: '#f8fafc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '8px',
                            fontSize: '12px',
                            color: '#94a3b8'
                          }}>
                            No Image
                          </div>
                        )}
                      </td>
                      <td style={{border: '1px solid #ddd', padding: '8px', position: 'relative'}}>
                        <div style={{fontWeight: 'bold', fontSize: '14px'}}>
                          {productLink ? (
                            <a
                              href={productLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#333', textDecoration: 'none' }}
                            >
                              {pc.brand} / {pc.name || 'Unnamed PC'}
                            </a>
                          ) : (
                            <span>{pc.brand} / {pc.name || 'Unnamed PC'}</span>
                          )}
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
                      <td style={{border: '1px solid #ddd', padding: '8px', fontSize: '12px'}}>{pc.cpu || '-'}</td>
                      <td style={{border: '1px solid #ddd', padding: '8px', fontSize: '12px'}}>
                        {pc.gpu || '-'}
                      </td>
                      <td style={{border: '1px solid #ddd', padding: '8px', fontSize: '12px'}}>
                        {pc.ram != null ? `${pc.ram}GB` : '-'}
                      </td>
                      <td style={{border: '1px solid #ddd', padding: '8px', fontSize: '12px'}}>
                        {pc.rom != null ? `${pc.rom}GB` : '-'}
                      </td>
                      <td style={{border: '1px solid #ddd', padding: '8px', fontSize: '12px'}}>
                        {pc.display_size != null ? `${pc.display_size}インチ` : '-'}
                      </td>
                      <td style={{border: '1px solid #ddd', padding: '8px', fontSize: '12px'}}>
                        {pc.weight != null ? `${pc.weight}g` : '-'}
                      </td>
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
                        {productLink && (
                          <a
                            href={productLink}
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
                  )
                })}
              </tbody>
            </table>
          </div>
          {showLeftScrollCue && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                width: '56px',
                pointerEvents: 'none',
                background: 'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 70%)'
              }}
            />
          )}
          {showRightScrollCue && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: 0,
                width: '56px',
                pointerEvents: 'none',
                background: 'linear-gradient(270deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 70%)'
              }}
            />
          )}
        </div>
      )}
      <style jsx>{`
        .pc-scroll-container {
          scrollbar-width: thin;
        }

        .pc-scroll-container::-webkit-scrollbar {
          height: 10px;
        }

        .pc-scroll-container::-webkit-scrollbar-thumb {
          background: #adb5bd;
          border-radius: 6px;
        }

        .pc-scroll-container::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.08);
          border-radius: 6px;
        }
      `}</style>
    </div>
  )
}
