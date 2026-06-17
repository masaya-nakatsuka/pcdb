import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'
import type { ServerPcWithCpuSpec } from '@/server/types'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(31)

function filterMiniCpuPcs(pcs: ServerPcWithCpuSpec[], cpuName: string) {
  const target = cpuName.toLowerCase()
  return pcs.filter((pc) => (
    (pc.cpu || '').toLowerCase().includes(target) &&
    pc.display_size !== null &&
    pc.display_size <= 13.5
  ))
}

export default async function Article31Page() {
  const pcs = filterMiniCpuPcs(await fetchPcList('mobile'), 'N150')

  return (
    <PcDbArticle
      articlePath="/blog/article31"
      title="Amazon N150ミニノートPC一覧 2026｜N100より余裕のある軽量PC"
      date="2026-06-17"
      usage="mobile"
      listHref="/pc-list/mobile"
      listLabel="軽量モバイルPCランキングを見る"
      lead="Intel N150搭載ミニノートは、N100系の低消費電力路線を引き継ぎつつ、軽作業で少し余裕を持たせたい人向けの候補です。SpecsyのPC-DBからN150かつ13.5インチ以下の候補を抽出して比較します。"
      conclusionTitle="結論｜N150は低価格モバイルの実用寄り候補"
      conclusion="N150はブラウジング、資料作成、学習、リモート会議向けに扱いやすいCPUです。ただし快適さはCPUだけでなくメモリとSSDに左右されるため、16GB/512GB構成を優先し、重量と推定駆動時間も確認してください。"
      criteriaTitle="N150ミニノートで優先する基準"
      criteria={[
        'N100より少し余裕が欲しい軽作業用として考える',
        'メモリ16GB構成を優先し、多タブ作業での余裕を確保する',
        'SSD512GB以上なら学習資料や写真管理でも扱いやすい',
        '外出利用が多い場合は、重量とExcel作業時の推定駆動時間を見る',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyのPC-DBではN150搭載機を条件抽出し、価格やメモリ容量だけでなく、用途別スコアと推定駆動時間まで同じ画面で比較できます。N150という名前だけでなく、実際の構成差を見られるのが強みです。"
      faq={[
        {
          question: 'N150はN100よりかなり速いですか？',
          answer: '大きく別物というより、軽作業で少し余裕が出る位置づけです。体感差はメモリ、SSD、冷却、価格とのバランスで判断した方が現実的です。',
        },
        {
          question: 'N150搭載PCは動画編集に向きますか？',
          answer: '短い軽い編集なら可能な場合がありますが、動画編集目的ならCore i5/Ryzen 5以上やGPU搭載機も比較してください。',
        },
      ]}
      pcs={pcs}
    />
  )
}
