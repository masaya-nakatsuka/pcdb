'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PcListProps, ClientPcWithCpuSpec, ClientUsageCategory, ClientSortField, ClientSortOrder, ClientSortOptions } from '../types'
import { fetchPcList } from '../../app/pc-list/fetchPcs'
import { getPcListUsageUrl } from '../../app/pc-list/usageConfig'
import { sortPcs } from '../utils/pcSort'
import PcListSummary from '../pc-list/PcListSummary'
import PcQuickFilters from '../pc-list/PcQuickFilters'
import PcListEmptyState from '../pc-list/PcListEmptyState'
import { applyPcQuickFilters, getPcQuickFilterLabel, type PcQuickFilterKey } from '../utils/pcQuickFilters'
import { matchesPcSearchQuery, normalizePcSearchQuery } from '../utils/pcSearch'
import PcCard from './PcCard'

export default function PcList({ pcs: initialPcs, defaultCpu, defaultMaxDisplaySize, initialUsage = 'cafe', initialQuickFilters, initialSearchQuery = '', listing = 'new', urlBasedUsage = false }: PcListProps) {
  const router = useRouter()
  const initialQuickFilterValues = useMemo(() => initialQuickFilters ?? [], [initialQuickFilters])
  const initialSearchValue = normalizePcSearchQuery(initialSearchQuery)
  const [selectedUsage, setSelectedUsage] = useState<ClientUsageCategory>(initialUsage)
  const [pcs, setPcs] = useState<ClientPcWithCpuSpec[]>(initialPcs)
  const [allPcs, setAllPcs] = useState<ClientPcWithCpuSpec[]>(initialPcs)
  const [loading, setLoading] = useState(false)
  const [sortOptions, setSortOptions] = useState<ClientSortOptions>({ field: 'pcScore', order: 'desc' })
  const [cpuOrderList, setCpuOrderList] = useState<string[]>([])
  const [selectedCpu, setSelectedCpu] = useState<string>(defaultCpu ?? 'all')
  const [selectedDisplaySize, setSelectedDisplaySize] = useState<string>(
    defaultMaxDisplaySize ? `max:${defaultMaxDisplaySize}` : 'all'
  )
  const [searchQuery, setSearchQuery] = useState(initialSearchValue)
  const [activeQuickFilters, setActiveQuickFilters] = useState<PcQuickFilterKey[]>(initialQuickFilterValues)
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

  const quickFilterScopePcs = useMemo(() => {
    let filtered = selectedCpu === 'all' ? allPcs : allPcs.filter((pc) => pc.cpu === selectedCpu)

    if (selectedDisplaySize.startsWith('max:')) {
      const limit = Number(selectedDisplaySize.replace('max:', ''))
      filtered = filtered.filter((pc) =>
        typeof pc.display_size === 'number' ? pc.display_size <= limit : false
      )
    } else if (selectedDisplaySize !== 'all') {
      const targetSize = Number(selectedDisplaySize)
      filtered = filtered.filter((pc) => pc.display_size === targetSize)
    }

    return filtered.filter((pc) => matchesPcSearchQuery(pc, searchQuery))
  }, [allPcs, selectedCpu, selectedDisplaySize, searchQuery])

  const activeQuickFilterLabels = useMemo(
    () => activeQuickFilters.map(getPcQuickFilterLabel),
    [activeQuickFilters]
  )

  const applyCpuFilterAndSort = useCallback((
    sourcePcs: ClientPcWithCpuSpec[],
    cpuName: string,
    displaySize: string,
    keyword: string,
    quickFilters: PcQuickFilterKey[],
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

    filtered = filtered.filter((pc) => matchesPcSearchQuery(pc, keyword))
    filtered = applyPcQuickFilters(filtered, quickFilters)

    const displayed = sortApplied ? sortPcs(filtered, options, cpuOrderList) : filtered
    setPcs(displayed)
  }, [cpuOrderList])

  const replaceListUrl = useCallback((filters: PcQuickFilterKey[], keyword: string) => {
    if (!urlBasedUsage || typeof window === 'undefined') {
      return
    }

    const params = new URLSearchParams(window.location.search)
    params.delete('preset')

    if (filters.length > 0) {
      params.set('filters', filters.join(','))
    } else {
      params.delete('filters')
    }

    const normalizedKeyword = normalizePcSearchQuery(keyword)
    if (normalizedKeyword) {
      params.set('q', normalizedKeyword)
    } else {
      params.delete('q')
    }

    const query = params.toString()
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
    window.history.replaceState(null, '', nextUrl)
  }, [urlBasedUsage])

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
    setSearchQuery(initialSearchValue)
    setActiveQuickFilters(initialQuickFilterValues)
    setSelectedUsage(initialUsage)
    applyCpuFilterAndSort(initialPcs, initialCpuFilter, initialDisplayFilter, initialSearchValue, initialQuickFilterValues, baseSortOptions, false)
  }, [initialPcs, defaultCpu, defaultMaxDisplaySize, initialUsage, initialQuickFilterValues, initialSearchValue, applyCpuFilterAndSort])

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
        const params = new URLSearchParams()
        if (activeQuickFilters.length > 0) {
          params.set('filters', activeQuickFilters.join(','))
        }
        if (searchQuery) {
          params.set('q', searchQuery)
        }
        router.push(getPcListUsageUrl(usage, params, listing))
      }
      return
    }

    setLoading(true)
    try {
      const newPcs = await fetchPcList(usage, listing)
      setAllPcs(newPcs)
      setSelectedCpu(defaultCpu ?? 'all')
      setSelectedDisplaySize(defaultMaxDisplaySize ? `max:${defaultMaxDisplaySize}` : 'all')
      setSearchQuery(initialSearchValue)
      setActiveQuickFilters(initialQuickFilterValues)
      setIsSortApplied(false)
      const baseSortOptions: ClientSortOptions = { field: 'pcScore', order: 'desc' }
      setSortOptions(baseSortOptions)
      applyCpuFilterAndSort(
        newPcs,
        defaultCpu ?? 'all',
        defaultMaxDisplaySize ? `max:${defaultMaxDisplaySize}` : 'all',
        initialSearchValue,
        initialQuickFilterValues,
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

    applyCpuFilterAndSort(allPcs, selectedCpu, selectedDisplaySize, searchQuery, activeQuickFilters, newSortOptions, true)
  }

  const handleCpuFilterChange = (cpuName: string) => {
    setSelectedCpu(cpuName)
    applyCpuFilterAndSort(allPcs, cpuName, selectedDisplaySize, searchQuery, activeQuickFilters, sortOptions, isSortApplied)
  }

  const handleDisplaySizeChange = (size: string) => {
    setSelectedDisplaySize(size)
    applyCpuFilterAndSort(allPcs, selectedCpu, size, searchQuery, activeQuickFilters, sortOptions, isSortApplied)
  }

  const handleSearchQueryChange = (value: string) => {
    const nextSearchQuery = value.slice(0, 80)
    setSearchQuery(nextSearchQuery)
    replaceListUrl(activeQuickFilters, nextSearchQuery)
    applyCpuFilterAndSort(allPcs, selectedCpu, selectedDisplaySize, nextSearchQuery, activeQuickFilters, sortOptions, isSortApplied)
  }

  const handleQuickFilterToggle = (filter: PcQuickFilterKey) => {
    const nextFilters = activeQuickFilters.includes(filter)
      ? activeQuickFilters.filter((item) => item !== filter)
      : [...activeQuickFilters, filter]

    setActiveQuickFilters(nextFilters)
    replaceListUrl(nextFilters, searchQuery)
    applyCpuFilterAndSort(allPcs, selectedCpu, selectedDisplaySize, searchQuery, nextFilters, sortOptions, isSortApplied)
  }

  const handleQuickFilterClear = () => {
    setActiveQuickFilters([])
    replaceListUrl([], searchQuery)
    applyCpuFilterAndSort(allPcs, selectedCpu, selectedDisplaySize, searchQuery, [], sortOptions, isSortApplied)
  }

  const handleQuickFilterPreset = (filters: PcQuickFilterKey[]) => {
    setActiveQuickFilters(filters)
    replaceListUrl(filters, searchQuery)
    applyCpuFilterAndSort(allPcs, selectedCpu, selectedDisplaySize, searchQuery, filters, sortOptions, isSortApplied)
  }

  const handleAllFiltersClear = () => {
    const initialCpuFilter = defaultCpu ?? 'all'
    const initialDisplayFilter = defaultMaxDisplaySize ? `max:${defaultMaxDisplaySize}` : 'all'
    const baseSortOptions: ClientSortOptions = { field: 'pcScore', order: 'desc' }

    setSelectedCpu(initialCpuFilter)
    setSelectedDisplaySize(initialDisplayFilter)
    setSearchQuery('')
    setActiveQuickFilters([])
    replaceListUrl([], '')
    setSortOptions(baseSortOptions)
    setIsSortApplied(false)
    applyCpuFilterAndSort(allPcs, initialCpuFilter, initialDisplayFilter, '', [], baseSortOptions, false)
  }

  useEffect(() => {
    if (isSortApplied && sortOptions.field === 'cpu') {
      applyCpuFilterAndSort(allPcs, selectedCpu, selectedDisplaySize, searchQuery, activeQuickFilters, sortOptions, true)
    }
  }, [cpuOrderList, isSortApplied, sortOptions, allPcs, selectedCpu, selectedDisplaySize, searchQuery, activeQuickFilters, applyCpuFilterAndSort])

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

          <button
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
              flex: '1 1 220px',
              maxWidth: '440px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <label htmlFor="pcSearchQuery" style={{ fontSize: '14px', color: '#333' }}>
              キーワードで絞り込み
            </label>
            <input
              id="pcSearchQuery"
              type="search"
              value={searchQuery}
              onChange={(event) => handleSearchQueryChange(event.target.value)}
              placeholder="例: Ryzen / Lenovo / 16GB"
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '10px',
                border: '1px solid #ddd',
                fontSize: '13px',
                backgroundColor: '#fff',
                color: '#333'
              }}
            />
          </div>

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

      <div style={{ padding: '0 16px 16px 16px' }}>
        <PcQuickFilters
          pcs={quickFilterScopePcs}
          activeFilters={activeQuickFilters}
          onToggle={handleQuickFilterToggle}
          onApplyPreset={handleQuickFilterPreset}
          onClear={handleQuickFilterClear}
        />
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
        <PcListSummary
          pcs={pcs}
          selectedCpu={selectedCpu}
          selectedDisplaySize={selectedDisplaySize}
          searchQuery={searchQuery}
          activeQuickFilterLabels={activeQuickFilterLabels}
        />
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
        {!loading && pcs.length === 0 && (
          <PcListEmptyState
            activeQuickFilterLabels={activeQuickFilterLabels}
            searchQuery={searchQuery}
            hasAnyFilters={
              selectedCpu !== (defaultCpu ?? 'all') ||
              selectedDisplaySize !== (defaultMaxDisplaySize ? `max:${defaultMaxDisplaySize}` : 'all') ||
              searchQuery.trim().length > 0 ||
              activeQuickFilters.length > 0
            }
            onClearFilters={handleAllFiltersClear}
          />
        )}

        {!loading && pcs.length > 0 && pcs.map((pc) => (
          <PcCard key={pc.id} pc={pc} />
        ))}
      </div>
    </>
  )
}
