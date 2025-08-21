'use client'

import BlogLayout from '../../../components/blog/BlogLayout'
import { BlogArticle, BlogContent, BlogSection, BlogParagraph, BlogList, BlogCallout, BlogTable, BlogTableHeader, BlogTableCell, BlogTableRow } from '@/components/blog/BlogArticle'
import { blogArticles } from '../../../lib/blogMetadata'

const articleData = blogArticles.find(article => article.id === 3)!

export default function Article3Page() {
  return (
    <BlogLayout>
      <BlogArticle 
        title={articleData.title}
        date={articleData.date}
      >
        <BlogContent>
          <BlogParagraph>
            CPUを選ぶとき、まずチェックする人が多いのが「Passmark」などのベンチマークスコアです。
          </BlogParagraph>

          <BlogParagraph>
            この数値が高いほど処理能力も高く、「この用途なら余裕そうだな」と判断する基準になりますよね。
          </BlogParagraph>

          <BlogParagraph>
            ただ、世の中すべてのCPUにスコアがあるわけではありません。発売直後のモデルや省電力向け、ニッチな構成のCPUだと「スコアが載ってない！」というケースも珍しくないです。
          </BlogParagraph>

          <BlogParagraph>
            そこで今回のテーマはズバリ、「CPUのスペック情報からベンチマークスコアをある程度推測できるのか？」です。もちろん完全一致は難しいですが、「用途に耐えられるか」をざっくり判断する目安になるなら実用的ですよね。
          </BlogParagraph>

          <BlogSection title="推定に使える主な指標">
            <BlogParagraph>
              CPUスコアを見積もるうえで、ざっくり効いてくるのは以下の項目です。
            </BlogParagraph>

            <BlogList>
              <li>コア数（物理）</li>
              <li>スレッド数</li>
              <li>最大クロック周波数（GHz）</li>
              <li>アーキテクチャ世代（Zen2、Zen3、Gracemont、Firestormなど）</li>
              <li>TDP（熱設計電力、消費電力の目安）</li>
            </BlogList>

            <BlogParagraph>
              このあたりを組み合わせれば、「この世代ならこれくらいの性能かな？」と見えてきます。特に同じアーキテクチャ内の比較だと精度は上がりますね。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="簡易スコア推定式">
            <BlogParagraph>
              実際のベンチマークをそのまま再現するのは無理ですが、実用レベルでの推定ならこんな計算式が使えます。
            </BlogParagraph>

            <BlogCallout>
              推定スコア ≒ コア数 × 最大クロック(GHz) × アーキテクチャ係数 × TDP係数 × 1000
            </BlogCallout>
          </BlogSection>

          <BlogSection title="アーキテクチャ係数とTDP係数の目安">
            <BlogParagraph>
              アーキテクチャ係数とTDP係数の目安
            </BlogParagraph>

            <BlogList>
              <li>アーキテクチャ係数：</li>
              <li>Zen2 = 1.0</li>
              <li>Zen3 = 1.2</li>
              <li>Gracemont（Intel N系など） = 0.9</li>
              <li>Firestorm（Apple M1系） = 1.4</li>
            </BlogList>

            <BlogList>
              <li>TDP係数：</li>
              <li>15W = 1.0</li>
              <li>25W = 1.2</li>
              <li>6W以下 = 0.7（超省電力モデル）</li>
            </BlogList>

            <BlogParagraph>
              例として、AMD Ryzen 3 5300U（4C/8T、3.8GHz、Zen2、15W）を計算すると…
            </BlogParagraph>

            <BlogParagraph>
              4 × 3.8 × 1.0 × 1.0 × 1000 = 推定約15,200点 となります。
            </BlogParagraph>

            <BlogParagraph>
              実際のPassmarkは 約8,000点 なので、まだ係数調整が必要ですね。ただ、「だいたいこのくらいの帯域」という比較には使えます。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="推定例：各社CPUの性能イメージ">
            <BlogTable>
              <BlogTableHeader>
                <BlogTableCell>CPU名</BlogTableCell>
                <BlogTableCell>コア/スレッド</BlogTableCell>
                <BlogTableCell>最大GHz</BlogTableCell>
                <BlogTableCell>TDP</BlogTableCell>
                <BlogTableCell>アーキテクチャ</BlogTableCell>
                <BlogTableCell>推定スコア（目安）</BlogTableCell>
              </BlogTableHeader>
              <tbody>
                <BlogTableRow>
                  <BlogTableCell>Intel N100</BlogTableCell>
                  <BlogTableCell>4C/4T</BlogTableCell>
                  <BlogTableCell>3.4</BlogTableCell>
                  <BlogTableCell>6W</BlogTableCell>
                  <BlogTableCell>Gracemont</BlogTableCell>
                  <BlogTableCell>約4500点</BlogTableCell>
                </BlogTableRow>
                <BlogTableRow>
                  <BlogTableCell>AMD Ryzen 3 5300U</BlogTableCell>
                  <BlogTableCell>4C/8T</BlogTableCell>
                  <BlogTableCell>3.8</BlogTableCell>
                  <BlogTableCell>15W</BlogTableCell>
                  <BlogTableCell>Zen2</BlogTableCell>
                  <BlogTableCell>約8000点</BlogTableCell>
                </BlogTableRow>
                <BlogTableRow>
                  <BlogTableCell>Apple M1</BlogTableCell>
                  <BlogTableCell>8C（4P+4E）</BlogTableCell>
                  <BlogTableCell>3.2</BlogTableCell>
                  <BlogTableCell>-</BlogTableCell>
                  <BlogTableCell>Firestorm</BlogTableCell>
                  <BlogTableCell>約15000点</BlogTableCell>
                </BlogTableRow>
                <BlogTableRow>
                  <BlogTableCell>Intel Core i5-1235U</BlogTableCell>
                  <BlogTableCell>10C/12T</BlogTableCell>
                  <BlogTableCell>4.4</BlogTableCell>
                  <BlogTableCell>15W</BlogTableCell>
                  <BlogTableCell>Alder Lake</BlogTableCell>
                  <BlogTableCell>約13000点</BlogTableCell>
                </BlogTableRow>
              </tbody>
            </BlogTable>

            <BlogParagraph>
              もちろん完全一致はしませんが、「このCPUはどのへんの性能帯にいるのか」をつかむには便利です。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="推定の限界と注意点">
            <BlogList>
              <li>アーキテクチャの設計効率（IPC）の違いにより、同じコア数・クロックでもスコアは大きく異なる</li>
              <li>Apple MシリーズなどARMベースのCPUは従来の計算式では精度が低下する傾向がある</li>
              <li>TDPが同じでも、メーカーやシリーズによって性能の出し方が異なる</li>
              <li>GPU性能やメモリ帯域など、他の要因が体感速度に影響する場合もある</li>
            </BlogList>

            <BlogParagraph>
              また、ベンチマークはCPU単体の純粋な計算力を測るので、PC全体の体感速度とはちょっとズレることもあります。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="まとめ：スコア推定は“道具”として実用的">
            <BlogParagraph>
              完璧な数値を求めるなら実測を見るのがベストですが、この簡易式でも以下のようなシーンでは役立ちます。
            </BlogParagraph>

            <BlogList>
              <li>公式ベンチマークが未公開な新型CPUの性能を推測したいとき</li>
              <li>同系統のCPUとの大まかな性能差を比較したいとき</li>
              <li>用途に対して性能が足りているかをざっくり見極めたいとき</li>
            </BlogList>

            <BlogParagraph>
              「ゲーム用にギリ耐えられる？」「動画編集は厳しい？」といった判断にも十分使えるでしょう。CPU選びで迷ったら、この推定式をひとつの“便利ツール”として活用してみてください。
            </BlogParagraph>
          </BlogSection>
        </BlogContent>
      </BlogArticle>
    </BlogLayout>
  )
}