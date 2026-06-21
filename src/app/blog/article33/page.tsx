import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'
import type { ServerPcWithCpuSpec } from '@/server/types'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(33)

function priceOf(pc: ServerPcWithCpuSpec) {
  return pc.real_price || pc.price || null
}

function formatPrice(price: number | null) {
  return price ? `${price.toLocaleString('ja-JP')}円` : '不明'
}

function percent(count: number, total: number) {
  return total > 0 ? Math.round((count / total) * 100) : 0
}

function getMedian(prices: number[]) {
  if (prices.length === 0) {
    return null
  }

  const sorted = [...prices].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)

  return sorted.length % 2 === 0
    ? Math.round((sorted[middle - 1] + sorted[middle]) / 2)
    : sorted[middle]
}

function summarizePrices(pcs: ServerPcWithCpuSpec[]) {
  const pricedPcs = pcs.filter((pc) => priceOf(pc) !== null)
  const prices = pricedPcs.map((pc) => priceOf(pc)).filter((price): price is number => price !== null)
  const total = pricedPcs.length
  const under50000 = pricedPcs.filter((pc) => (priceOf(pc) ?? Infinity) <= 50000).length
  const under60000 = pricedPcs.filter((pc) => (priceOf(pc) ?? Infinity) <= 60000).length
  const under70000 = pricedPcs.filter((pc) => (priceOf(pc) ?? Infinity) <= 70000).length
  const over100000 = pricedPcs.filter((pc) => (priceOf(pc) ?? 0) >= 100000).length
  const practicalUnder70000 = pricedPcs.filter((pc) => (
    (priceOf(pc) ?? Infinity) <= 70000 &&
    (pc.ram ?? 0) >= 16 &&
    (pc.rom ?? 0) >= 512
  )).length

  return {
    total,
    median: getMedian(prices),
    under50000,
    under60000,
    under70000,
    over100000,
    practicalUnder70000,
    under50000Pct: percent(under50000, total),
    under60000Pct: percent(under60000, total),
    under70000Pct: percent(under70000, total),
    over100000Pct: percent(over100000, total),
    practicalUnder70000Pct: percent(practicalUnder70000, under70000),
  }
}

export default async function Article33Page() {
  const pcs = await fetchPcList('cost_performance')
  const priceStats = summarizePrices(pcs)

  return (
    <PcDbArticle
      articlePath="/blog/article33"
      title="AmazonコスパPCの予算目安 2026｜いくら出せばいいかPC-DB比較"
      date="2026-06-18"
      usage="cost_performance"
      listHref="/pc-list/cost-performance"
      listLabel="コスパPCランキングを見る"
      lead={`Amazonでコスパの良いPCを探していると、安いものはかなり安い一方で、「結局いくら出せば普通に使えるのか」が分かりにくいです。そこで今回は、SpecsyのPC-DBで価格が取れている${priceStats.total}件をざっと集計して、予算目安と価格帯の傾向をメモしておきます。`}
      secondaryLead={`この記事は「おすすめランキングをきれいに作る」というより、自分がPCを選ぶ前に価格感を掴むための記録です。5万円以下、6万円以下、7万円以下、10万円以上に分けて見ると、どのあたりから実用構成が増えるのかが少し見えてきます。`}
      conclusionTitle="まずは7万円前後まで見ればよさそう"
      conclusion={`今回の集計では、5万円以下が${priceStats.under50000Pct}%、6万円以下が${priceStats.under60000Pct}%、7万円以下が${priceStats.under70000Pct}%、10万円以上が${priceStats.over100000Pct}%でした。中央値は${formatPrice(priceStats.median)}です。つまり、最安だけを狙うなら5万円台にも候補はありますが、メインPCとして無理なく選びたいなら、まず7万円前後まで広げて見るのが現実的っぽいです。`}
      conclusionIntro="先に価格だけでざっくり見ると、思ったより低価格帯にも候補はあります。ただし、安いほどメモリやSSD、CPU世代の確認は必須です。コスパPCとして見るなら、価格の安さだけでなく実用構成までセットで確認します。"
      criteriaTitle="今回の集計メモ"
      criteria={[
        `5万円以下は${priceStats.under50000}件。かなり安い候補はあるが、8GBメモリや古めのCPUが混ざりやすい価格帯として見る。`,
        `6万円以下は${priceStats.under60000}件。低価格PCとしては現実的な候補が増え、N95/N100/N150系の16GB構成も見つけやすくなる。`,
        `7万円以下は${priceStats.under70000}件。この中でメモリ16GB・SSD512GB以上を満たす候補は${priceStats.practicalUnder70000}件で、7万円以下全体の${priceStats.practicalUnder70000Pct}%だった。`,
        `10万円以上は${priceStats.over100000}件。性能やブランド、画面サイズに余裕は出るが、普段使いだけなら必須ラインではなさそう。`,
      ]}
      dataAngleTitle="このデータから見た感想"
      dataAngle="価格だけで見ると5万〜7万円台に候補がかなり集まります。ただ、安いPCほどスペック表の見落としがそのまま不満になりやすいので、価格の次にメモリ16GB、SSD512GB、CPU型番を確認するのが良さそうです。コスパスコアは最初の並び替えとして使い、最後は自分の用途に対して何を妥協しているかを見る、という使い方が合っています。"
      tableIntro="ここからは、集計だけでなく実際の候補も見ます。価格帯の印象と、表に出てくるCPU・メモリ・SSDを照らし合わせると、安い理由が分かりやすくなります。"
      tableDescription="下表は、PC-DB内の候補をコスパスコア順に並べたものです。ランキングとして見るより、価格帯ごとにどんな構成が混ざっているかを確認するための表として使ってください。"
      faq={[
        {
          question: '大体いくら出せば普通に使えるPCを選べそうですか？',
          answer: '今回の集計だけで見るなら、まず7万円前後まで見れば候補はかなり増えます。5万円以下でも候補はありますが、メインPCとして長く使うなら、7万円以下で16GBメモリ・SSD512GB以上の候補を探す方が現実的です。',
        },
        {
          question: '5万円以下のPCは避けた方がいいですか？',
          answer: '避ける必要はありません。ただし、5万円以下は用途を軽作業に絞る前提で見た方が安全です。Web閲覧、文書作成、動画視聴中心なら候補になりますが、メモリ8GBやSSD256GBの構成は割り切りが必要です。',
        },
      ]}
      pcs={pcs}
    />
  )
}
