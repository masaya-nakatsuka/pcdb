'use client'

import BlogLayout from '../../../components/blog/BlogLayout'
import { BlogArticle, BlogContent, BlogSection, BlogParagraph, BlogList, BlogCallout, BlogTable, BlogTableHeader, BlogTableCell, BlogTableRow } from '@/components/blog/BlogArticle'
import { blogArticles } from '../../../lib/blogMetadata'

const articleData = blogArticles.find(article => article.id === 'article1')!

/**
[h2]誰でも“自分に合ったPC”を選べる世界へ[/h2]

私たちは日々、たくさんの選択肢に囲まれて生きています。中でも「パソコン選び」は、その性能・価格・サイズ・バッテリー・ブランドなど、比較軸が多すぎて、多くの人にとって非常に難しい選択になっています。

特にAmazonなどのECサイトには、魅力的なPCが数多く並んでいますが、**「結局どれが自分に合っているのか分からない」**という声は絶えません。同じ画面サイズでも中身はまったく違い、価格の差が“どこに効いているのか”が見えにくいのです。

この課題に対し、私たちはひとつのアプローチを提示しました。
それが、PCの仕様（スペック）をロジックに基づいてスコア化し、数値として「見える化」するという試みです。

[h2]スペックをスコアに変換するという挑戦[/h2]

どのPCにも、CPU性能、メモリ容量、ストレージ、画面サイズ、バッテリー持ちなど、多くの仕様情報が公開されています。しかし、それらを“人間の感覚”で評価しようとすると、どうしても経験や知識の差が出てしまいます。

そこで、私たちは特定のロジックに基づいて、それぞれのPCにスコアを算出し、比較できる形にしました。
（※スコア算出ロジックは非公開ですが、信頼性と直感的理解を重視しています）

[h2]使う人に合わせた最適解を[/h2]

当然ながら、「良いPC」の定義はひとつではありません。
モバイル用途で使いたい人と、動画編集に使いたい人では、重視するスペックはまったく異なります。
そのため、「使い方」ごとにスコアの重みを変えて最適なPCを導き出すという仕組みも取り入れました。

[list]
外出先での資料閲覧 → 軽さとバッテリーを重視
在宅でのWeb会議 → カメラ・CPUバランスを重視
軽い動画編集 → CPUとメモリのスコアを強化
[/list]

このように、使う人のシーンに合わせて“点数の見え方”が変わる構成になっています。

[h2]選択を、もっと明快に。[/h2]

「なんとなく良さそう」で買って、あとから後悔する。
「比較がめんどくさいから、価格だけで決めた」。
そんなPC選びの課題を、私たちは少しでも解消したいと考えています。

[list]
スペックがわからなくても、点数を見れば違いがわかる
使い方に応じて、おすすめの傾向が見えてくる
無駄なハイスペックやスペック不足を防げる
[/list]

最終的には、誰でも迷わず“自分に合ったPC”を選べる世界を作ることが、私たちの目指すゴールです。
今回のプロダクトは、その第一歩です。
 */

export default function Article1Page() {
  return (
    <BlogLayout>
      <BlogArticle 
        title={articleData.title}
        date={articleData.date}
      >
        <BlogContent>
          <BlogParagraph>
            私たちは日々、たくさんの選択肢に囲まれて生きています。中でも「パソコン選び」は、その性能・価格・サイズ・バッテリー・ブランドなど、比較軸が多すぎて、多くの人にとって非常に難しい選択になっています。
          </BlogParagraph>

          <BlogParagraph>
            特にAmazonなどのECサイトには、魅力的なPCが数多く並んでいますが、**「結局どれが自分に合っているのか分からない」**という声は絶えません。同じ画面サイズでも中身はまったく違い、価格の差が“どこに効いているのか”が見えにくいのです。
          </BlogParagraph>

          <BlogParagraph>
            この課題に対し、私たちはひとつのアプローチを提示しました。それが、PCの仕様（スペック）をロジックに基づいてスコア化し、数値として「見える化」するという試みです。
          </BlogParagraph>

          <BlogSection title="スペックをスコアに変換するという挑戦">
            <BlogParagraph>
              どのPCにも、CPU性能、メモリ容量、ストレージ、画面サイズ、バッテリー持ちなど、多くの仕様情報が公開されています。しかし、それらを“人間の感覚”で評価しようとすると、どうしても経験や知識の差が出てしまいます。
            </BlogParagraph>

            <BlogParagraph>
              そこで、私たちは特定のロジックに基づいて、それぞれのPCにスコアを算出し、比較できる形にしました。（※スコア算出ロジックは非公開ですが、信頼性と直感的理解を重視しています）
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="使う人に合わせた最適解を">
            <BlogParagraph>
              当然ながら、「良いPC」の定義はひとつではありません。モバイル用途で使いたい人と、動画編集に使いたい人では、重視するスペックはまったく異なります。そのため、「使い方」ごとにスコアの重みを変えて最適なPCを導き出すという仕組みも取り入れました。
            </BlogParagraph>

            <BlogList>
              <li>外出先での資料閲覧 → 軽さとバッテリーを重視</li>
              <li>在宅でのWeb会議 → カメラ・CPUバランスを重視</li>
              <li>軽い編集業務 → CPUとメモリのスコアを強化</li>
            </BlogList>

            <BlogParagraph>
              このように、使う人のシーンに合わせて“点数の見え方”が変わる構成になっています。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="選択を、もっと明快に。">
            <BlogParagraph>
              “なんとなく良さそう”で買って、あとから後悔する。<br />“比較がめんどくさいから、価格だけで決めた”。<br />そんなPC選びの課題を、私たちは少しでも解消したいと考えています。
            </BlogParagraph>

            <BlogList>
              <li>スペックがわからなくても、点数を見れば違いがわかる</li>
              <li>使い方に応じて、おすすめの傾向が見えてくる</li>
              <li>無駄なハイスペックやスペック不足を防げる</li>
            </BlogList>

            <BlogParagraph>
              最終的には、誰でも迷わず“自分に合ったPC”を選べる世界を作ることが、私たちの目指すゴールです。
            </BlogParagraph>

            <BlogParagraph>
              今回のプロダクトは、その第一歩です。
            </BlogParagraph>

            {/* aタグ：pc-listページへのリンク */}
            <a href="/pc-list" target="_blank" rel="noopener noreferrer">PCスコア一覧</a>
          </BlogSection>
        </BlogContent>
      </BlogArticle>
    </BlogLayout>
  )
}