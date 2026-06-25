import Link from 'next/link'
import ClientPcList from '@/app/pc-list/ClientPcList'
import { listedBlogArticles } from '@/lib/blogMetadata'
import BlogLayout from './BlogLayout'
import { BlogArticle, BlogContent, BlogParagraph } from './BlogArticle'
import type { ClientPcWithCpuSpec, ClientUsageCategory } from '../types'

interface SeseraArticleProps {
  articlePath: string
  title: string
  date: string
  bodyHtml: string
  faq: Array<{ question: string; answer: string }>
  pcs?: ClientPcWithCpuSpec[]
  listHref?: string
  listLabel?: string
}

function getCurrentArticleId(articlePath: string) {
  const match = articlePath.match(/article(\d+)$/)
  return match ? Number(match[1]) : null
}

function getInitialUsage(listHref?: string): ClientUsageCategory {
  if (!listHref) return 'cost_performance'
  if (listHref.includes('gaming')) return 'gaming'
  if (listHref.includes('video')) return 'video_editing'
  if (listHref.includes('mobile')) return 'mobile'
  if (listHref.includes('cost-performance')) return 'cost_performance'
  return 'cafe'
}

export default function SeseraArticle({
  articlePath,
  title,
  date,
  bodyHtml,
  faq,
  pcs,
  listHref,
  listLabel,
}: SeseraArticleProps) {
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
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
  const shouldShowPcList = pcs && pcs.length > 0

  return (
    <BlogLayout>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .sesera-body h2 {
              background: transparent;
              border: 0;
              border-radius: 0;
              box-sizing: border-box;
              color: #111827;
              font-size: 26px;
              font-weight: 800;
              letter-spacing: 0;
              line-height: 1.42;
              margin: 48px 0 18px;
              max-width: 920px;
              padding: 18px 0 0;
              position: relative;
            }

            .sesera-body h2::before {
              content: "";
              position: absolute;
              left: 0;
              top: 0;
              width: 34px;
              height: 2px;
              border-radius: 999px;
              background: #111827;
            }

            .sesera-body h2::after {
              content: none;
            }

            .specsy-blog-content > h2.sesera-section-heading {
              background: transparent !important;
              border: 0 !important;
              border-radius: 0 !important;
              box-sizing: border-box;
              color: #111827 !important;
              font-size: 26px !important;
              font-weight: 800 !important;
              letter-spacing: 0 !important;
              line-height: 1.42 !important;
              margin: 48px 0 18px !important;
              max-width: 920px;
              padding: 18px 0 0 !important;
              position: relative;
            }

            .specsy-blog-content > h2.sesera-section-heading::before {
              content: "";
              position: absolute;
              left: 0;
              top: 0;
              width: 34px;
              height: 2px;
              border-radius: 999px;
              background: #111827;
            }

            .specsy-blog-content > h2.sesera-section-heading::after {
              content: none !important;
              background: transparent !important;
            }

            .sesera-body p {
              line-height: 1.85;
              margin: 0 0 20px;
              max-width: 920px;
            }

            .sesera-body strong {
              font-weight: 800;
            }

            .sesera-body a {
              color: #2563eb;
              font-weight: 700;
              text-decoration: underline;
              text-underline-offset: 2px;
            }

            .sesera-body table {
              border-collapse: collapse;
              font-size: 14px;
              min-width: min(720px, 100%);
              width: 100%;
            }

            .sesera-body .sesera-table-wrap {
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              margin: 18px 0 22px;
              max-width: 100%;
              overflow-x: auto;
              overflow-y: hidden;
            }

            .sesera-body th,
            .sesera-body td {
              border-bottom: 1px solid #e5e7eb;
              padding: 12px 14px;
              text-align: left;
              vertical-align: top;
              word-break: break-word;
            }

            .sesera-body th {
              background: #f8f9fa;
              color: #374151;
              font-weight: 700;
            }

            .sesera-body td {
              color: #4b5563;
            }

            .sesera-body .sesera-point {
              background: #f8fafc;
              border: 1px solid #cbd5e1;
              border-left: 4px solid #2563eb;
              border-radius: 8px;
              box-sizing: border-box;
              margin: 18px 0 22px;
              max-width: 920px;
              padding: 16px 18px;
            }

            .sesera-body .sesera-point p:last-child,
            .sesera-body .sesera-related:last-child {
              margin-bottom: 0;
            }

            .sesera-body .sesera-related {
              color: #475569;
              font-size: 14px;
            }

            @media (max-width: 767px) {
              .sesera-body h2 {
                font-size: 22px;
                line-height: 1.45;
                margin: 40px 0 16px;
                padding-top: 16px;
              }

              .specsy-blog-content > h2.sesera-section-heading {
                font-size: 22px !important;
                line-height: 1.45 !important;
                margin: 40px 0 16px !important;
                padding-top: 16px !important;
              }

              .sesera-body h2::before,
              .specsy-blog-content > h2.sesera-section-heading::before {
                width: 28px;
              }
            }
          `,
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <BlogArticle title={title} date={date}>
        <BlogContent>
          <div className="sesera-body" dangerouslySetInnerHTML={{ __html: bodyHtml }} />

          <h2 className="sesera-section-heading">PC-DB関連記事</h2>
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

          <h2 className="sesera-section-heading">よくある質問</h2>
            {faq.map((item) => (
              <div key={item.question} style={{ marginBottom: '18px' }}>
                <h3 style={{ fontSize: '17px', margin: '0 0 6px', color: '#0f172a' }}>{item.question}</h3>
                <BlogParagraph>{item.answer}</BlogParagraph>
              </div>
            ))}
        </BlogContent>
      </BlogArticle>

      {shouldShowPcList && (
        <section
          aria-labelledby="sesera-pc-comparison-list"
          style={{
            maxWidth: 'min(1760px, calc(100vw - 24px))',
            width: '100%',
            boxSizing: 'border-box',
            margin: '0 auto',
            padding: '0 12px',
          }}
        >
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
            color: '#1f2937',
            padding: '32px clamp(16px, 2.4vw, 32px)',
          }}>
            <div style={{ maxWidth: '960px', marginBottom: '22px' }}>
              <h2
                id="sesera-pc-comparison-list"
                style={{
                  color: '#0f172a',
                  fontSize: '24px',
                  fontWeight: 800,
                  lineHeight: 1.35,
                  margin: '0 0 12px',
                }}
              >
                データで確認する
              </h2>
              <p style={{
                color: '#475569',
                fontSize: '15px',
                lineHeight: 1.8,
                margin: '0 0 16px',
              }}>
                目安は入口です。最後に、実際のPCを価格、CPU、メモリ、SSD、用途別スコアで並べて確認できます。
              </p>
              {listHref && listLabel && (
                <Link href={listHref} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 800,
                  textDecoration: 'none',
                }}>
                  {listLabel}
                </Link>
              )}
            </div>

            <ClientPcList
              pcs={pcs}
              initialUsage={getInitialUsage(listHref)}
              urlBasedUsage
              embeddedInArticle
            />
          </div>
        </section>
      )}
    </BlogLayout>
  )
}
