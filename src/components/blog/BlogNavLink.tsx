'use client'

import Link from 'next/link'

interface BlogNavLinkProps {
  href: string
  children: React.ReactNode
}

export default function BlogNavLink({ href, children }: BlogNavLinkProps) {
  return (
    <Link 
      href={href}
      style={{
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
      {children}
    </Link>
  )
}