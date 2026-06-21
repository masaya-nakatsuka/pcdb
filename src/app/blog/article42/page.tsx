import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'
import type { ServerPcWithCpuSpec } from '@/server/types'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(42)

function filterStoragePcs(pcs: ServerPcWithCpuSpec[], minStorageGb: number) {
  return pcs.filter((pc) => (pc.rom ?? 0) >= minStorageGb)
}

export default async function Article42Page() {
  const pcs = filterStoragePcs(await fetchPcList('cost_performance'), 512)

  return (
    <PcDbArticle
      articlePath="/blog/article42"
      title="SSD512GB以上のAmazon PC 2026｜256GBで後悔しないPC-DB比較"
      date="2026-06-17"
      usage="cost_performance"
      listHref="/pc-list/cost-performance"
      listLabel="コスパPCランキングを見る"
      lead="安いPCではSSD256GB構成も多く見かけますが、Windows本体、アプリ、写真、動画、学習資料を入れると容量不足になりやすいです。この記事ではSpecsyのPC-DBからSSD512GB以上のAmazon PCを抽出し、容量だけでなくCPU型番、メモリ、GPU、価格まで比較します。"
      conclusionTitle="SSD512GB以上を基準に、メモリとCPU型番で絞る"
      conclusion="SSD512GB以上なら普段使いの保存容量に余裕が出やすく、メインPCとして選びやすくなります。ただし容量だけで選ぶと、CPUが古い、メモリが少ない、価格が高い構成を拾うことがあります。PC-DBでは512GB以上に絞ったうえで、CPU型番、メモリ16GB、GPU、推定駆動時間、価格を同じ表で確認できます。"
      criteriaTitle="SSD512GB以上PCで優先する基準"
      criteria={[
        'メインPCとして使うならSSD512GB以上を基準にする',
        '写真、動画、学習資料、Officeファイルを多く保存するなら256GBは容量不足に注意する',
        'SSD容量だけでなく、メモリ16GBとCPU詳細型番を同時に確認する',
        '動画編集やゲームも考えるなら、512GB以上に加えてGPU名と1TB構成も比較する',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyではAmazon内のPCをPC-DB化し、SSD512GB以上という条件で絞ったうえで、CPU型番、メモリ、GPU、推定駆動時間、用途別スコアを同じ表で比較できます。容量だけ大きいPCではなく、保存容量と処理性能のバランスがよい候補を見つけやすいのが強みです。"
      tableDescription="下表は、PC-DB内でSSD512GB以上が確認できる候補を、コスパスコア順に並べたものです。SSD容量だけでなく、CPU型番、メモリ、価格のバランスを確認してください。"
      faq={[
        {
          question: 'SSD256GBのPCは避けた方がいいですか？',
          answer: '軽作業やクラウド保存中心なら使える場合があります。ただしメインPCとして長く使うなら、Windows更新、アプリ、写真や動画の保存で余裕が出る512GB以上の方が安心です。',
        },
        {
          question: 'SSD512GBならメモリは8GBでも大丈夫ですか？',
          answer: '容量には余裕が出ますが、快適さはメモリとCPUにも左右されます。多タブ作業やWeb会議を考えるなら、SSD512GB以上に加えてメモリ16GBの候補も比較してください。',
        },
      ]}
      pcs={pcs}
    />
  )
}
