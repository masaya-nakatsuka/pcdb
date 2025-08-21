'use client'

import BlogLayout from '../../../components/blog/BlogLayout'
import { BlogArticle, BlogContent, BlogSection, BlogParagraph, BlogList, BlogCallout, BlogTable, BlogTableHeader, BlogTableCell, BlogTableRow } from '@/components/blog/BlogArticle'
import { blogArticles } from '../../../lib/blogMetadata'

const articleData = blogArticles.find(article => article.id === 2)!

export default function Article2Page() {
  return (
    <BlogLayout>
      <BlogArticle 
        title={articleData.title}
        date={articleData.date}
      >
        <BlogContent>
          <BlogParagraph>
            パソコンを選ぶときって、正直スペック表を見てもピンとこないことってありますよね。そんなときに参考になるのが「Passmarkスコア」です。これはCPUの処理性能を数値で表したベンチマークで、「この数値ならどれくらいの作業が快適か」という目安になります。
          </BlogParagraph>

          <BlogParagraph>
            ただし、必要なスコアは人それぞれ。メールやブラウジングがメインの人と、動画編集をする人では求める性能がまったく違います。今回は、用途別にどのくらいのスコアを目安にすればいいのかをまとめてみました。
          </BlogParagraph>

          <BlogSection title="1. オフィス作業・ブラウジング">
            <BlogParagraph>
              WordやExcelで書類を作ったり、Google Chromeでネット検索したり、YouTubeを見たり。こういう軽めの用途なら、そこまで高いスコアは必要ありません。
            </BlogParagraph>

            <BlogParagraph>
              私も以前、サブPCとして低めのスコアのノートを使っていましたが、メールや会議資料のチェック程度なら問題なかったです。ただ、Chromeでタブを10個以上開くと、ちょっともたつくこともありました。
            </BlogParagraph>

            <BlogList>
              <li>快適に使える目安：3,000〜5,000点</li>
              <li>最低限の使用レベル：2,000〜3,000点</li>
            </BlogList>

            <BlogCallout>
              代表的なCPU：
              Intel N100（約4,500点）：消費電力も低く、静音性に優れる
              Celeron N4020（約2,200点）：価格重視の最低ライン
            </BlogCallout>

            <BlogParagraph>
              複数のタブを開く人や、ウェブ会議をよくする人は、できれば4,000点以上を狙ったほうが安心かなと思います。
            </BlogParagraph>

            <BlogSection title="2. 動画視聴・軽い画像編集">
              <BlogParagraph>
                「4K動画をスムーズに見たい」「ちょっとした写真加工をしたい」という人は、もう少しスコアが必要になります。
              </BlogParagraph>

            <BlogParagraph>
              例えば旅行の写真をCanvaで編集したり、Lightroomで色味を変えたりするくらいなら、6,000〜10,000点くらいあると快適です。私の感覚だと、5,000点台でも4K動画は見られますが、編集作業では待ち時間が増えてくる印象です。
            </BlogParagraph>

              <BlogList>
                <li>4K動画視聴：5,000〜8,000点</li>
                <li>軽い画像編集：6,000〜10,000点</li>
              </BlogList>

              <BlogCallout>
                代表的なCPU：
                Core i3-1115G4（約7,500点）：コスパが良い第11世代Core
                Ryzen 5 5500U（約13,000点）：マルチタスクに強い
              </BlogCallout>

              <BlogParagraph>
                このクラスになると、趣味での動画鑑賞や写真加工はかなり快適になりますね。
              </BlogParagraph>
            </BlogSection>

            <BlogSection title="3. 動画編集・プログラミング">
              <BlogParagraph>
                ここからは、本格的な作業をする人向けです。特に動画編集や3Dモデリング、開発環境を複数立ち上げるような使い方では、CPU性能が作業効率に直結します。
              </BlogParagraph>

            <BlogParagraph>
              私も以前、スコアが1万点を超えるノートPCで動画編集をしたことがありますが、書き出しの速さにかなり差を感じました。
            </BlogParagraph>

              <BlogList>
                <li>フルHD動画編集：10,000〜15,000点</li>
                <li>4K動画編集や3Dモデリング：20,000点以上推奨</li>
              </BlogList>

              <BlogCallout>
                代表的なCPU：
                Core i7-1165G7（約10,500点）：薄型ノートでもパワフル
                Ryzen 7 5700U（約16,000点）：動画処理やマルチスレッドに強い
              </BlogCallout>

              <BlogParagraph>
                プログラミングでも、仮想マシンやDockerを多用する人は1万点以上を選ぶと余裕があります。
              </BlogParagraph>
            </BlogSection>

            <BlogSection title="まとめ">
              <BlogParagraph>
                Passmarkスコアは「性能の見える化」にとても役立つ指標です。もちろん、GPUやメモリも重要ですが、まずはCPU性能の目安を押さえておくと失敗しづらいです。
              </BlogParagraph>

              <BlogTable>
                <BlogTableHeader>
                  <BlogTableCell isHeader={true}>用途</BlogTableCell>
                  <BlogTableCell isHeader={true}>推奨スコア</BlogTableCell>
                  <BlogTableCell isHeader={true}>代表的なCPU</BlogTableCell>
                </BlogTableHeader>
                <tbody>
                  <BlogTableRow>
                    <BlogTableCell>オフィス・Web</BlogTableCell>
                    <BlogTableCell>3,000〜5,000</BlogTableCell>
                    <BlogTableCell>Intel N100, Celeron N4020</BlogTableCell>
                  </BlogTableRow>
                  <BlogTableRow>
                    <BlogTableCell>動画視聴・軽編集</BlogTableCell>
                    <BlogTableCell>5,000〜10,000</BlogTableCell>
                    <BlogTableCell>Core i3-1115G4, Ryzen 5 5500U</BlogTableCell>
                  </BlogTableRow>
                  <BlogTableRow>
                    <BlogTableCell>本格作業</BlogTableCell>
                    <BlogTableCell>10,000〜20,000+</BlogTableCell>
                    <BlogTableCell>Core i7-1165G7, Ryzen 7 5700U</BlogTableCell>
                  </BlogTableRow>
                </tbody>
              </BlogTable>

              <BlogParagraph>
                パソコン選びで迷ったら、「用途」と「スコア」をセットで考えると、自分にちょうどいい1台に出会えるはずですよ。
              </BlogParagraph>
            </BlogSection>
          </BlogSection>
        </BlogContent>
      </BlogArticle>
    </BlogLayout>
  )
}