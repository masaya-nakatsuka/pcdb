import { ReactNode } from 'react'
import BlogLayout from './BlogLayout'
import { BlogArticle, BlogContent, BlogParagraph, BlogSection } from './BlogArticle'

interface SeoArticleProps {
  title: string
  date: string
  lead: string
  children: ReactNode
}

export default function SeoArticle({ title, date, lead, children }: SeoArticleProps) {
  return (
    <BlogLayout>
      <BlogArticle title={title} date={date}>
        <BlogContent>
          <BlogParagraph>{lead}</BlogParagraph>
          {children}
        </BlogContent>
      </BlogArticle>
    </BlogLayout>
  )
}

interface DeviceSectionProps {
  deviceName: string
  children: ReactNode
}

export function DeviceSection({ deviceName, children }: DeviceSectionProps) {
  return (
    <BlogSection title={deviceName}>
      {children}
    </BlogSection>
  )
}

interface ProductPickProps {
  name: string
  specs?: string
  amazonUrl: string
  asin?: string
  imageUrl?: string
}

function addAffiliateTag(url: string): string {
  const AMAZON_TAG = 'nmsuteado2-22'
  
  try {
    const urlObj = new URL(url)
    if (!urlObj.hostname.includes('amazon.co.jp') && urlObj.hostname !== 'amzn.to') {
      return url
    }
    
    if (!urlObj.searchParams.has('tag')) {
      urlObj.searchParams.set('tag', AMAZON_TAG)
    }
    
    return urlObj.toString()
  } catch {
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}tag=${AMAZON_TAG}`
  }
}

export function ProductPick({ name, specs, amazonUrl, asin, imageUrl }: ProductPickProps) {
  const taggedUrl = addAffiliateTag(amazonUrl)
  
  const finalImageUrl = imageUrl || (asin ? `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._AC_SL240_.jpg` : null)
  
  return (
    <div style={{
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      backgroundColor: '#f8fafc',
      display: 'flex',
      gap: '16px',
      alignItems: 'flex-start',
    }}>
      {finalImageUrl && (
        <div style={{
          flexShrink: 0,
          width: '120px',
          height: '120px',
          backgroundColor: '#ffffff',
          borderRadius: '6px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <img
            src={finalImageUrl}
            alt={name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '15px',
          fontWeight: '700',
          color: '#0f172a',
          marginBottom: '8px',
        }}>
          {name}
        </div>
        {specs && (
          <div style={{
            fontSize: '13px',
            color: '#64748b',
            marginBottom: '10px',
          }}>
            {specs}
          </div>
        )}
        <a
          href={taggedUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '8px 16px',
            borderRadius: '6px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '700',
            textDecoration: 'none',
          }}
        >
          Amazonで見る
        </a>
      </div>
    </div>
  )
}
