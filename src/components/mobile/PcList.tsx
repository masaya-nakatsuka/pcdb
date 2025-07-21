'use client'

import { useState } from 'react'
import { PcListProps } from '../../shared/types/components'
import { PcWithCpuSpec, UsageCategory } from '../../shared/types/pc'
import { fetchPcList } from '../../app/pc-list/fetchPcs'
import PcCard from './PcCard'

interface PcListWithUsageProps extends PcListProps {
  initialPcs: PcWithCpuSpec[]
}

export default function PcList({ pcs: initialPcs }: { pcs: PcWithCpuSpec[] }) {
  const [selectedUsage, setSelectedUsage] = useState<UsageCategory>('cafe')
  const [pcs, setPcs] = useState<PcWithCpuSpec[]>(initialPcs)
  const [loading, setLoading] = useState(false)

  const handleUsageChange = async (usage: UsageCategory) => {
    setLoading(true)
    try {
      const newPcs = await fetchPcList(usage)
      setPcs(newPcs)
      setSelectedUsage(usage)
    } catch (error) {
      console.error('Failed to fetch PCs for usage:', usage, error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <>
      <h1 style={{ paddingLeft: '16px', fontSize: '24px', color: '#333', margin: '16px 0' }}>PC List</h1>
      
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
        {!loading && pcs.map((pc) => (
          <PcCard key={pc.id} pc={pc} />
        ))}
      </div>
    </>
  )
}