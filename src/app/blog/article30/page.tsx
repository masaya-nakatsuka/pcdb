import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'
import type { ServerPcWithCpuSpec } from '@/server/types'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(30)

function filterMiniCpuPcs(pcs: ServerPcWithCpuSpec[], cpuName: string) {
  const target = cpuName.toLowerCase()
  return pcs.filter((pc) => (
    (pc.cpu || '').toLowerCase().includes(target) &&
    pc.display_size !== null &&
    pc.display_size <= 13.5
  ))
}

export default async function Article30Page() {
  const pcs = filterMiniCpuPcs(await fetchPcList('mobile'), 'N100')

  return (
    <PcDbArticle
      articlePath="/blog/article30"
      title="Amazon N100ミニノートPC一覧 2026｜PC-DBでモバイル性を比較"
      date="2026-06-17"
      usage="mobile"
      listHref="/pc-list/mobile"
      listLabel="軽量モバイルPCランキングを見る"
      lead="Intel N100搭載のミニノートは、低価格で普段使いしやすい一方、メモリやSSD、画面サイズ、バッテリーで差が出ます。SpecsyのPC-DBからN100かつ13.5インチ以下の候補を抽出して比較します。"
      conclusionTitle="N100は軽作業用として、メモリとSSDを優先する"
      conclusion="N100は文書作成、ブラウジング、動画視聴には十分なことが多いですが、長く使うならメモリ16GBとSSD512GB以上を優先した方が安心です。安さだけでなく、推定駆動時間と重量も一緒に確認してください。"
      criteriaTitle="N100ミニノートで優先する基準"
      criteria={[
        'CPUはN100搭載で、用途は文書作成・ブラウジング・動画視聴中心に考える',
        'メモリは可能なら16GB、8GBは軽作業専用として割り切る',
        'SSDは512GB以上が扱いやすく、256GBはクラウド保存前提で選ぶ',
        '13.5インチ以下でも重量と推定駆動時間に差があるため、一覧で比較する',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyではN100搭載機だけをPC-DBから抽出し、同じ用途スコアで比較できます。N100というCPU名だけでなく、メモリ、SSD、価格、推定駆動時間を同時に見ることで、安いだけのモデルを避けやすくなります。"
      faq={[
        {
          question: 'N100はメインPCとして使えますか？',
          answer: '文書作成やブラウジング中心なら使えます。ただし動画編集、3Dゲーム、多数のアプリ同時利用を想定するならCore i5やRyzen 5以上も比較してください。',
        },
        {
          question: 'N100とN150ではどちらを選ぶべきですか？',
          answer: '価格差が小さければN150も候補です。ただし体感差はメモリやSSDの影響も大きいため、CPUだけで決めず構成全体を見てください。',
        },
      ]}
      pcs={pcs}
    />
  )
}
