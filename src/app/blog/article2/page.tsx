'use client'

import BlogLayout from '../../../components/blog/BlogLayout'
import { BlogArticle, BlogContent, BlogSection, BlogParagraph, BlogList, BlogCallout, BlogTable, BlogTableHeader, BlogTableCell, BlogTableRow } from '@/components/blog/BlogArticle'
import { blogArticles } from '../../../lib/blogMetadata'

const articleData = blogArticles.find(article => article.id === 'article2')!

/**
 * 
用途ごとのPassmarkスコア目安：自分に合ったPC選びのために
パソコン選びで悩んだとき、客観的な指標として活用できるのが「Passmarkスコア」です。Passmarkは、CPUの処理能力を数値化したベンチマークで、PCのパフォーマンスを見極めるうえで非常に参考になります。しかし、用途に応じて必要なスコアは異なるため、自分の目的に合った目安を把握することが重要です。この記事では、用途別に推奨されるPassmarkスコアと代表的なCPUを紹介します。

1. オフィス作業・ブラウジング
WordやExcelを使った文書作成、Google Chromeによるウェブ閲覧、YouTubeでの動画視聴といった基本的な用途であれば、比較的低めのスコアでも快適に動作します。

快適に使える目安：3,000〜5,000点

最低限の使用レベル：2,000〜3,000点

代表的なCPU：

Intel N100（約4,500点）：消費電力も低く、静音性に優れる

Celeron N4020（約2,200点）：価格重視の最低ライン

このレベルであれば、メールや書類仕事、ウェブ会議にも問題なく対応できます。ただし複数タブを開いて作業する場合は、4,000点以上を選んだほうが快適です。

2. 動画視聴・軽い画像編集
高解像度動画や簡単な画像編集を行う場合は、やや高めのCPU性能が求められます。

4K動画視聴：5,000〜8,000点

軽い画像編集（CanvaやLightroomなど）：6,000〜10,000点

代表的なCPU：

Core i3-1115G4（約7,500点）：第11世代のCoreシリーズでコスパ良好

Ryzen 5 5500U（約13,000点）：マルチスレッド性能も高く快適

このクラスになると、写真のトリミングや色調補正などもスムーズにこなせるようになります。動画視聴や家庭での軽作業には最適なレンジです。

3. 動画編集・プログラミング
本格的な用途では、より高いPassmarkスコアが必要です。特に動画編集や重めの開発環境では、CPU性能が作業効率に直結します。

フルHD動画編集：10,000〜15,000点

4K動画編集や3Dモデリング：20,000点以上推奨

代表的なCPU：

Core i7-1165G7（約10,500点）：薄型ノート向けでも強力

Ryzen 7 5700U（約16,000点）：マルチコア活用で動画処理に強い

また、プログラミングにおいても、仮想環境や複数ツールを同時に動かすケースでは、10,000点を超えるCPUが望ましいです。

まとめ
Passmarkスコアは、CPUの処理性能を視覚的に理解するための強力な指標です。下記のように、自分の用途に応じたスコアを目安にすれば、コストと性能のバランスを最適化できます。

用途	推奨スコア	代表的なCPU
オフィス・Web	3,000〜5,000	Intel N100, Celeron N4020
動画視聴・軽編集	5,000〜10,000	Core i3-1115G4, Ryzen 5 5500U
本格作業	10,000〜20,000+	Core i7-1165G7, Ryzen 7 5700U

購入時には、価格だけでなく、Passmarkスコアという“見える指標”を参考にして、自分にピッタリな1台を選びましょう。

必要に応じて画像や表などを追加すれば、より視覚的に伝わる記事になります。構成やトーンなどの調整も可能ですので、ご希望があればお知らせください。
 */

export default function Article2Page() {
  return (
    <BlogLayout>
      <BlogArticle 
        title={articleData.title}
        date={articleData.date}
      >
        <BlogContent>
          <BlogParagraph>
            パソコン選びで悩んだとき、客観的な指標として活用できるのが「Passmarkスコア」です。Passmarkは、CPUの処理能力を数値化したベンチマークで、PCのパフォーマンスを見極めるうえで非常に参考になります。しかし、用途に応じて必要なスコアは異なるため、自分の目的に合った目安を把握することが重要です。この記事では、用途別に推奨されるPassmarkスコアと代表的なCPUを紹介します。
          </BlogParagraph>

          <BlogSection title="1. オフィス作業・ブラウジング">
            <BlogParagraph>
              WordやExcelを使った文書作成、Google Chromeによるウェブ閲覧、YouTubeでの動画視聴といった基本的な用途であれば、比較的低めのスコアでも快適に動作します。
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
              このレベルであれば、メールや書類仕事、ウェブ会議にも問題なく対応できます。ただし複数タブを開いて作業する場合は、4,000点以上を選んだほうが快適です。
            </BlogParagraph>

            <BlogSection title="2. 動画視聴・軽い画像編集">
              <BlogParagraph>
                高解像度動画や簡単な画像編集を行う場合は、やや高めのCPU性能が求められます。
              </BlogParagraph>

              <BlogList>
                <li>4K動画視聴：5,000〜8,000点</li>
                <li>軽い画像編集（CanvaやLightroomなど）：6,000〜10,000点</li>
              </BlogList>

              <BlogCallout>
                代表的なCPU：
                Core i3-1115G4（約7,500点）：第11世代のCoreシリーズでコスパ良好
                Ryzen 5 5500U（約13,000点）：マルチスレッド性能も高く快適
              </BlogCallout>

              <BlogParagraph>
                このクラスになると、写真のトリミングや色調補正などもスムーズにこなせるようになります。動画視聴や家庭での軽作業には最適なレンジです。
              </BlogParagraph>
            </BlogSection>

            <BlogSection title="3. 動画編集・プログラミング">
              <BlogParagraph>
                本格的な用途では、より高いPassmarkスコアが必要です。特に動画編集や重めの開発環境では、CPU性能が作業効率に直結します。
              </BlogParagraph>

              <BlogList>
                <li>フルHD動画編集：10,000〜15,000点</li>
                <li>4K動画編集や3Dモデリング：20,000点以上推奨</li>
              </BlogList>

              <BlogCallout>
                代表的なCPU：
                Core i7-1165G7（約10,500点）：薄型ノート向けでも強力
                Ryzen 7 5700U（約16,000点）：マルチコア活用で動画処理に強い
              </BlogCallout>

              <BlogParagraph>
                また、プログラミングにおいても、仮想環境や複数ツールを同時に動かすケースでは、10,000点を超えるCPUが望ましいです。
              </BlogParagraph>
            </BlogSection>

            <BlogSection title="まとめ">
              <BlogParagraph>
                Passmarkスコアは、CPUの処理性能を視覚的に理解するための強力な指標です。下記のように、自分の用途に応じたスコアを目安にすれば、コストと性能のバランスを最適化できます。
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
                購入時には、価格だけでなく、Passmarkスコアという“見える指標”を参考にして、自分にピッタリな1台を選びましょう。
              </BlogParagraph>
            </BlogSection>
          </BlogSection>
        </BlogContent>
      </BlogArticle>
    </BlogLayout>
  )
}