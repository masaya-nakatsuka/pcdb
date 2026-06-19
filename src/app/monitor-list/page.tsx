import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'モニター比較 - スペクシーハブ',
  description: 'PCモニターをサイズ、解像度、リフレッシュレート、パネル、端子、価格で比較する画面です。',
}

const monitorColumns = [
  'モニター',
  'サイズ',
  '解像度',
  'Hz',
  'パネル',
  'USB-C',
  '価格',
]

export default function MonitorListPage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      color: '#1f2937',
    }}>
      <header style={{
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
      }}>
        <div style={{
          maxWidth: '1200px',
          minHeight: '64px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}>
          <Link href="/" style={{
            color: '#0f172a',
            textDecoration: 'none',
            fontWeight: 900,
            fontSize: '18px',
            whiteSpace: 'nowrap',
          }}>
            Specsy Hub
          </Link>
          <Link href="/pc-list/cafe" style={{
            color: '#475569',
            textDecoration: 'none',
            fontWeight: 800,
            fontSize: '13px',
            whiteSpace: 'nowrap',
          }}>
            PCランキング
          </Link>
        </div>
      </header>

      <main>
        <section style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '28px 16px 0',
          textAlign: 'center',
        }}>
          <h1 style={{
            margin: '0 0 8px',
            fontSize: '28px',
            color: '#0f172a',
            lineHeight: 1.3,
          }}>
            モニター比較
          </h1>
          <p style={{
            margin: 0,
            color: '#475569',
            fontSize: '14px',
            lineHeight: 1.8,
          }}>
            PCモニターを、サイズ・解像度・リフレッシュレート・パネル・USB-C・価格で比較します。
          </p>
        </section>

        <section style={{
          maxWidth: '1200px',
          margin: '28px auto 0',
          padding: '0 16px',
        }}>
          <div style={{
            overflowX: 'auto',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
          }}>
            <table style={{
              width: '100%',
              minWidth: '860px',
              borderCollapse: 'collapse',
            }}>
              <thead>
                <tr>
                  {monitorColumns.map((column) => (
                    <th key={column} style={{
                      padding: '12px',
                      borderBottom: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      color: '#334155',
                      fontSize: '13px',
                      fontWeight: 900,
                      textAlign: 'left',
                      whiteSpace: 'nowrap',
                    }}>
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={monitorColumns.length} style={{
                    padding: '40px 16px',
                    color: '#64748b',
                    fontSize: '14px',
                    textAlign: 'center',
                    borderBottom: '1px solid #f1f5f9',
                  }}>
                    モニターDB接続後、ここに商品一覧を表示します。
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
