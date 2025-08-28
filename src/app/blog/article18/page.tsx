'use client'

import BlogLayout from '../../../components/blog/BlogLayout'
import { BlogArticle, BlogContent, BlogSection, BlogParagraph, BlogList, BlogTable, BlogTableHeader, BlogTableCell, BlogTableRow, BlogTableBody } from '@/components/blog/BlogArticle'
import { useEffect, useState } from 'react'
import ClientPcList from '../../pc-list/ClientPcList'
import { fetchPcList } from '../../pc-list/fetchPcs'
import type { ClientPcWithCpuSpec } from '../../../components/types'

export default function Article18Page() {
  const [pcs, setPcs] = useState<ClientPcWithCpuSpec[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    fetchPcList('home')
      .then((data) => {
        if (Array.isArray(data)) {
          setPcs(data)
        } else {
          setError('データの形式が正しくありません')
        }
      })
      .catch((e: any) => setError(e?.message || 'PC一覧の取得に失敗しました'))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <BlogLayout>
      <BlogArticle 
        title={'在宅勤務に最適なPC｜Web会議の快適さはスペックだけじゃない'}
        date={'2025-08-08'}
      >
        <BlogContent>
          <BlogParagraph>
            在宅の快適さはCPUとメモリだけでは決まりません。会議の“伝わりやすさ”と日常の静音性が体験を左右します。
          </BlogParagraph>

          <BlogParagraph>
            カメラ/マイク/スピーカー、Wi‑Fiの安定性、配線の簡潔さ——小さな差の積み重ねが1日の質を変えます。
          </BlogParagraph>

          <BlogSection title="結論：在宅は“伝わる音と静けさ”が要">
            <BlogParagraph>
              Web会議の聞き取りやすさ、見やすさ、そして静音性。まずはこの3点を満たすPCを選べば、仕事が滞りません。
            </BlogParagraph>

            <BlogParagraph>
              スペックは必要十分でOK。カメラ/マイク品質とWi‑Fiの安定、USB‑Cドック対応を優先すると失敗が減ります。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="早見表：在宅会議の体感に効く要素">
            <BlogParagraph>
              すばやく判断するための基準表です。使用環境で前後しますが、初期の当たりを付けるのに役立ちます。
            </BlogParagraph>

            <BlogTable>
              <BlogTableHeader>
                <BlogTableCell isHeader>要素</BlogTableCell>
                <BlogTableCell isHeader>重視ポイント</BlogTableCell>
                <BlogTableCell isHeader>目安/ヒント</BlogTableCell>
              </BlogTableHeader>
              <BlogTableBody>
                <BlogTableRow>
                  <BlogTableCell>カメラ</BlogTableCell>
                  <BlogTableCell>明るさ×逆光耐性</BlogTableCell>
                  <BlogTableCell>FHD/自動画質補正/顔の明るさ優先</BlogTableCell>
                </BlogTableRow>
                <BlogTableRow>
                  <BlogTableCell>マイク</BlogTableCell>
                  <BlogTableCell>ノイズ抑制</BlogTableCell>
                  <BlogTableCell>ビームフォーミング/打鍵音低減</BlogTableCell>
                </BlogTableRow>
                <BlogTableRow>
                  <BlogTableCell>スピーカー</BlogTableCell>
                  <BlogTableCell>声の明瞭さ</BlogTableCell>
                  <BlogTableCell>中音域重視/底面排気との干渉少</BlogTableCell>
                </BlogTableRow>
                <BlogTableRow>
                  <BlogTableCell>ネットワーク</BlogTableCell>
                  <BlogTableCell>安定性</BlogTableCell>
                  <BlogTableCell>Wi‑Fi 6/6E/有線LAN化で安定</BlogTableCell>
                </BlogTableRow>
                <BlogTableRow>
                  <BlogTableCell>配線/拡張</BlogTableCell>
                  <BlogTableCell>片付けの速さ</BlogTableCell>
                  <BlogTableCell>USB‑Cドック1本運用</BlogTableCell>
                </BlogTableRow>
              </BlogTableBody>
            </BlogTable>
          </BlogSection>

          <BlogSection title="選び方の軸：優先度の付け方">
            <BlogParagraph>
              会議中心ならI/O品質、作業中心なら画面と静音を優先。あなたの1日の時間配分から逆算します。
            </BlogParagraph>

            <BlogParagraph>
              迷ったら“聞き取りやすさ＞画面＞速度”の順で満たすと、満足度が安定します。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="注目ポイント：体験に効く“静かな良さ”">
            <BlogParagraph>
              スペック表では見落としがちな要素です。購入前にレビュー傾向も合わせて確認しましょう。
            </BlogParagraph>

            <BlogList>
              <li>Web会議品質：カメラ/マイク/スピーカーのバランス</li>
              <li>ネットワーク：Wi‑Fi 6/6Eとアンテナの地力</li>
              <li>拡張性：USB‑Cドック互換と電源取り回し</li>
              <li>画面：明るさと反射、文字の見やすさ</li>
              <li>静音：軽負荷でファンが唸らない設計</li>
            </BlogList>
          </BlogSection>

          <BlogSection title="価格帯の狙い目：少しの上乗せで快適に">
            <BlogParagraph>
              エントリー帯は動作は十分でもI/O品質が弱め。中位帯に上げると会議品質と静音がぐっと良くなります。
            </BlogParagraph>

            <BlogParagraph>
              上位帯は画面品質や筐体剛性も安定。長時間使用や複数アプリ並行でも快適さが続きます。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="購入前チェックリスト：在宅ならではの確認">
            <BlogParagraph>
              自宅の環境で困らないかを事前に想像します。以下を満たせば“静かで快適”に近づきます。
            </BlogParagraph>

            <BlogList>
              <li>逆光で顔が暗くならないか、マイクが打鍵音を拾い過ぎないか</li>
              <li>Wi‑Fiが弱い部屋でも通話が安定するか（有線LAN可否）</li>
              <li>USB‑Cドック1本で外部モニターと給電が両立するか</li>
              <li>画面の反射と明るさが作業部屋に合っているか</li>
              <li>軽作業時にファン音が気にならないか</li>
            </BlogList>
          </BlogSection>

          <BlogSection title="ケーススタディ：ノイズ源を断つ運用">
            <BlogParagraph>
              打鍵音が会議で気になるなら、マイクの指向性設定とソフトのノイズ抑制を併用。机の共振もマットで抑えます。
            </BlogParagraph>

            <BlogParagraph>
              配線はドック1本化。片付けが速いと切り替えコストが下がり、集中状態に入りやすくなります。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="カメラとマイク：印象は“情報量”で決まる">
            <BlogParagraph>
              同じ発言でも、カメラの明るさとマイクの明瞭さが違うだけで受け手の印象は変わります。逆光に弱いカメラは顔が暗く沈み、ノイズ処理が弱いマイクはキーボードの打鍵音が混ざって要点が伝わりにくい。外付けデバイスで改善する手はありますが、在宅では“毎日の手間”が積もるので、内蔵品質が良いに越したことはありません。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="Wi‑Fiの安定性：在宅の“壁”は物理的に分厚い">
            <BlogParagraph>
              在宅はオフィスより壁や家具の干渉が多く、通信が不安定になりがち。Wi‑Fi 6/6E対応とアンテナ設計の“地力”がここで効いてきます。家の奥の部屋で通話が途切れる、映像が荒れる……という悩みは、生産性だけでなく心理的な疲労にもつながります。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="USB‑Cドックと配線：片付けの速さが集中を呼ぶ">
            <BlogParagraph>
              机の上がごちゃつくと、意外と人は集中できません。USB‑Cドックを使えば、ケーブル1本で電源・外部モニター・有線LAN・周辺機器をまとめられ、片付けも速い。毎日の「さあ始めよう」という立ち上がりが軽くなる分、在宅の自己管理が楽になります。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="放熱と静音：大きな音は小さなストレスの集合体">
            <BlogParagraph>
              作業自体は軽くても、ファンが頻繁に高回転へ移行する個体は“音のストレス”がじわじわ効きます。最新世代の省電力CPUは、軽作業での静音性と長持ちの両立が得意。長い会議や資料づくりの“日常の静けさ”を、設計が支えてくれます。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="次のアクション">
            <BlogParagraph>
              まず総合スコア順で上位を俯瞰し、I/O品質と静音性の評判で3台に絞りましょう。最後に価格で決めます。
            </BlogParagraph>

            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', border: '3px solid #f3f3f3', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <span style={{ color: '#6b7280', fontSize: '14px' }}>PCデータを読み込み中...</span>
                <style jsx>{`
                  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                `}</style>
              </div>
            ) : error ? (
              <div style={{ padding: '12px', color: 'red', textAlign: 'center' }}>エラー: {error}</div>
            ) : (
              <div style={{ marginTop: '12px' }}>
                <ClientPcList pcs={pcs} />
              </div>
            )}
          </BlogSection>
        </BlogContent>
      </BlogArticle>
    </BlogLayout>
  )
}


