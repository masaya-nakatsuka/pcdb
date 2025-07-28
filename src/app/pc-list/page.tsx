'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { fetchPcList } from './fetchPcs'
import { ClientPcWithCpuSpec } from '../../components/types'
import ClientPcList from './ClientPcList'

function BackLink() {
  return (
    <Link 
      href="/"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        color: '#3b82f6',
        fontWeight: '500',
        textDecoration: 'none',
        transition: 'color 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = '#1d4ed8'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = '#3b82f6'
      }}
    >
      ← ホームに戻る
    </Link>
  )
}

export default function PcListPage() {
  const [pcs, setPcs] = useState<ClientPcWithCpuSpec[]>([])

  useEffect(() => {
    fetchPcList('cafe')
      .then(setPcs)
      .catch(error => console.error('Failed to fetch PCs:', error))
  }, [])

  return (
    <div>
      <div style={{
        backgroundColor: 'white',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '16px'
        }}>
          <BackLink />
        </div>
      </div>
      <ClientPcList pcs={pcs} />
    </div>
  )
}