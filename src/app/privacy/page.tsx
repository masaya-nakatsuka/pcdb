'use client'

import Link from 'next/link'

export default function PrivacyPage() {
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
            プライバシーポリシー
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
          <p style={{ marginBottom: '20px' }}>
            Specsy（以下「当サイト」）は、ユーザーの個人情報の保護に努めており、以下のプライバシーポリシーに従って個人情報を取り扱います。
          </p>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              marginTop: '40px',
              marginBottom: '20px',
              color: '#333'
            }}>
              1. 収集する情報
            </h2>
            <p style={{ marginBottom: '20px' }}>
              当サイトでは、サービス提供のために以下の情報を収集する場合があります：
            </p>
            <ul style={{
              paddingLeft: '20px',
              marginTop: '20px',
              marginBottom: '24px'
            }}>
              <li>アクセスログ（IPアドレス、ブラウザ情報、アクセス日時など）</li>
              <li>サイト利用状況（閲覧ページ、滞在時間、クリック情報など）</li>
              <li>お問い合わせ時に提供いただく情報（メールアドレス、お名前、お問い合わせ内容など）</li>
              <li>Cookie及び類似技術により収集される情報</li>
            </ul>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              marginTop: '40px',
              marginBottom: '20px',
              color: '#333'
            }}>
              2. 情報の利用目的
            </h2>
            <p style={{ marginBottom: '20px' }}>
              収集した情報は以下の目的で利用します：
            </p>
            <ul style={{
              paddingLeft: '20px',
              marginTop: '20px',
              marginBottom: '24px'
            }}>
              <li>サービスの提供・改善</li>
              <li>ユーザーサポート・お問い合わせへの対応</li>
              <li>利用状況の分析・統計情報の作成</li>
              <li>サイトの安全性・セキュリティの確保</li>
              <li>法令に基づく対応</li>
            </ul>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              marginTop: '40px',
              marginBottom: '20px',
              color: '#333'
            }}>
              3. 第三者への提供
            </h2>
            <p style={{ marginBottom: '20px' }}>
              当サイトは、以下の場合を除き、個人情報を第三者に提供することはありません：
            </p>
            <ul style={{
              paddingLeft: '20px',
              marginTop: '20px',
              marginBottom: '24px'
            }}>
              <li>ユーザーの同意がある場合</li>
              <li>法令に基づく場合</li>
              <li>人の生命、身体または財産の保護のために必要がある場合</li>
              <li>サービス提供に必要な範囲で業務委託先に提供する場合（適切な管理下において）</li>
            </ul>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              marginTop: '40px',
              marginBottom: '20px',
              color: '#333'
            }}>
              4. Cookieについて
            </h2>
            <p style={{ marginBottom: '20px' }}>
              当サイトでは、サービス向上のためにCookieを使用しています：
            </p>
            <ul style={{
              paddingLeft: '20px',
              marginTop: '20px',
              marginBottom: '24px'
            }}>
              <li>サイトの利用状況を把握し、ユーザー体験の改善を図るため</li>
              <li>広告配信の最適化のため（第三者配信事業者による場合を含む）</li>
              <li>アクセス解析のため（Google Analyticsなど）</li>
            </ul>
            <p style={{ marginBottom: '20px' }}>
              Cookieの設定は、ブラウザの設定により無効にすることが可能ですが、一部機能が利用できなくなる場合があります。
            </p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              marginTop: '40px',
              marginBottom: '20px',
              color: '#333'
            }}>
              5. アクセス解析ツール
            </h2>
            <p style={{ marginBottom: '20px' }}>
              当サイトでは、Google Analyticsを使用してアクセス解析を行っています。Google Analyticsはデータの収集のためにCookieを使用しています。
            </p>
            <p style={{ marginBottom: '20px' }}>
              このデータは統計的な情報として処理され、個人を特定するものではありません。詳細については、Googleのプライバシーポリシーをご確認ください。
            </p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              marginTop: '40px',
              marginBottom: '20px',
              color: '#333'
            }}>
              6. セキュリティ
            </h2>
            <p style={{ marginBottom: '20px' }}>
              当サイトは、個人情報の漏洩、滅失、毀損等を防止するため、適切な安全管理措置を講じています。
            </p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              marginTop: '40px',
              marginBottom: '20px',
              color: '#333'
            }}>
              7. プライバシーポリシーの変更
            </h2>
            <p style={{ marginBottom: '20px' }}>
              当サイトは、本プライバシーポリシーを必要に応じて変更することがあります。変更後のプライバシーポリシーは、当サイトに掲載した時点から効力を生じるものとします。
            </p>
          </div>

          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              marginTop: '40px',
              marginBottom: '20px',
              color: '#333'
            }}>
              8. お問い合わせ
            </h2>
            <p style={{ marginBottom: '20px' }}>
              本プライバシーポリシーに関するお問い合わせは、以下までご連絡ください：
            </p>
            <p style={{ marginBottom: '20px' }}>
              <strong>連絡先:</strong> contact@specsy-hub.com
            </p>
            <p style={{ marginBottom: '0' }}>
              <strong>制定日:</strong> 2025年7月30日
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}