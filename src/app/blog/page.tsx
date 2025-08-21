'use client'

import BlogCard from '../../components/blog/BlogCard'
import { blogStyles } from '../../components/blog/BlogLayout'
import BlogNavLink from '../../components/blog/BlogNavLink'
import { blogArticles } from '../../lib/blogMetadata'

export default function BlogPage() {
  return (
    <div style={blogStyles.container}>
      {/* ヘッダー */}
      <div style={blogStyles.header}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '16px'
        }}>
          <BlogNavLink href="/">
            ← ホームに戻る
          </BlogNavLink>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          marginBottom: '32px',
          textAlign: 'center',
          color: '#333'
        }}>
          ブログ記事一覧
        </h1>

        <div style={{
          display: 'grid',
          gap: '24px'
        }}>
          {blogArticles.map((article) => (
            <BlogCard
              key={article.id}
              id={article.id}
              title={article.title}
              description={article.description}
              date={article.date}
            />
          ))}
        </div>
      </div>

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