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
    </div>
  )
}