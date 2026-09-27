export default function AmazonCta() {
  return (
    <div style={{
      border: '2px solid #ff9900',
      borderRadius: '12px',
      padding: '24px',
      marginTop: '32px',
      marginBottom: '32px',
      backgroundColor: '#fffaf0',
    }}>
      <div style={{
        fontSize: '18px',
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: '12px',
      }}>
        Amazonで最新の価格と在庫を確認
      </div>
      <p style={{
        fontSize: '14px',
        color: '#64748b',
        lineHeight: '1.6',
        marginBottom: '16px',
      }}>
        この記事で紹介した商品の最新価格・在庫状況・レビューは、各商品のAmazonページでご確認いただけます。
      </p>
      <a
        href="https://www.amazon.co.jp/"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-block',
          padding: '12px 24px',
          borderRadius: '8px',
          backgroundColor: '#ff9900',
          color: '#000000',
          fontSize: '15px',
          fontWeight: '700',
          textDecoration: 'none',
        }}
      >
        Amazonで探す
      </a>
    </div>
  )
}
