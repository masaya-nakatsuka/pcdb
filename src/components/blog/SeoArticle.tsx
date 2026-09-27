import Link from 'next/link'
import { listedBlogArticles } from '@/lib/blogMetadata'
import BlogLayout from './BlogLayout'
import { BlogArticle, BlogContent, BlogSection } from './BlogArticle'

interface ProductPickProps {
  name: string
  specs?: string
  amazonUrl: string
  asin?: string
  imageUrl?: string
}

interface DeviceSectionProps {
  title: string
  devices: ProductPickProps[]
  children: React.ReactNode
}

interface SeoArticleProps {
  articlePath: string
  title: string
  date: string
  children: React.ReactNode
}

function ProductPick({ name, specs, amazonUrl, asin, imageUrl }: ProductPickProps) {
  const affiliateAmazonUrl = `${amazonUrl}${amazonUrl.includes('?') ? '&' : '?'}tag=specsy0a-22`
  
  const imageSource = imageUrl || (asin ? `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._AC_SL240_.jpg` : null)
  const hasImage = Boolean(imageSource)

  return (
    <div style={{
      display: 'flex',
      gap: hasImage ? '16px' : '0',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
      backgroundColor: '#ffffff',
    }}>
      {hasImage && imageSource && (
        <div style={{
          flexShrink: 0,
          width: '120px',
          height: '120px',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <img
            src={imageSource}
            alt={name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', lineHeight: 1.4 }}>
          {name}
        </div>
        {specs && (
          <div style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
            {specs}
          </div>
        )}
        <div>
          <a
            href={affiliateAmazonUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '8px 16px',
              backgroundColor: '#ff9900',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 700,
              borderRadius: '6px',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
            }}
          >
            Amazonで見る
          </a>
        </div>
      </div>
    </div>
  )
}

function DeviceSection({ title, devices, children }: DeviceSectionProps) {
  return (
    <section style={{ marginBottom: '48px' }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 800,
        color: '#0f172a',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '2px solid #e5e7eb',
      }}>
        {title}
      </h2>
      <div style={{
        fontSize: '15px',
        lineHeight: 1.8,
        color: '#374151',
        marginBottom: '24px',
      }}>
        {children}
      </div>
      <div>
        {devices.map((device, index) => (
          <ProductPick key={index} {...device} />
        ))}
      </div>
    </section>
  )
}

function getCurrentArticleId(articlePath: string) {
  const match = articlePath.match(/article(\d+)$/)
  return match ? Number(match[1]) : null
}

export default function SeoArticle({ articlePath, title, date, children }: SeoArticleProps) {
  const canonicalUrl = `https://specsy-hub.com${articlePath}`
  const currentArticleId = getCurrentArticleId(articlePath)
  const relatedArticles = listedBlogArticles
    .filter((article) => article.id !== currentArticleId)
    .slice(0, 4)

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    datePublished: date,
    dateModified: date,
    author: {
      '@type': 'Organization',
      name: 'Specsy',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Specsy',
    },
    mainEntityOfPage: canonicalUrl,
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'ホーム',
        item: 'https://specsy-hub.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'ブログ',
        item: 'https://specsy-hub.com/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: canonicalUrl,
      },
    ],
  }

  return (
    <BlogLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <BlogArticle title={title} date={date}>
        <BlogContent>
          {children}

          <BlogSection title="関連記事">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
              marginBottom: '16px',
            }}>
              {relatedArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/blog/article${article.id}`}
                  style={{
                    display: 'block',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '14px',
                    textDecoration: 'none',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 800, marginBottom: '6px' }}>
                    article{article.id}
                  </div>
                  <div style={{ color: '#1d4ed8', fontSize: '14px', lineHeight: 1.5, fontWeight: 800 }}>
                    {article.title}
                  </div>
                </Link>
              ))}
            </div>
          </BlogSection>
        </BlogContent>
      </BlogArticle>
    </BlogLayout>
  )
}

SeoArticle.ProductPick = ProductPick
SeoArticle.DeviceSection = DeviceSection
