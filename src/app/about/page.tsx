'use client'

import Link from 'next/link'

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      {/* ヘッダー */}
      <div style={{
        backgroundColor: 'white',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '16px',
          display: 'flex',
          gap: '16px'
        }}>
          <Link 
            href="/"
            style={{
              color: '#3b82f6',
              fontWeight: '500',
              textDecoration: 'none'
            }}
          >
            ← ホーム
          </Link>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '60px 30px'
      }}>
        <header style={{ marginBottom: '50px' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            lineHeight: '1.2',
            color: '#333',
            margin: 0,
            textAlign: 'center'
          }}>
            運営者情報
          </h1>
        </header>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '50px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          lineHeight: '1.9',
          fontSize: '16px',
          color: '#333'
        }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              marginTop: '0',
              marginBottom: '20px',
              color: '#333'
            }}>
              サイト概要
            </h2>
            <div style={{
              display: 'grid',
              gap: '12px',
              fontSize: '16px'
            }}>
              <div style={{ display: 'flex' }}>
                <span style={{ fontWeight: '600', minWidth: '120px' }}>サイト名:</span>
                <span>Specsy（スペクシー）</span>
              </div>
              <div style={{ display: 'flex' }}>
                <span style={{ fontWeight: '600', minWidth: '120px' }}>URL:</span>
                <span>https://specsy-hub.com</span>
              </div>
              <div style={{ display: 'flex' }}>
                <span style={{ fontWeight: '600', minWidth: '120px' }}>サービス内容:</span>
                <span>パソコン比較・情報提供サイト</span>
              </div>
              <div style={{ display: 'flex' }}>
                <span style={{ fontWeight: '600', minWidth: '120px' }}>開設年:</span>
                <span>2025年</span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              marginTop: '40px',
              marginBottom: '20px',
              color: '#333'
            }}>
              運営者情報
            </h2>
            <div style={{
              display: 'grid',
              gap: '12px',
              fontSize: '16px'
            }}>
              <div style={{ display: 'flex' }}>
                <span style={{ fontWeight: '600', minWidth: '120px' }}>運営者:</span>
                <span>Specsy運営チーム</span>
              </div>
              <div style={{ display: 'flex' }}>
                <span style={{ fontWeight: '600', minWidth: '120px' }}>連絡先:</span>
                <span>contact@specsy-hub.com</span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              marginTop: '40px',
              marginBottom: '20px',
              color: '#333'
            }}>
              サイトの目的
            </h2>
            <p style={{ marginBottom: '20px' }}>
              Specsyは、パソコン選びに悩む多くの方に向けて、客観的で分かりやすい情報を提供することを目的としています。
            </p>
            <p style={{ marginBottom: '20px' }}>
              複雑なスペック情報を独自のスコアリングシステムで数値化し、用途に応じた最適なパソコン選びをサポートします。
            </p>
            <ul style={{
              paddingLeft: '20px',
              marginTop: '20px',
              marginBottom: '24px'
            }}>
              <li>Amazon等で販売されているPCの性能比較</li>
              <li>用途別のおすすめPC提案</li>
              <li>PC選びに関する技術記事の提供</li>
              <li>初心者にも分かりやすい情報発信</li>
            </ul>
          </div>

          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              marginTop: '40px',
              marginBottom: '20px',
              color: '#333'
            }}>
              免責事項
            </h2>
            <p style={{ marginBottom: '20px' }}>
              当サイトに掲載されている情報の正確性については細心の注意を払っておりますが、その内容の正確性・安全性を保証するものではありません。
            </p>
            <p style={{ marginBottom: '20px' }}>
              当サイトに掲載された内容によって生じた損害等の一切の責任を負いかねますので、ご了承ください。
            </p>
            <p style={{ marginBottom: '0' }}>
              商品の価格や仕様等の情報は変更される場合があります。最新の情報については各ECサイト等でご確認ください。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}