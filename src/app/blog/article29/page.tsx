import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(29)

export default async function Article29Page() {
  const pcs = await fetchPcList('cafe')

  return (
    <PcDbArticle
      articlePath="/blog/article29"
      title="Amazon小型ノートPCおすすめ 2026｜総合スコアでPC-DB比較"
      date="2026-06-17"
      usage="cafe"
      listHref="/pc-list/cafe"
      listLabel="カフェ向けPCランキングを見る"
      lead="小型ノートPCは、性能だけでも軽さだけでも決まりません。カフェ作業、学習、在宅ワークを想定し、SpecsyのPC-DBでCPU型番、GPU、メモリ、SSD、推定駆動時間、価格をまとめて比較します。"
      conclusionTitle="総合スコア上位から、用途に合わない弱点を消す"
      conclusion="まずは総合スコア上位を見て、CPU型番、16GBメモリ、SSD512GB以上、推定駆動時間、重量の順に確認します。価格が安くてもメモリやSSDが弱いモデルは長期満足度が下がりやすいため、スコアとスペック表をセットで見るのが安全です。"
      criteriaTitle="小型ノートPCで優先する基準"
      criteria={[
        '文書作成や多タブ作業ではCPU型番とメモリ16GBを優先する',
        'カフェや外出先で使うなら推定駆動時間と重量を同時に見る',
        '在宅併用ならSSD512GB以上、外部モニター運用なら画面サイズを過度に重視しない',
        '価格だけでなく、スコアが低い理由がCPU・メモリ・電池のどこにあるか確認する',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="Specsyの総合スコアは、Amazon内のPCを用途別に同じ軸へ並べ替えるためのものです。製品名やブランドの印象ではなく、DBにあるCPU型番、GPU、メモリ、SSD、価格、推定駆動時間から候補を絞れます。"
      faq={[
        {
          question: '総合スコアだけで選んでよいですか？',
          answer: '候補の入口としては有効です。ただし最後は重量、画面サイズ、端子、キーボード配列など、DBでは拾いきれない体感要素も確認してください。',
        },
        {
          question: '10万円以下の小型ノートでも長く使えますか？',
          answer: 'CPU型番、メモリ16GB、SSD512GB以上がそろっていれば十分候補になります。8GB/256GB構成は軽作業向けと割り切るのが無難です。',
        },
      ]}
      pcs={pcs}
    />
  )
}
