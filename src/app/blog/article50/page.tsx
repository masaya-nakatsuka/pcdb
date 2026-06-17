import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'
import type { ServerPcWithCpuSpec } from '@/server/types'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(50)

function filterUltraLightweightPcs(pcs: ServerPcWithCpuSpec[]) {
  return pcs.filter((pc) => (
    pc.weight !== null &&
    pc.weight <= 1000
  ))
}

export default async function Article50Page() {
  const pcs = filterUltraLightweightPcs(await fetchPcList('mobile'))

  return (
    <PcDbArticle
      articlePath="/blog/article50"
      title="1kg以下のAmazon軽量ノートPC 2026｜超軽量をPC-DB比較"
      date="2026-06-17"
      usage="mobile"
      listHref="/pc-list/mobile"
      listLabel="軽量モバイルPCランキングを見る"
      lead="1kg以下のノートPCは、毎日持ち歩く人にとって体感差が大きいカテゴリです。ただし超軽量モデルには、画面が小さい、メモリやSSDが少ない、バッテリーが短いといった弱点も混ざります。この記事ではSpecsyのPC-DBから1kg以下のAmazon軽量ノートPCを抽出し、軽さと実用性能を同じ表で比較します。"
      conclusionTitle="結論｜1kg以下は軽さの理由まで確認する"
      conclusion="1kg以下は携帯性を最優先する人には有力ですが、軽いほど画面サイズ、キーボード、バッテリー、冷却に制約が出やすくなります。サブ機なら価格と軽さを優先してもよい一方、メインPCとして使うならメモリ16GB、SSD512GB以上、CPU詳細型番、推定駆動時間を必ず確認してください。"
      criteriaTitle="1kg以下の軽量ノートPCで優先する基準"
      criteria={[
        '毎日持ち歩くなら重量1kg以下を明確な条件にする',
        '小型すぎる候補は画面サイズとキーボードの使いやすさを確認する',
        'メインPC兼用ならメモリ16GBとSSD512GB以上を優先する',
        '軽さだけでなく、CPU型番、推定駆動時間、価格を同時に比較する',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyではAmazon内のPCをPC-DB化し、1kg以下という重量条件で抽出したうえで、画面サイズ、CPU型番、GPU、メモリ、SSD、推定駆動時間、用途別スコアを横断比較できます。単に軽いPCを並べるのではなく、軽さと実用スペックのどちらを優先するべきかを確認できる点が強みです。"
      tableDescription="下表は、PC-DB内で1kg以下が確認できる候補を、モバイルスコア順に並べたものです。重量だけでなく、画面サイズ、CPU型番、メモリ、SSD、価格、推定駆動時間のバランスを確認してください。"
      faq={[
        {
          question: '1kg以下のノートPCは本当に必要ですか？',
          answer: '毎日持ち歩く、移動中に使う、荷物を軽くしたい場合は意味があります。一方で据え置き利用が多いなら、1.3kg前後まで広げた方が画面サイズや性能の選択肢は増えます。',
        },
        {
          question: '1kg以下でもメインPCとして使えますか？',
          answer: '文書作成、Web閲覧、学習、軽い事務作業なら使える候補があります。ただし長時間作業や複数アプリ利用が多い場合は、メモリ16GB、SSD512GB以上、推定駆動時間を満たすか確認してください。',
        },
      ]}
      pcs={pcs}
    />
  )
}
