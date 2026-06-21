import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'
import type { ServerPcWithCpuSpec } from '@/server/types'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(32)

function filterMiniCpuPcs(pcs: ServerPcWithCpuSpec[], cpuName: string) {
  const target = cpuName.toLowerCase()
  return pcs.filter((pc) => (
    (pc.cpu || '').toLowerCase().includes(target) &&
    pc.display_size !== null &&
    pc.display_size <= 13.5
  ))
}

export default async function Article32Page() {
  const pcs = filterMiniCpuPcs(await fetchPcList('mobile'), 'N95')

  return (
    <PcDbArticle
      articlePath="/blog/article32"
      title="Amazon N95ミニノートPC一覧 2026｜低価格モバイルPCをDB比較"
      date="2026-06-17"
      usage="mobile"
      listHref="/pc-list/mobile"
      listLabel="軽量モバイルPCランキングを見る"
      lead="Intel N95搭載ミニノートは、低価格帯で見かけることが多いCPUです。N100/N150と同じように普段使い向けですが、実際の満足度はメモリ、SSD、画面サイズ、重量、バッテリーで変わります。SpecsyのPC-DBからN95かつ13.5インチ以下の候補を抽出して比較します。"
      conclusionTitle="N95は価格重視、ただし8GB/256GBには注意"
      conclusion="N95搭載機は低価格で候補に入りやすい一方、メモリやSSDを削った構成もあります。価格だけで判断せず、16GBメモリ、SSD512GB以上、推定駆動時間、重量を同時に確認すると失敗しにくいです。"
      criteriaTitle="N95ミニノートで優先する基準"
      criteria={[
        '価格重視の軽作業用として候補にする',
        'メモリ8GBは用途を絞り、長期利用なら16GBを優先する',
        'SSD256GBは容量不足になりやすいため、512GB以上を優先する',
        '画面サイズが小さくても重量や電池持ちはモデル差があるため、DBで確認する',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyはN95搭載機をPC-DBから抽出し、CPU名だけでなく、メモリ、SSD、価格、推定駆動時間、モバイル用途スコアを同じ表で確認できます。低価格モデルほど、構成差を見える化する価値が高くなります。"
      faq={[
        {
          question: 'N95とN100はどちらがいいですか？',
          answer: '用途が軽作業中心ならどちらも候補です。価格差、メモリ、SSD、重量、推定駆動時間を比べ、構成が良い方を選ぶのが現実的です。',
        },
        {
          question: 'N95搭載PCは長く使えますか？',
          answer: '16GBメモリと512GB SSDがあれば軽作業用として長く使いやすいです。8GB/256GBは用途を絞ったサブPC向けと考えるのが無難です。',
        },
      ]}
      pcs={pcs}
    />
  )
}
