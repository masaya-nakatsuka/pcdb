import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(28)

export default async function Article28Page() {
  const pcs = await fetchPcList('mobile')

  return (
    <PcDbArticle
      articlePath="/blog/article28"
      title="小型・軽量モバイルノートおすすめ 2026｜ミニノートをPC-DB比較"
      date="2026-06-17"
      usage="mobile"
      listHref="/pc-list/mobile"
      listLabel="軽量モバイルPCランキングを見る"
      lead="小型ノートPCや軽量モバイルノートは、CPU名だけでは選びにくいカテゴリです。軽さ、画面サイズ、バッテリー、メモリ、SSD、価格のバランスで満足度が変わるため、SpecsyのPC-DBを使って持ち運びやすいミニノート候補を比較します。"
      conclusionTitle="結論｜小型・軽量だけでなく、16GBメモリと推定駆動時間を同時に見る"
      conclusion="毎日持ち運ぶなら重量と画面サイズが重要ですが、小型で安いモデルほどメモリ8GBやSSD256GBに寄りがちです。まずはモバイルスコア上位から、重量、画面サイズ、推定駆動時間、16GBメモリ、SSD512GB以上を同時に確認するのが現実的です。"
      criteriaTitle="小型・軽量モバイルノートで優先する基準"
      criteria={[
        '毎日持ち運ぶなら重量1.3kg前後までを優先する',
        'ミニノートは画面サイズが小さすぎないか、作業内容とセットで考える',
        'メモリは16GBを基準にし、8GBは短期利用や軽作業専用として考える',
        'SSDは512GB以上が扱いやすく、256GBはクラウド保存前提で選ぶ',
        '推定駆動時間はExcel作業・動画視聴の両方を見て、外出時の余裕を確認する',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyではAmazon内のPCをDB化し、軽さだけでなく画面サイズ、CPU型番、メモリ、SSD、価格、推定駆動時間を同じテーブルで比較できます。小型ノートやミニノートでは性能の高さだけでなく、持ち運びやすさと電池持ちもスコアに反映します。"
      faq={[
        {
          question: '小型ノートPCと軽量ノートPCはどちらを優先すべきですか？',
          answer: '毎日持ち運ぶなら重量とバッテリーを優先し、狭い机や移動中に使うなら画面サイズの小ささも効きます。ただし小型すぎると作業領域が狭くなるため、文章作成や表計算が多い場合は13〜14インチ前後も比較してください。',
        },
        {
          question: '軽量ノートは何kgまでが持ち運びやすいですか？',
          answer: '毎日持ち運ぶなら1.3kg前後までが目安です。移動が多い場合は軽さを優先し、据置き利用が多い場合は性能や画面サイズを優先してもよいです。',
        },
        {
          question: 'N100やN150の軽量PCでも十分ですか？',
          answer: '文書作成、ブラウジング、動画視聴中心なら十分な場合があります。多タブ作業や長期利用を考えるなら、Core i5やRyzen 5系の詳細型番モデルも比較してください。',
        },
      ]}
      pcs={pcs}
    />
  )
}
