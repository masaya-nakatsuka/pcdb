import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'
import type { ServerPcWithCpuSpec } from '@/server/types'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(59)

function isTwoInOnePc(pc: ServerPcWithCpuSpec) {
  const text = `${pc.form_factor || ''} ${pc.name || ''}`.toLowerCase()
  return (
    text.includes('2in1') ||
    text.includes('2-in-1') ||
    text.includes('2 in 1') ||
    text.includes('tablet') ||
    text.includes('タブレット')
  )
}

function filterPracticalTwoInOnePcs(pcs: ServerPcWithCpuSpec[]) {
  return pcs.filter((pc) => (
    isTwoInOnePc(pc) &&
    (pc.ram ?? 0) >= 16 &&
    (pc.rom ?? 0) >= 512
  ))
}

export default async function Article59Page() {
  const pcs = filterPracticalTwoInOnePcs(await fetchPcList('mobile'))

  return (
    <PcDbArticle
      articlePath="/blog/article59"
      title="2in1・16GB/512GB構成のAmazonノートPC 2026｜タブレット兼用の実用PCをPC-DB比較"
      date="2026-06-18"
      usage="mobile"
      listHref="/pc-list/mobile"
      listLabel="軽量モバイルPCランキングを見る"
      lead="2in1ノートPCは、キーボード付きのノートPCとしても、タブレットに近い形でも使える柔軟さが魅力です。ただし形状だけで選ぶと、メモリやSSDが弱く、メインPCとしては物足りない候補も混ざります。この記事ではSpecsyのPC-DBから、2in1系かつメモリ16GB・SSD512GB以上のAmazonノートPCだけを抽出し、タブレット兼用でも実用構成を満たす候補を比較します。"
      conclusionTitle="結論｜2in1は形状より先に16GB/512GBを確認する"
      conclusion="2in1でメモリ16GB・SSD512GB以上を満たすモデルは、学習、メモ、動画視聴、Web会議、外出先の軽作業を1台でこなしやすい候補です。ただし同じ2in1でも、重量、画面サイズ、CPU世代、推定駆動時間には差があります。タブレット的な使いやすさとノートPCとしての実用性を同時に見て選ぶのが現実的です。"
      criteriaTitle="2in1実用構成で優先する基準"
      criteria={[
        'メインPC兼用ならメモリ16GBとSSD512GB以上を先に満たす',
        'タブレット的に使うなら重量と画面サイズを確認する',
        '長時間持ち歩くなら推定駆動時間と充電頻度を見る',
        '手書きや閲覧中心か、キーボード作業中心かでサイズと重量の優先度を変える',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyではAmazon内のPCをPC-DB化し、2in1という形状条件にメモリ16GB・SSD512GB以上という実用構成を重ねて抽出できます。単なるタブレット兼用PC一覧ではなく、メインPCとして使いやすい構成か、重量や駆動時間で無理がないかを同じ表で比較できる点が強みです。"
      tableDescription="下表は、PC-DB内で2in1系かつメモリ16GB・SSD512GB以上が確認できる候補を、モバイルスコア順に並べたものです。形状だけでなく、重量、画面サイズ、CPU型番、価格、推定駆動時間のバランスを確認してください。"
      faq={[
        {
          question: '2in1で16GB/512GBならメインPCにできますか？',
          answer: '文書作成、Web閲覧、学習、Web会議、軽い在宅作業なら候補になります。ただしキーボードの打ちやすさや画面角度はモデル差が大きいため、スペックだけでなく使い方との相性も確認してください。',
        },
        {
          question: '2in1は普通のノートPCより重視すべき点が違いますか？',
          answer: '違います。通常のノートPCより、重量、画面サイズ、ヒンジやタブレット利用時の扱いやすさが重要です。PC-DBではまず16GB/512GBで実用ラインを満たし、その中で重量と推定駆動時間を比較するのが安全です。',
        },
      ]}
      pcs={pcs}
    />
  )
}
