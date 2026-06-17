import Link from 'next/link'
import ClientPcList from '@/app/pc-list/ClientPcList'
import { BlogArticle, BlogContent, BlogList, BlogParagraph, BlogSection, BlogTable, BlogTableBody, BlogTableCell, BlogTableHeader, BlogTableRow } from './BlogArticle'
import BlogLayout from './BlogLayout'
import type { ClientPcWithCpuSpec, ClientUsageCategory } from '../types'

interface PcDbArticleProps {
  articlePath: string
  title: string
  date: string
  lead: string
  usage: ClientUsageCategory
  listHref: string
  listLabel: string
  conclusionTitle: string
  conclusion: string
  criteriaTitle: string
  criteria: string[]
  dataAngleTitle: string
  dataAngle: string
  faq: Array<{ question: string; answer: string }>
  pcs: ClientPcWithCpuSpec[]
}

function priceOf(pc: ClientPcWithCpuSpec) {
  return pc.real_price || pc.price || null
}

function formatPrice(price: number | null) {
  return price ? `${price.toLocaleString('ja-JP')}円` : '-'
}

function formatScore(score: number | null) {
  return score === null ? '-' : `${Math.round(score)}`
}

function formatBattery(pc: ClientPcWithCpuSpec) {
  const hours = pc.batteryLifeProfiles?.excelWorkHours ?? pc.estimatedBatteryLifeHours
  return hours ? `${hours.toFixed(1)}時間` : '-'
}

function formatStorage(pc: ClientPcWithCpuSpec) {
  const ram = pc.ram ? `${pc.ram}GB` : '-'
  const rom = pc.rom ? `${pc.rom}GB` : '-'
  return `${ram} / ${rom}`
}

function getLowestPrice(pcs: ClientPcWithCpuSpec[]) {
  const prices = pcs.map(priceOf).filter((price): price is number => Boolean(price))
  return prices.length > 0 ? Math.min(...prices) : null
}

function getTopScore(pcs: ClientPcWithCpuSpec[]) {
  const scores = pcs.map((pc) => pc.pcScore).filter((score): score is number => score !== null)
  return scores.length > 0 ? Math.max(...scores) : null
}

export default function PcDbArticle({
  articlePath,
  title,
  date,
  lead,
  usage,
  listHref,
  listLabel,
  conclusionTitle,
  conclusion,
  criteriaTitle,
  criteria,
  dataAngleTitle,
  dataAngle,
  faq,
  pcs,
}: PcDbArticleProps) {
  const topPcs = pcs.slice(0, 5)
  const lowestPrice = getLowestPrice(pcs)
  const topScore = getTopScore(pcs)
  const canonicalUrl = `https://specsy-hub.com${articlePath}`
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

  return (
    <BlogLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <BlogArticle title={title} date={date}>
        <BlogContent>
          <BlogParagraph>{lead}</BlogParagraph>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
            margin: '20px 0 8px',
          }}>
            {[
              { label: 'DB掲載候補', value: `${pcs.length}件` },
              { label: '価格下限', value: formatPrice(lowestPrice) },
              { label: '最高スコア', value: formatScore(topScore) },
            ].map((item) => (
              <div key={item.label} style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '14px',
                backgroundColor: '#f8fafc',
              }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '6px' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '20px', color: '#0f172a', fontWeight: 800 }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <BlogSection title={conclusionTitle}>
            <BlogParagraph>{conclusion}</BlogParagraph>
          </BlogSection>

          <BlogSection title="PC-DB上位候補">
            <BlogParagraph>
              下表は、現在のPC-DBを用途別スコアで並べた上位候補です。価格・CPU・GPU・メモリ・SSD・推定駆動時間を同じ軸で見られるため、単なる一般論ではなく、実際の候補比較から判断できます。
            </BlogParagraph>
            {topPcs.length > 0 ? (
              <BlogTable>
                <BlogTableHeader>
                  <BlogTableCell isHeader>順位</BlogTableCell>
                  <BlogTableCell isHeader>製品</BlogTableCell>
                  <BlogTableCell isHeader>CPU / GPU</BlogTableCell>
                  <BlogTableCell isHeader>RAM / SSD</BlogTableCell>
                  <BlogTableCell isHeader>推定駆動</BlogTableCell>
                  <BlogTableCell isHeader>価格</BlogTableCell>
                  <BlogTableCell isHeader>スコア</BlogTableCell>
                </BlogTableHeader>
                <BlogTableBody>
                  {topPcs.map((pc, index) => (
                    <BlogTableRow key={pc.id}>
                      <BlogTableCell>{index + 1}</BlogTableCell>
                      <BlogTableCell>{pc.brand ? `${pc.brand} ` : ''}{pc.name || '-'}</BlogTableCell>
                      <BlogTableCell>{pc.cpu || '-'} / {pc.gpu || '-'}</BlogTableCell>
                      <BlogTableCell>{formatStorage(pc)}</BlogTableCell>
                      <BlogTableCell>{formatBattery(pc)}</BlogTableCell>
                      <BlogTableCell>{formatPrice(priceOf(pc))}</BlogTableCell>
                      <BlogTableCell>{formatScore(pc.pcScore)}</BlogTableCell>
                    </BlogTableRow>
                  ))}
                </BlogTableBody>
              </BlogTable>
            ) : (
              <BlogParagraph>
                現在、この条件で表示できるPC候補がありません。データ更新後に再確認してください。
              </BlogParagraph>
            )}
          </BlogSection>

          <BlogSection title={criteriaTitle}>
            <BlogList>
              {criteria.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </BlogList>
          </BlogSection>

          <BlogSection title={dataAngleTitle}>
            <BlogParagraph>{dataAngle}</BlogParagraph>
          </BlogSection>

          <BlogSection title="最新ランキングで確認">
            <BlogParagraph>
              記事内の表は要点確認用です。全候補の並び替え、CPU/GPU確認、価格比較は専用ランキングで確認できます。
            </BlogParagraph>
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
              marginBottom: '16px',
            }}>
              {listLabel}
            </Link>
            <div style={{ marginTop: '12px' }}>
              <ClientPcList pcs={pcs} initialUsage={usage} urlBasedUsage />
            </div>
          </BlogSection>

          <BlogSection title="よくある質問">
            {faq.map((item) => (
              <div key={item.question} style={{ marginBottom: '18px' }}>
                <h3 style={{ fontSize: '17px', margin: '0 0 6px', color: '#0f172a' }}>{item.question}</h3>
                <BlogParagraph>{item.answer}</BlogParagraph>
              </div>
            ))}
          </BlogSection>
        </BlogContent>
      </BlogArticle>
    </BlogLayout>
  )
}
