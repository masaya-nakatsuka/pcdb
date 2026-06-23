import { CSSProperties, ReactNode } from 'react'
import BlogNavLink from './BlogNavLink'

interface BlogLayoutProps {
  children: ReactNode
}

export const blogStyles: Record<string, CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9f9f9'
  },
  header: {
    backgroundColor: 'white',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    borderBottom: '1px solid #e5e7eb'
  },
  headerInner: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '16px',
    display: 'flex',
    gap: '16px'
  },
  navLink: {
    color: '#3b82f6',
    fontWeight: '500',
    textDecoration: 'none',
    transition: 'color 0.2s'
  },
  article: {
    maxWidth: '800px',
    width: '100%',
    boxSizing: 'border-box',
    margin: '0 auto',
    padding: '60px 30px'
  },
  articleWide: {
    maxWidth: 'min(1760px, calc(100vw - 24px))',
    padding: '48px 12px'
  },
  articleHeader: {
    marginBottom: '50px'
  },
  articleHeaderWide: {
    maxWidth: '1040px'
  },
  date: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '16px'
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    lineHeight: '1.2',
    color: '#333',
    margin: 0
  },
  content: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: 'clamp(24px, 6vw, 50px)',
    boxSizing: 'border-box',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    lineHeight: '1.6',
    fontSize: '16px',
    color: '#333'
  },
  contentWide: {
    width: '100%',
    padding: '40px clamp(18px, 2.5vw, 34px)'
  },
  h2: {
    fontSize: '24px',
    fontWeight: '600',
    marginTop: '40px',
    marginBottom: '20px',
    color: '#333',
    maxWidth: '920px'
  },
  paragraph: {
    marginBottom: '20px',
    maxWidth: '920px'
  },
  list: {
    paddingLeft: '20px',
    marginTop: '20px',
    marginBottom: '24px',
    maxWidth: '920px'
  }
}

export default function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <div style={blogStyles.container}>
      {/* ヘッダー */}
      <div style={blogStyles.header}>
        <div style={blogStyles.headerInner}>
          <BlogNavLink href="/">
            ← ホーム
          </BlogNavLink>
          <BlogNavLink href="/blog">
            ← ブログ一覧
          </BlogNavLink>
        </div>
      </div>

      {children}

      {/* フッター */}
      <div style={{
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #e9ecef',
        padding: '40px 20px',
        marginTop: '60px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          {/* アフィリエイト開示 */}
          <div style={{
            marginBottom: '24px',
            color: '#6c757d',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            <p style={{ margin: '0 0 8px 0' }}>
              Amazonのアソシエイトとして、当メディアは適格販売により収入を得ています。
            </p>
            <p style={{ margin: '0' }}>
              このサイトはアフィリエイト広告（Amazonアソシエイト含む）を掲載しています。
            </p>
          </div>

          {/* コピーライト */}
          <div style={{
            borderTop: '1px solid #e9ecef',
            paddingTop: '24px',
            color: '#6c757d',
            fontSize: '14px'
          }}>
            © 2025 Specsy. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  )
}
