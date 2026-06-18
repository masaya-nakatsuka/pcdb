'use client'

import { CSSProperties, ReactNode } from 'react'
import { blogStyles } from './BlogLayout'

interface BlogArticleProps {
  title: string
  date: string
  children: ReactNode
  variant?: 'standard' | 'wide'
}

interface BlogContentProps {
  children: ReactNode
  variant?: 'standard' | 'wide'
}

interface BlogSectionProps {
  title: string
  children: ReactNode
}

export function BlogArticle({ title, date, children, variant = 'standard' }: BlogArticleProps) {
  const articleStyle: CSSProperties = variant === 'wide'
    ? { ...blogStyles.article, ...blogStyles.articleWide }
    : blogStyles.article
  const headerStyle: CSSProperties = variant === 'wide'
    ? { ...blogStyles.articleHeader, ...blogStyles.articleHeaderWide }
    : blogStyles.articleHeader

  return (
    <article style={articleStyle}>
      <header style={headerStyle}>
        <div style={blogStyles.date}>
          {date}
        </div>
        <h1 style={blogStyles.title}>
          {title}
        </h1>
      </header>
      {children}
    </article>
  )
}

export function BlogContent({ children, variant = 'standard' }: BlogContentProps) {
  const contentStyle: CSSProperties = variant === 'wide'
    ? { ...blogStyles.content, ...blogStyles.contentWide }
    : blogStyles.content

  return (
    <div style={contentStyle}>
      {children}
    </div>
  )
}

export function BlogSection({ title, children }: BlogSectionProps) {
  return (
    <>
      <h2 style={blogStyles.h2}>
        {title}
      </h2>
      {children}
    </>
  )
}

export function BlogParagraph({ children }: { children: ReactNode }) {
  return (
    <p style={blogStyles.paragraph}>
      {children}
    </p>
  )
}

export function BlogList({ children }: { children: ReactNode }) {
  return (
    <ul style={blogStyles.list}>
      {children}
    </ul>
  )
}

export function BlogTable({ children }: { children: ReactNode }) {
  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      marginTop: '16px',
      marginBottom: '16px',
      overflowX: 'auto',
      overflowY: 'hidden'
    }}>
      <table style={{
        width: '100%',
        minWidth: '920px',
        borderCollapse: 'collapse',
        fontSize: '14px'
      }}>
        {children}
      </table>
    </div>
  )
}

export function BlogTableHeader({ children }: { children: ReactNode }) {
  return (
    <thead style={{
      backgroundColor: '#f8f9fa'
    }}>
      <tr>
        {children}
      </tr>
    </thead>
  )
}

export function BlogTableRow({ children }: { children: ReactNode }) {
  return (
    <tr style={{
      borderBottom: '1px solid #e5e7eb'
    }}>
      {children}
    </tr>
  )
}

export function BlogTableBody({ children }: { children: ReactNode }) {
  return (
    <tbody>
      {children}
    </tbody>
  )
}

export function BlogTableCell({ children, isHeader = false }: { children: ReactNode, isHeader?: boolean }) {
  const Tag = isHeader ? 'th' : 'td'
  return (
    <Tag style={{
      padding: '12px 16px',
      textAlign: 'left',
      fontWeight: isHeader ? '600' : 'normal',
      color: isHeader ? '#374151' : '#6b7280',
      verticalAlign: 'top'
    }}>
      {children}
    </Tag>
  )
}

export function BlogCallout({ children, type = 'info' }: { children: ReactNode, type?: 'info' | 'warning' | 'success' | 'error' }) {
  const getColors = () => {
    switch (type) {
      case 'warning':
        return {
          border: '#f59e0b',
          text: '#92400e'
        }
      case 'success':
        return {
            border: '#10b981',
          text: '#065f46'
        }
      case 'error':
        return {
          border: '#f87171',
          text: '#991b1b'
        }
      default: // info
        return {
          border: '#3b82f6',
          text: '#1e40af'
        }
    }
  }

  const colors = getColors()

  return (
    <div style={{
      border: `1px solid ${colors.border}`,
      borderLeft: `4px solid ${colors.border}`,
      borderRadius: '6px',
      padding: '16px',
      marginTop: '16px',
      marginBottom: '16px',
      color: colors.text
    }}>
      {children}
    </div>
  )
}

export function BlogHighlightBox({ children, title }: { children: ReactNode, title?: string }) {
  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '20px',
      marginTop: '16px',
      marginBottom: '16px'
    }}>
      {title && (
        <h4 style={{
          fontSize: '16px',
          fontWeight: '600',
          marginTop: 0,
          marginBottom: '12px',
          color: '#374151'
        }}>
          {title}
        </h4>
      )}
      <div style={{ color: '#6b7280' }}>
        {children}
      </div>
    </div>
  )
}

export function BlogQuote({ children }: { children: ReactNode }) {
  return (
    <blockquote style={{
      borderLeft: '4px solid #3b82f6',
      paddingLeft: '16px',
      margin: '16px 0',
      fontStyle: 'italic',
      color: '#6b7280',
      backgroundColor: '#f8fafc',
      padding: '16px',
      borderRadius: '0 6px 6px 0'
    }}>
      {children}
    </blockquote>
  )
}
