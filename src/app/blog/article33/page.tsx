import PcDbArticle from '@/components/blog/PcDbArticle'
import { fetchPcList } from '@/server/usecase/fetchPcList'

export const dynamic = 'force-dynamic'

export default async function Article33Page() {
  const pcs = await fetchPcList('cost_performance')

  return (
    <PcDbArticle
      articlePath="/blog/article33"
      title="Amazon PCコスパランキング 2026｜実売価格と性能スコアで選ぶ"
      date="2026-06-17"
      usage="cost_performance"
      listHref="/pc-list/cost-performance"
      listLabel="コスパPCランキングを見る"
      lead="安いPCを探すと、CPU世代・メモリ・SSD・GPUの差が見えにくくなります。この記事ではSpecsyのPC-DBを使い、実売価格と用途別スコアを同じ表で見ながら、価格だけでは分からないコスパを整理します。"
      conclusionTitle="結論｜価格だけでなく、CPU型番と16GBメモリを同時に見る"
      conclusion="同じRyzen 5やCore i5でも世代差で性能は大きく変わります。まずはPC-DBのコスパスコア上位から見て、CPU型番、メモリ16GB、SSD512GB以上、価格の順に絞ると失敗しにくいです。"
      criteriaTitle="コスパPCで優先する基準"
      criteria={[
        'CPUはCore i5/Ryzen 5という大分類ではなく、Core i5-1334UやRyzen 5 7530Uなど型番まで確認する',
        '長く使うならメモリ16GBを基準にし、8GBは短期・軽作業用として割り切る',
        'SSDは512GB以上が扱いやすく、256GBはクラウド前提なら候補にする',
        '専用GPUが必要ない用途では、GPUよりCPU・メモリ・価格のバランスを優先する',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyはAmazon内のPCをDB化し、CPU型番、GPU、メモリ、SSD、価格を同じ軸でスコア化しています。一般的な「おすすめ」ではなく、今DBにある候補を実際に並べ替えて判断できるのが強みです。"
      faq={[
        {
          question: '安いPCならN100やN150で十分ですか？',
          answer: '文書作成、ブラウジング、動画視聴中心なら十分なケースがあります。ただし多タブ作業や長期利用では、Ryzen 5やCore i5系の詳細型番モデルの方が余裕があります。',
        },
        {
          question: 'コスパスコアだけで買っていいですか？',
          answer: '最初の絞り込みには有効ですが、最後は重量、画面サイズ、端子、キーボード配列など体感に関わる要素も確認してください。',
        },
      ]}
      pcs={pcs}
    />
  )
}
