import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'
import type { ServerPcWithCpuSpec } from '@/server/types'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(52)

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

function filterTwoInOnePcs(pcs: ServerPcWithCpuSpec[]) {
  return pcs.filter(isTwoInOnePc)
}

export default async function Article52Page() {
  const pcs = filterTwoInOnePcs(await fetchPcList('mobile'))

  return (
    <PcDbArticle
      articlePath="/blog/article52"
      title="Amazon 2in1ノートPC 2026｜タブレット兼用PCをPC-DB比較"
      date="2026-06-17"
      usage="mobile"
      listHref="/pc-list/mobile"
      listLabel="軽量モバイルPCランキングを見る"
      lead="2in1ノートPCは、キーボード付きノートPCとしても、タブレットに近い形でも使える柔軟さが魅力です。一方で、軽さ、画面サイズ、CPU型番、メモリ、SSD、バッテリーのバランスを見ないと、持ち運びやすいだけで作業しにくい候補を選びやすくなります。この記事ではSpecsyのPC-DBからAmazonの2in1ノートPCを抽出して比較します。"
      conclusionTitle="2in1は形状だけでなく重量と16GB/512GB構成を見る"
      conclusion="2in1ノートPCは学習、メモ、動画視聴、外出先の軽作業に向きます。ただしメインPCとして使うなら、形状だけで選ばず、メモリ16GB、SSD512GB以上、CPU詳細型番、推定駆動時間を確認してください。軽量サブ機として割り切る場合は、価格と重量を優先する選び方も現実的です。"
      criteriaTitle="2in1ノートPCで優先する基準"
      criteria={[
        'タブレット的に使うなら重量と画面サイズを先に確認する',
        'メインPC兼用ならメモリ16GBとSSD512GB以上を優先する',
        'N95/N100/N150系は文書作成、Web閲覧、動画視聴中心に考える',
        '動画編集や3Dゲーム目的なら、2in1形状よりCPU/GPU性能を優先する',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyではAmazon内のPCをPC-DB化し、2in1系の候補を抽出したうえで、画面サイズ、重量、CPU型番、GPU、メモリ、SSD、推定駆動時間、用途別スコアを同じ表で比較できます。2in1という形状の便利さだけでなく、実用スペックの不足を同時に確認できる点が強みです。"
      tableDescription="下表は、PC-DB内で2in1系として確認できる候補を、モバイルスコア順に並べたものです。形状だけでなく、重量、画面サイズ、CPU型番、メモリ、SSD、価格、推定駆動時間のバランスを確認してください。"
      faq={[
        {
          question: '2in1ノートPCは普通のノートPCより便利ですか？',
          answer: '手書きメモ、動画視聴、移動中の閲覧、学習用途では便利です。ただしキーボードの打ちやすさや画面角度、重量はモデル差が大きいため、通常のノートPCと同じ感覚で選ばない方が安全です。',
        },
        {
          question: '2in1ノートPCをメインPCにできますか？',
          answer: '文書作成、Web閲覧、学習、軽い事務作業なら候補になります。メインPCとして長く使うなら、メモリ16GB、SSD512GB以上、CPU詳細型番、推定駆動時間を確認してください。',
        },
      ]}
      pcs={pcs}
    />
  )
}
