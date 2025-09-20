'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { PcListProps, ClientPcWithCpuSpec, ClientUsageCategory, ClientSortField, ClientSortOrder, ClientSortOptions } from '../types'
import { fetchPcList } from '../../app/pc-list/fetchPcs'
import { sortPcs } from '../utils/pcSort'
import PcCard from './PcCard'

export default function PcList({ pcs: initialPcs, defaultCpu, defaultMaxDisplaySize }: PcListProps) {
  const [selectedUsage, setSelectedUsage] = useState<ClientUsageCategory>('cafe')
  const [pcs, setPcs] = useState<ClientPcWithCpuSpec[]>(initialPcs)
  const [allPcs, setAllPcs] = useState<ClientPcWithCpuSpec[]>(initialPcs)
  const [loading, setLoading] = useState(false)
  const [sortOptions, setSortOptions] = useState<ClientSortOptions>({ field: 'pcScore', order: 'desc' })
  const [cpuOrderList, setCpuOrderList] = useState<string[]>([])
  const [selectedCpu, setSelectedCpu] = useState<string>(defaultCpu ?? 'all')
  const [selectedDisplaySize, setSelectedDisplaySize] = useState<string>(
    defaultMaxDisplaySize ? `max:${defaultMaxDisplaySize}` : 'all'
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
    applyCpuFilterAndSort(initialPcs, initialCpuFilter, initialDisplayFilter, baseSortOptions, false)
  }, [initialPcs, defaultCpu, defaultMaxDisplaySize, applyCpuFilterAndSort])

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
      <h1 style={{ paddingLeft: '16px', fontSize: '24px', color: '#333', margin: '16px 0' }}>Amazon販売 PC 一覧スコア比較</h1>
      
      {/* 用途選択ボタン */}
      <div style={{ padding: '0 16px 16px 16px' }}>
        <h2 style={{ fontSize: '16px', color: '#333', marginBottom: '12px', textAlign: 'center' }}>用途を選択</h2>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px',
        }}>
          <button 
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
      </div>
    </div>

      {/* フィルター */}
      <div style={{ padding: '0 16px 12px 16px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              flex: '1 1 160px',
              maxWidth: '240px',
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
            style={{
              flex: '1 1 140px',
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
                borderRadius: '10px',
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
      </div>

      {/* ソート機能 */}
      <div style={{ padding: '0 16px 16px 16px' }}>
        <h3 style={{ fontSize: '16px', color: '#333', marginBottom: '12px', textAlign: 'center' }}>並び替え</h3>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
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
    </>
  )
}
