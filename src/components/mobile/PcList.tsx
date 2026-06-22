'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PcListProps, ClientPcWithCpuSpec, ClientUsageCategory, ClientSortField, ClientSortOrder, ClientSortOptions } from '../types'
import { fetchPcList } from '../../app/pc-list/fetchPcs'
import { getPcListUsagePath } from '../../app/pc-list/usageConfig'
import { sortPcs } from '../utils/pcSort'
import {
  getDisplaySizeFilterOptions,
  getInitialDisplaySizeFilter,
  matchesDisplaySizeFilter,
} from '../utils/displaySizeFilter'
import PcCard from './PcCard'

export default function PcList({ pcs: initialPcs, defaultCpu, defaultMaxDisplaySize, initialUsage = 'cafe', listing = 'new', device = 'notebook_pc', urlBasedUsage = false }: PcListProps) {
  const router = useRouter()
  const [selectedUsage, setSelectedUsage] = useState<ClientUsageCategory>(initialUsage)
  const [pcs, setPcs] = useState<ClientPcWithCpuSpec[]>(initialPcs)
  const [allPcs, setAllPcs] = useState<ClientPcWithCpuSpec[]>(initialPcs)
  const [loading, setLoading] = useState(false)
  const [sortOptions, setSortOptions] = useState<ClientSortOptions>({ field: 'pcScore', order: 'desc' })
  const [cpuOrderList, setCpuOrderList] = useState<string[]>([])
  const [selectedCpu, setSelectedCpu] = useState<string>(defaultCpu ?? 'all')
  const [selectedDisplaySize, setSelectedDisplaySize] = useState<string>(
    getInitialDisplaySizeFilter(defaultMaxDisplaySize)
  )
  const [isSortApplied, setIsSortApplied] = useState(false)

  const availableCpuOptions = useMemo(() => {
    const cpuSet = new Set(allPcs.map((pc) => pc.cpu).filter((cpu): cpu is string => Boolean(cpu)))

    if (cpuOrderList.length === 0) {
      return Array.from(cpuSet).sort()
    }

    const ordered = cpuOrderList.filter((cpu) => cpuSet.has(cpu))
    const missing = Array.from(cpuSet).filter((cpu) => !ordered.includes(cpu))

    return [...ordered, ...missing]
  }, [allPcs, cpuOrderList])

  const availableDisplaySizeOptions = useMemo(
    () => getDisplaySizeFilterOptions(allPcs, defaultMaxDisplaySize),
    [allPcs, defaultMaxDisplaySize]
  )

  const applyCpuFilterAndSort = useCallback((
    sourcePcs: ClientPcWithCpuSpec[],
    cpuName: string,
    displaySize: string,
    options: ClientSortOptions,
    sortApplied: boolean
  ) => {
    let filtered = cpuName === 'all' ? sourcePcs : sourcePcs.filter((pc) => pc.cpu === cpuName)

    if (displaySize !== 'all') {
      filtered = filtered.filter((pc) => matchesDisplaySizeFilter(pc, displaySize))
    }

    const displayed = sortApplied ? sortPcs(filtered, options, cpuOrderList) : filtered
    setPcs(displayed)
  }, [cpuOrderList])

  // initialPcsが変更されたときに基データを更新
  useEffect(() => {
    setAllPcs(initialPcs)
    setIsSortApplied(false)

    const initialCpuFilter = defaultCpu ?? 'all'
    const initialDisplayFilter = getInitialDisplaySizeFilter(defaultMaxDisplaySize)

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
        } else {
          console.error('Failed to fetch CPU list:', response.status)
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
        router.push(getPcListUsagePath(usage, listing, device))
      }
      return
    }

    setLoading(true)
    try {
      const newPcs = await fetchPcList(usage, listing, device)
      setAllPcs(newPcs)
      setSelectedCpu(defaultCpu ?? 'all')
      setSelectedDisplaySize(getInitialDisplaySizeFilter(defaultMaxDisplaySize))
      setIsSortApplied(false)
      const baseSortOptions: ClientSortOptions = { field: 'pcScore', order: 'desc' }
      setSortOptions(baseSortOptions)
      applyCpuFilterAndSort(
        newPcs,
        defaultCpu ?? 'all',
        getInitialDisplaySizeFilter(defaultMaxDisplaySize),
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

  return (
    <>
      <h1 className="pc-mobile-list__title" style={{ paddingLeft: '16px', fontSize: '24px', color: '#333', margin: '16px 0' }}>Amazon販売 PC 一覧スコア比較</h1>
      
      {/* 用途選択ボタン */}
      <div className="pc-mobile-list__usage" style={{ padding: '0 16px 16px 16px' }}>
        <h2 className="pc-mobile-list__section-title" style={{ fontSize: '16px', color: '#333', marginBottom: '12px', textAlign: 'center' }}>用途を選択</h2>
        <div className="pc-mobile-list__usage-grid" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <button 
            className="pc-mobile-list__usage-button"
            onClick={() => handleUsageChange('mobile')}
            disabled={loading}
            style={{
              padding: '12px 20px',
              borderRadius: '16px',
              border: 'none',
              background: selectedUsage === 'mobile' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                : 'linear-gradient(135deg, #667eea80 0%, #764ba280 100%)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: selectedUsage === 'mobile' 
                ? '0 4px 15px rgba(102, 126, 234, 0.3)' 
                : '0 2px 8px rgba(102, 126, 234, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              opacity: loading ? 0.7 : 1
            }}
            onMouseDown={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(0.98)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.4)'
              }
            }}
            onMouseUp={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = selectedUsage === 'mobile' 
                  ? '0 4px 15px rgba(102, 126, 234, 0.3)'
                  : '0 2px 8px rgba(102, 126, 234, 0.2)'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = selectedUsage === 'mobile' 
                  ? '0 4px 15px rgba(102, 126, 234, 0.3)'
                  : '0 2px 8px rgba(102, 126, 234, 0.2)'
              }
            }}>
            🚀 外出先でサッと使用
          </button>
          
          <button 
            className="pc-mobile-list__usage-button"
            onClick={() => handleUsageChange('cafe')}
            disabled={loading}
            style={{
              padding: '12px 20px',
              borderRadius: '16px',
              border: 'none',
              background: selectedUsage === 'cafe' 
                ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)' 
                : 'linear-gradient(135deg, #ff6b6b80 0%, #ee5a2480 100%)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: selectedUsage === 'cafe' 
                ? '0 4px 15px rgba(255, 107, 107, 0.3)' 
                : '0 2px 8px rgba(255, 107, 107, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              opacity: loading ? 0.7 : 1
            }}
            onMouseDown={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(0.98)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 107, 107, 0.4)'
              }
            }}
            onMouseUp={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = selectedUsage === 'cafe' 
                  ? '0 4px 15px rgba(255, 107, 107, 0.3)'
                  : '0 2px 8px rgba(255, 107, 107, 0.2)'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = selectedUsage === 'cafe' 
                  ? '0 4px 15px rgba(255, 107, 107, 0.3)'
                  : '0 2px 8px rgba(255, 107, 107, 0.2)'
              }
            }}>
            ☕ カフェで集中作業
          </button>
          
          <button 
            className="pc-mobile-list__usage-button"
            onClick={() => handleUsageChange('home')}
            disabled={loading}
            style={{
              padding: '12px 20px',
              borderRadius: '16px',
              border: 'none',
              background: selectedUsage === 'home' 
                ? 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)' 
                : 'linear-gradient(135deg, #4ecdc480 0%, #44a08d80 100%)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: selectedUsage === 'home' 
                ? '0 4px 15px rgba(78, 205, 196, 0.3)' 
                : '0 2px 8px rgba(78, 205, 196, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              opacity: loading ? 0.7 : 1
            }}
            onMouseDown={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(0.98)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(78, 205, 196, 0.4)'
              }
            }}
            onMouseUp={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = selectedUsage === 'home' 
                  ? '0 4px 15px rgba(78, 205, 196, 0.3)'
                  : '0 2px 8px rgba(78, 205, 196, 0.2)'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = selectedUsage === 'home' 
                  ? '0 4px 15px rgba(78, 205, 196, 0.3)'
                  : '0 2px 8px rgba(78, 205, 196, 0.2)'
              }
          }}>
            🏠 家でじっくり作業
          </button>

          <button
            className="pc-mobile-list__usage-button"
            onClick={() => handleUsageChange('cost_performance')}
            disabled={loading}
            style={{
              padding: '12px 20px',
              borderRadius: '16px',
              border: 'none',
              background: selectedUsage === 'cost_performance'
                ? 'linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%)'
                : 'linear-gradient(135deg, #0ea5e980 0%, #22c55e80 100%)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: selectedUsage === 'cost_performance'
                ? '0 4px 15px rgba(14, 165, 233, 0.3)'
                : '0 2px 8px rgba(14, 165, 233, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              opacity: loading ? 0.7 : 1
            }}
            onMouseDown={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(0.98)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(14, 165, 233, 0.4)'
              }
            }}
            onMouseUp={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = selectedUsage === 'cost_performance'
                  ? '0 4px 15px rgba(14, 165, 233, 0.3)'
                  : '0 2px 8px rgba(14, 165, 233, 0.2)'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = selectedUsage === 'cost_performance'
                  ? '0 4px 15px rgba(14, 165, 233, 0.3)'
                  : '0 2px 8px rgba(14, 165, 233, 0.2)'
              }
            }}>
            💰 コスパ
          </button>

          <button
            className="pc-mobile-list__usage-button"
            onClick={() => handleUsageChange('gaming')}
            disabled={loading}
            style={{
              padding: '12px 20px',
              borderRadius: '16px',
              border: 'none',
              background: selectedUsage === 'gaming'
                ? 'linear-gradient(135deg, #111827 0%, #ef4444 100%)'
                : 'linear-gradient(135deg, #11182780 0%, #ef444480 100%)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: selectedUsage === 'gaming'
                ? '0 4px 15px rgba(239, 68, 68, 0.3)'
                : '0 2px 8px rgba(239, 68, 68, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              opacity: loading ? 0.7 : 1
            }}
            onMouseDown={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(0.98)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.4)'
              }
            }}
            onMouseUp={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = selectedUsage === 'gaming'
                  ? '0 4px 15px rgba(239, 68, 68, 0.3)'
                  : '0 2px 8px rgba(239, 68, 68, 0.2)'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = selectedUsage === 'gaming'
                  ? '0 4px 15px rgba(239, 68, 68, 0.3)'
                  : '0 2px 8px rgba(239, 68, 68, 0.2)'
              }
            }}>
            🎮 ゲーム
          </button>

          <button
            className="pc-mobile-list__usage-button"
            onClick={() => handleUsageChange('video_editing')}
            disabled={loading}
            style={{
              padding: '12px 20px',
              borderRadius: '16px',
              border: 'none',
              background: selectedUsage === 'video_editing'
                ? 'linear-gradient(135deg, #0f766e 0%, #f59e0b 100%)'
                : 'linear-gradient(135deg, #0f766e80 0%, #f59e0b80 100%)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: selectedUsage === 'video_editing'
                ? '0 4px 15px rgba(15, 118, 110, 0.3)'
                : '0 2px 8px rgba(15, 118, 110, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              opacity: loading ? 0.7 : 1
            }}
            onMouseDown={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(0.98)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(15, 118, 110, 0.4)'
              }
            }}
            onMouseUp={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = selectedUsage === 'video_editing'
                  ? '0 4px 15px rgba(15, 118, 110, 0.3)'
                  : '0 2px 8px rgba(15, 118, 110, 0.2)'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = selectedUsage === 'video_editing'
                  ? '0 4px 15px rgba(15, 118, 110, 0.3)'
                  : '0 2px 8px rgba(15, 118, 110, 0.2)'
              }
            }}>
            🎬 動画編集
          </button>
      </div>
    </div>

      {/* フィルター */}
      <div className="pc-mobile-list__filters" style={{ padding: '0 16px 12px 16px' }}>
        <div
          className="pc-mobile-list__filter-grid"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: 'center'
          }}
        >
          <div
            className="pc-mobile-list__filter-control"
            style={{
              flex: '1 1 160px',
              maxWidth: '240px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <label className="pc-mobile-list__label" htmlFor="cpuFilter" style={{ fontSize: '14px', color: '#333' }}>
              CPUで絞り込み
            </label>
            <select
              className="pc-mobile-list__select"
              id="cpuFilter"
              value={selectedCpu}
              onChange={(event) => handleCpuFilterChange(event.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '10px',
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
            className="pc-mobile-list__filter-control"
            style={{
              flex: '1 1 140px',
              maxWidth: '200px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <label className="pc-mobile-list__label" htmlFor="displaySizeFilter" style={{ fontSize: '14px', color: '#333' }}>
              画面サイズで絞り込み
            </label>
            <select
              className="pc-mobile-list__select"
              id="displaySizeFilter"
              value={selectedDisplaySize}
              onChange={(event) => handleDisplaySizeChange(event.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '10px',
                border: '1px solid #ddd',
                fontSize: '13px',
                backgroundColor: '#fff',
                color: '#333'
              }}
            >
              <option value="all">すべて</option>
              {availableDisplaySizeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ソート機能 */}
      <div className="pc-mobile-list__sort" style={{ padding: '0 16px 16px 16px' }}>
        <h3 className="pc-mobile-list__section-title" style={{ fontSize: '16px', color: '#333', marginBottom: '12px', textAlign: 'center' }}>並び替え</h3>
        <div className="pc-mobile-list__sort-grid" style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          justifyContent: 'center'
        }}>
          {[
            { field: 'pcScore' as ClientSortField, label: 'スコア' },
            { field: 'cpu' as ClientSortField, label: 'CPU' },
            { field: 'gpu_score' as ClientSortField, label: 'GPU' },
            { field: 'ram' as ClientSortField, label: 'メモリ' },
            { field: 'rom' as ClientSortField, label: 'ストレージ' },
            { field: 'display_size' as ClientSortField, label: '画面サイズ' },
            { field: 'estimatedBatteryLifeHours' as ClientSortField, label: 'Excel駆動' },
            { field: 'weight' as ClientSortField, label: '重量' },
            { field: 'price' as ClientSortField, label: '価格' }
          ].map(({ field, label }) => {
            const isActive = sortOptions.field === field
            const isDesc = isActive && sortOptions.order === 'desc'
            
            return (
              <button
                key={field}
                className="pc-mobile-list__sort-button"
                onClick={() => handleSortChange(field)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '12px',
                  border: '1px solid #ddd',
                  backgroundColor: isActive ? '#f0f0f0' : 'white',
                  color: '#333',
                  fontSize: '12px',
                  fontWeight: isActive ? '600' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {label}
                <span style={{ fontSize: '10px' }}>
                  {isActive ? (isDesc ? '↓' : '↑') : ''}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ padding: '0 16px 16px 16px' }}>
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
        {!loading && pcs && pcs.map((pc) => (
          <PcCard key={pc.id} pc={pc} />
        ))}
      </div>

      <style jsx>{`
        @media (max-width: 767px) {
          .pc-mobile-list__title {
            padding-left: 12px !important;
            padding-right: 12px !important;
            margin: 10px 0 12px !important;
            font-size: 18px !important;
            line-height: 1.3 !important;
          }

          .pc-mobile-list__usage,
          .pc-mobile-list__filters,
          .pc-mobile-list__sort {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }

          .pc-mobile-list__usage {
            padding-bottom: 10px !important;
          }

          .pc-mobile-list__filters {
            padding-bottom: 8px !important;
          }

          .pc-mobile-list__sort {
            padding-bottom: 10px !important;
          }

          .pc-mobile-list__section-title {
            margin-bottom: 8px !important;
            font-size: 13px !important;
            line-height: 1.2 !important;
          }

          .pc-mobile-list__usage-grid {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px !important;
          }

          .pc-mobile-list__usage-button {
            min-height: 38px;
            padding: 8px 8px !important;
            border-radius: 12px !important;
            font-size: 12px !important;
            line-height: 1.25 !important;
            box-shadow: none !important;
          }

          .pc-mobile-list__filter-grid {
            gap: 8px !important;
          }

          .pc-mobile-list__filter-control {
            flex-basis: calc(50% - 4px) !important;
            max-width: none !important;
            gap: 4px !important;
          }

          .pc-mobile-list__label {
            font-size: 11px !important;
            line-height: 1.2 !important;
          }

          .pc-mobile-list__select {
            padding: 7px 8px !important;
            border-radius: 8px !important;
            font-size: 12px !important;
          }

          .pc-mobile-list__sort-grid {
            gap: 6px !important;
            justify-content: flex-start !important;
          }

          .pc-mobile-list__sort-button {
            padding: 6px 8px !important;
            border-radius: 9px !important;
            font-size: 11px !important;
            line-height: 1.2 !important;
            gap: 2px !important;
          }
        }
      `}</style>
    </>
  )
}
