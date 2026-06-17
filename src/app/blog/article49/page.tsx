import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'
import type { ServerPcWithCpuSpec } from '@/server/types'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(49)

function filterMiniNotePcs(pcs: ServerPcWithCpuSpec[]) {
  return pcs.filter((pc) => (
    pc.display_size !== null &&
    pc.display_size <= 11
  ))
}

export default async function Article49Page() {
  const pcs = filterMiniNotePcs(await fetchPcList('mobile'))

  return (
    <PcDbArticle
      articlePath="/blog/article49"
      title="11インチ以下のAmazonミニノートPC 2026｜超小型をPC-DB比較"
      date="2026-06-17"
      usage="mobile"
      listHref="/pc-list/mobile"
      listLabel="軽量モバイルPCランキングを見る"
      lead="11インチ以下のミニノートPCは、バッグに入れやすく、移動中のメモ、学習、軽い文書作成に使いやすいサイズです。一方で画面が小さい分、CPU型番、メモリ、SSD、重量、バッテリー、価格の差を確認しないと、安いだけで使いにくい候補を選びやすくなります。この記事ではSpecsyのPC-DBから11インチ以下のAmazonミニノートPCを抽出して比較します。"
      conclusionTitle="結論｜11インチ以下は軽さだけでなく16GB/512GB構成を見る"
      conclusion="11インチ以下のPCは携帯性が強みですが、メインPCとして使うには画面サイズと性能の制約があります。外出先の軽作業やサブ機なら有力ですが、長く使うならメモリ16GB、SSD512GB以上、CPU詳細型番、推定駆動時間を同時に確認してください。"
      criteriaTitle="11インチ以下ミニノートPCで優先する基準"
      criteria={[
        '持ち運び最優先なら11インチ以下と重量1kg前後を確認する',
        '小型でも長く使うならメモリ16GBとSSD512GB以上を優先する',
        'N95/N100/N150など低価格CPUでは用途を文書作成やWeb中心に絞る',
        '画面の小ささが気になる場合は14インチ前後や15.6インチ前後も比較する',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyではAmazon内のPCをPC-DB化し、11インチ以下という画面サイズ条件で抽出したうえで、CPU型番、GPU、メモリ、SSD、重量、推定駆動時間、用途別スコアを同じ表で比較できます。超小型という携帯性だけでなく、実用性能と保存容量の不足も同時に確認できる点が強みです。"
      tableDescription="下表は、PC-DB内で11インチ以下が確認できる候補を、モバイルスコア順に並べたものです。画面サイズだけでなく、重量、CPU型番、メモリ、SSD、価格、推定駆動時間のバランスを確認してください。"
      faq={[
        {
          question: '11インチ以下のミニノートPCはメインPCにできますか？',
          answer: '文書作成、Web閲覧、動画視聴、学習中心なら使える場合があります。ただし画面が小さいため、長時間作業や複数ウィンドウ作業が多いなら14インチ前後も比較してください。',
        },
        {
          question: '8インチや10インチのPCは小さすぎますか？',
          answer: '携帯性は高いですが、キーボードや画面の見やすさは妥協が必要です。軽さだけでなく、メモリ、SSD、推定駆動時間、価格を見てサブ機として割り切れるか確認してください。',
        },
      ]}
      pcs={pcs}
    />
  )
}
