'use client'

import Link from 'next/link'

interface BlogCardProps {
  id: number
  title: string
  description: string
  date: string
}

export default function BlogCard({ id, title, description, date }: BlogCardProps) {
  return (
    <div 
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      <Link href={`/blog/article${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div>
          <div style={{
            fontSize: '12px',
            color: '#666',
            marginBottom: '8px'
          }}>
            {date}
          </div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '12px',
            color: '#333'
          }}>
            {title}
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#666',
            lineHeight: '1.6',
            margin: 0
          }}>
            {description}
          </p>
        </div>
      </Link>
    </div>
  )
}