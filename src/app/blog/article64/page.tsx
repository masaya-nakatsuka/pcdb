import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'
import type { ServerPcWithCpuSpec } from '@/server/types'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(64)

function filterCustomPcs(pcs: ServerPcWithCpuSpec[]) {
  return pcs.filter((pc) => (
    (pc.weight ?? 0) <= 1300 &&        // 1.3kg以下（グラム）
    (pc.display_size ?? 0) >= 13 &&    // 13インチ以上
    (pc.display_size ?? 0) <= 15.6 &&  // 15.6インチ以下
    (pc.ram ?? 0) >= 8                 // 8GB以上
  ))
}

export default async function Article64Page() {
  const pcs = filterCustomPcs(await fetchPcList('cafe'))

  return (
    <PcDbArticle
      articlePath="/blog/article64"
      title="AmazonノートPCで在宅ワーク向けを選ぶ 2026｜画面・キーボード・静音をPC-DB比較"
      date="2026-09-27"
      usage="cafe"
      listHref="/pc-list/cafe"
      listLabel="ノートPCランキングを見る"
      lead="この記事では、在宅ワークに適したノートPCについて、SpecsyのPC-DBを使って比較します。"
      conclusionTitle="まず押さえるポイント"
      conclusion="在宅ワーク向けノートPCを選ぶなら、まず画面サイズと重量のバランス、そしてキーボードの打ちやすさを確認してください。"
      criteriaTitle="選び方の基準"
      criteria={[
        '画面: 13〜15.6インチで文書作業に十分な表示領域',
        '重量: 1.3kg以下で自宅内の移動やカフェ作業にも対応',
        'メモリ: 8GB以上でブラウザとOfficeの同時利用が快適',
        '静音性: CPUの発熱が少なく、長時間作業でもファン音が気にならない',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyではAmazon内のPCをDB化し、重量と画面サイズ、メモリを同じ表で比較できます。在宅ワークでは持ち運びと画面の見やすさの両立が重要なため、13〜15.6インチかつ1.3kg以下という条件で絞り込んでいます。"
      faq={[
        {
          question: '在宅ワークに最適な画面サイズは？',
          answer: '13〜15.6インチがおすすめです。13インチはコンパクトで持ち運びやすく、15.6インチは表示領域が広く文書作業に向きます。',
        },
        {
          question: '重量はどのくらいまでなら実用的？',
          answer: '1.3kg以下が目安です。自宅内の移動やカフェでの作業も考えると、軽量な方が使い勝手が良くなります。',
        },
        {
          question: 'メモリは8GBで足りる？',
          answer: 'ブラウザとOfficeを中心に使うなら8GBで十分です。動画編集など重い作業を行う場合は16GB以上が推奨されます。',
        },
      ]}
      pcs={pcs}
    />
  )
}
