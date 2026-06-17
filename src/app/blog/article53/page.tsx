import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'
import type { ServerPcWithCpuSpec } from '@/server/types'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(53)

function filterSub900gPcs(pcs: ServerPcWithCpuSpec[]) {
  return pcs.filter((pc) => (
    pc.weight !== null &&
    pc.weight <= 900
  ))
}

export default async function Article53Page() {
  const pcs = filterSub900gPcs(await fetchPcList('mobile'))

  return (
    <PcDbArticle
      articlePath="/blog/article53"
      title="900g以下のAmazon超軽量ノートPC 2026｜持ち運び特化をPC-DB比較"
      date="2026-06-17"
      usage="mobile"
      listHref="/pc-list/mobile"
      listLabel="軽量モバイルPCランキングを見る"
      lead="900g以下のPCは、毎日バッグに入れて持ち歩く、移動中にメモを取る、サブ機として使う、といった用途で強みがあります。一方で、超軽量なぶん画面サイズ、キーボード、メモリ、SSD、バッテリーに制約が出やすいカテゴリです。この記事ではSpecsyのPC-DBから900g以下のAmazon超軽量ノートPCを抽出し、軽さと実用性を同じ表で比較します。"
      conclusionTitle="結論｜900g以下はメインPCよりサブ機目線で見る"
      conclusion="900g以下のPCは携帯性が非常に高い一方、メモリ16GBやSSD512GB以上の候補は限られます。メインPCとして万能に使うより、外出先のメモ、学習、Web閲覧、動画視聴などに絞って選ぶのが現実的です。長く使うならCPU詳細型番、メモリ、SSD、推定駆動時間を必ず確認してください。"
      criteriaTitle="900g以下の超軽量PCで優先する基準"
      criteria={[
        '毎日持ち歩くサブ機なら900g以下を明確な条件にする',
        '小型モデルほど画面サイズとキーボードの使いやすさを確認する',
        'メインPC兼用ならメモリ16GBとSSD512GB以上の候補を優先する',
        '価格だけでなく、CPU型番、推定駆動時間、SSD容量を同時に比較する',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyではAmazon内のPCをPC-DB化し、900g以下という重量条件で抽出したうえで、画面サイズ、CPU型番、GPU、メモリ、SSD、推定駆動時間、用途別スコアを同じ表で比較できます。軽さだけでなく、サブ機として許容できる性能かを確認できる点が強みです。"
      tableDescription="下表は、PC-DB内で900g以下が確認できる候補を、モバイルスコア順に並べたものです。重量だけでなく、画面サイズ、CPU型番、メモリ、SSD、価格、推定駆動時間のバランスを確認してください。"
      faq={[
        {
          question: '900g以下のノートPCはメインPCにできますか？',
          answer: '文書作成、Web閲覧、学習、動画視聴中心なら使える候補があります。ただし画面やキーボードが小さいモデルも多いため、長時間作業やメインPC用途なら1kg以上や14インチ前後も比較してください。',
        },
        {
          question: '900g以下と1kg以下ではどちらを見るべきですか？',
          answer: '携帯性を最優先するなら900g以下、性能や画面サイズの選択肢も欲しいなら1kg以下まで広げるのが現実的です。候補数とスペックの余裕は1kg以下の方が増えます。',
        },
      ]}
      pcs={pcs}
    />
  )
}
