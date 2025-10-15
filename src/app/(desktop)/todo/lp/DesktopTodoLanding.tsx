import Image from 'next/image'
import Link from 'next/link'

type FeatureHighlight = {
  title: string
  description: string
  points: string[]
  imageSrc?: string
  imageAlt?: string
  imageWidth?: number
  imageHeight?: number
}

const featureHighlights: FeatureHighlight[] = [
  {
    title: '完了ログをタイムライン化',
    description:
      '完了したタスクが時系列で並び、成果の流れと山場がひと目で分かります。',
    points: ['完了ログを自動集計', '時間帯ごとのハイライト', '日々の変化を可視化'],
    imageSrc: '/lp/timeline.webp',
    imageAlt: 'Specsy Todo の完了タイムライン例',
    imageWidth: 2940,
    imageHeight: 974,
  },
  {
    title: '一覧性の高いTODO管理',
    description:
      'ドラッグ操作やステータス更新でリストを直感的に整理。詳細情報もすぐに確認できます。',
    points: ['リストの追加・編集', '未着手/着手中/完了ステータス', 'メモ付きの詳細ビュー'],
  },
  {
    title: 'レベルとXPでゲーミフィケーション',
    description:
      'レベルシステムとXPゲージで継続のモチベーションを維持。小さな積み重ねが数値で返ってきます。',
    points: ['XPゲージで可視化', 'レベル表示で達成感', '完了サマリーで振り返り'],
  },
]

const workflowSteps = [
  {
    label: '01',
    title: '計画を描く',
    description:
      'プロジェクトやテーマごとにリストを作成。必要なタスクをまとめて整理できます。',
  },
  {
    label: '02',
    title: '状態を切り替えて進める',
    description:
      '未着手・着手中・完了ステータスを操作しながらタスクを進行。詳細メモで背景も残せます。',
  },
  {
    label: '03',
    title: 'タイムラインで振り返る',
    description:
      '完了ログが時系列に並び、XPとともに一日の成果をすばやく振り返れます。',
  },
]

const faqItems = [
  {
    question: '無料で使えますか？',
    answer:
      'はい。現在はパブリックベータとして無料で提供しています。今後の有料プラン導入時も、既存ユーザーには事前にご案内します。',
  },
  {
    question: '他デバイスでも同期できますか？',
    answer:
      'Specsy Todo はデスクトップとモバイルのどちらからでも同じアカウントで利用できます。デバイスごとに最適化されたUIを自動で切り替えます。',
  },
  {
    question: 'チーム利用は可能ですか？',
    answer:
      '現在は個人利用に最適化されています。チーム機能はロードマップに含まれており、要望があればぜひフィードバックをお寄せください。',
  },
]

export default function DesktopTodoLanding() {
  return (
    <div className="relative overflow-hidden bg-page-gradient pb-32 text-frost-soft">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-24 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-sky-400/10 blur-3xl" />
      </div>

      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-18 px-6 pt-24 sm:pt-28 lg:px-8">
        <section aria-labelledby="hero" className="relative flex flex-col gap-16">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-night-border bg-night-glass-soft px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-frost-subtle backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              beta access
            </span>
            <h1
              id="hero"
              className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              最小限で高機能<br className="hidden sm:block" />
              自身のスペックを底上げするタスク管理
            </h1>
            <p className="mt-8 text-lg leading-relaxed text-frost-muted sm:text-xl">
              Specsy Todo は完了ログを自動で可視化し、レベルシステムで継続を後押しするデスクトップ向けタスクマネージャーです。
              直感的なUIと軽快な操作感で、プロジェクトも日々のTODOもまとめて整理できます。
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/todo#app"
                className="inline-flex items-center justify-center rounded-full bg-primary-gradient px-7 py-3 text-sm font-semibold text-white shadow-button-primary transition hover:-translate-y-0.5 hover:shadow-button-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
              >
                アプリを起動する
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-full border border-night-border bg-night-glass px-7 py-3 text-sm font-semibold text-frost-soft transition hover:-translate-y-0.5 hover:bg-night-glass-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-200/40"
              >
                主な機能を見る
              </a>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="relative w-full max-w-5xl overflow-hidden rounded-[34px] border border-night-border bg-night-glass shadow-glass-xl backdrop-blur">
              <Image
                src="/lp/all.webp"
                alt="Specsy Todo のデスクトップ画面プレビュー"
                width={1600}
                height={900}
                priority
                className="h-auto w-full object-cover"
                sizes="(min-width: 1280px) 960px, (min-width: 768px) 80vw, 100vw"
                draggable={false}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-900/10 via-transparent to-sky-900/20" />
            </div>
          </div>

          <div className="relative mx-auto grid w-full max-w-5xl gap-6 rounded-3xl border border-night-border bg-night-glass p-8 shadow-glass-xl backdrop-blur-[28px] sm:grid-cols-3">
            <div className="col-span-1 flex flex-col gap-4 rounded-2xl border border-night-border-muted bg-charcoal-deep/60 p-6 shadow-inner">
              <div className="flex items-center gap-2 text-frost-subtle">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/20 text-sky-300">
                  ✓
                </span>
                <span className="text-sm font-semibold uppercase tracking-wide">今日の完了</span>
              </div>
              <div className="text-4xl font-semibold text-white">12 件</div>
              <p className="text-sm leading-relaxed text-frost-muted">
                進捗に応じてグラフが滑らかに伸び、完了のリズムをつかめます。
              </p>
            </div>
            <div className="col-span-1 flex flex-col gap-4 rounded-2xl border border-night-border-muted bg-charcoal-deep/60 p-6 shadow-inner">
              <div className="flex items-center gap-2 text-frost-subtle">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-200">
                  ★
                </span>
                <span className="text-sm font-semibold uppercase tracking-wide">現在のレベル</span>
              </div>
              <div className="text-4xl font-semibold text-white">Lv. 7</div>
              <div className="h-2 overflow-hidden rounded-full bg-night-border">
                <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-fuchsia-500" />
              </div>
              <p className="text-sm leading-relaxed text-frost-muted">
                XPゲージがリアルタイムで更新され、達成のたびにモチベーションが上がります。
              </p>
            </div>
            <div className="col-span-1 flex flex-col gap-4 rounded-2xl border border-night-border-muted bg-charcoal-deep/60 p-6 shadow-inner">
              <div className="flex items-center gap-2 text-frost-subtle">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/20 text-violet-200">
                  ◑
                </span>
                <span className="text-sm font-semibold uppercase tracking-wide">状態管理と詳細</span>
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <p className="text-sm leading-relaxed text-frost-muted">
                  ステータスの更新や詳細メモの編集がその場で完結。進捗と背景情報をまとめて管理できます。
                </p>
                <div className="mt-6 rounded-2xl border border-sky-500/50 bg-sky-500/10 px-4 py-3 text-xs uppercase tracking-wide text-sky-200">
                  着手中のタスク 4 件 / 完了 12 件
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* todoの詳細編集で進捗やメモや詳細なTODOを残せることをアピール */}
        <section>
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-5xl overflow-hidden rounded-[34px] border border-night-border bg-night-glass shadow-glass-xl backdrop-blur">
              <Image
                src="/lp/edit.webp"
                alt="Specsy Todo のデスクトップ画面プレビュー"
                width={1600}
                height={900}
                priority
                className="h-auto w-full object-cover"
                sizes="(min-width: 1280px) 960px, (min-width: 768px) 80vw, 100vw"
                draggable={false}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-900/10 via-transparent to-sky-900/20" />
            </div>
          </div>
          <div className="mx-auto mt-12 grid w-full max-w-5xl gap-8 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div className="flex flex-col gap-4">
              <h3 className="text-2xl font-semibold text-white">タスクに文脈を残す詳細ドロワー</h3>
              <p className="text-base leading-relaxed text-frost-soft">
                一つのTODOに対してチェックリストやメモをまとめて記録。進捗を切り替えるたびに、最新の状態と背景が揃っていきます。
              </p>
              <p className="text-base leading-relaxed text-frost-muted">
                タイムラインに反映される内容もこの画面から編集でき、レビューしたい情報を漏れなく残せます。
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-night-border-muted bg-charcoal-deep/70 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-frost-subtle">detail tools</p>
              <ul className="flex flex-col gap-3 text-xs text-frost-muted">
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-sky-400" />
                  サブタスクで実作業を細分化し、残タスク量を可視化。
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-sky-400" />
                  メモ欄にアイデアやリンクを保存し、次回すぐ再開。
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-sky-400" />
                  完了ログや期限も同じ画面で編集し、記録の精度をキープ。
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 完了したTODOが自動的にタイムラインへ記述されることをアピール */}
        <section>
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-5xl overflow-hidden rounded-[34px] border border-night-border bg-night-glass shadow-glass-xl backdrop-blur">
              <Image
                src="/lp/timeline.webp"
                alt="Specsy Todo のデスクトップ画面プレビュー"
                width={1600}
                height={900}
                priority
                className="h-auto w-full object-cover"
                sizes="(min-width: 1280px) 960px, (min-width: 768px) 80vw, 100vw"
                draggable={false}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-900/10 via-transparent to-sky-900/20" />
            </div>
          </div>
          <div className="mx-auto mt-12 grid w-full max-w-5xl gap-8 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div className="flex flex-col gap-4">
              <h3 className="text-2xl font-semibold text-white">完了の流れが光る自動タイムライン</h3>
              <p className="text-base leading-relaxed text-frost-soft">
                アプリ内の完了ログは、日時やステータスをもとに自動でタイムライン化。日々のピークが視覚的に浮かび上がります。
              </p>
              <p className="text-base leading-relaxed text-frost-muted">
                リストやグループ単位で色分けされ、達成の偏りや集中時間を手軽に振り返れます。
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-night-border-muted bg-charcoal-deep/70 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-frost-subtle">timeline insights</p>
              <ul className="flex flex-col gap-3 text-xs text-frost-muted">
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-sky-400" />
                  完了と同時に記録され、ビューを切り替える手間なし。
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-sky-400" />
                  日時・リスト・XPを組み合わせて進捗の波をキャッチ。
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-sky-400" />
                  週次の振り返りもスクロールするだけで完了。
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section
          id="features"
          aria-labelledby="features-title"
          className="relative flex flex-col gap-12 rounded-3xl border border-night-border bg-night-glass p-12 shadow-glass-xl backdrop-blur-[26px]"
        >
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-frost-subtle">features</p>
            <h2 id="features-title" className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
              作業のリズムを整える3つの体験
            </h2>
            <p className="mt-4 text-base leading-relaxed text-frost-muted">
              タスクを片付けるだけでなく、継続したい気持ちそのものをデザインしました。Specsy Todo は達成体験を細かくフィードバックし、次の一歩を自然に引き出します。
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {featureHighlights.map((feature) => (
              <article
                key={feature.title}
                className="flex flex-col gap-4 rounded-3xl border border-night-border-muted bg-charcoal-deep/70 p-6 transition duration-200 hover:-translate-y-1 hover:shadow-card-hover"
              >
                <div className="flex items-center gap-3 text-sm font-semibold text-sky-200">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/15 backdrop-blur">
                    <span className="text-lg">✦</span>
                  </span>
                  {feature.title}
                </div>
                <p className="text-sm leading-relaxed text-frost-soft">{feature.description}</p>
                <ul className="mt-4 flex flex-col gap-2 text-sm text-frost-muted">
                  {feature.points.map((point) => (
                    <li key={point} className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-sky-500/40 text-[0.65rem] text-sky-200">
                        ●
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
                {feature.imageSrc ? (
                  <div className="relative mt-5 overflow-hidden rounded-2xl border border-night-border bg-night-glass">
                    <Image
                      src={feature.imageSrc}
                      alt={feature.imageAlt ?? feature.title}
                      width={feature.imageWidth ?? 1600}
                      height={feature.imageHeight ?? 900}
                      className="h-auto w-full object-cover"
                      sizes="(min-width: 1280px) 360px, (min-width: 768px) 60vw, 90vw"
                      loading="lazy"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-slate-900/20 via-transparent to-sky-900/25" />
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="workflow-title"
          className="relative overflow-hidden rounded-3xl border border-night-border bg-gradient-to-br from-indigo-900/80 via-sky-900/60 to-slate-900/70 p-[1px]"
        >
          <div className="relative flex flex-col gap-12 rounded-[26px] bg-charcoal-deep/80 p-12 shadow-glass-xl backdrop-blur-[30px]">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-200">workflow</p>
              <h2 id="workflow-title" className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
                途切れないワークフローを実現
              </h2>
              <p className="mt-4 text-base leading-relaxed text-frost-muted">
                計画・実行・振り返りをワンストップで。Specsy Todo は進捗を自動集計し、次のタスクに意識を向けやすくします。
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {workflowSteps.map((step) => (
                <div
                  key={step.label}
                  className="flex flex-col gap-4 rounded-3xl border border-sky-500/30 bg-sky-500/10 p-6 shadow-inner"
                >
                  <span className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-200">
                    {step.label}
                  </span>
                  <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-sky-100/80">{step.description}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-6 rounded-3xl border border-night-border bg-night-glass p-8 sm:grid-cols-2">
              <div className="flex flex-col gap-3">
                <h3 className="text-lg font-semibold text-white">完了サマリーとXP</h3>
                <p className="text-sm leading-relaxed text-frost-muted">
                  1日の完了数と獲得XPをまとめて確認。次に伸ばしたい時間帯やタスクが見えてきます。
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-lg font-semibold text-white">TODO詳細ビュー</h3>
                <p className="text-sm leading-relaxed text-frost-muted">
                  タスクの背景メモや関連情報を一覧からすぐに開けるので、文脈を失わずに作業を続けられます。
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="testimonial-title"
          className="relative grid gap-8 rounded-3xl border border-night-border bg-night-glass p-12 shadow-glass-xl backdrop-blur-[28px] lg:grid-cols-[1.2fr,0.8fr]"
        >
          <div className="flex flex-col gap-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-frost-subtle">feedback</p>
            <h2 id="testimonial-title" className="text-3xl font-semibold text-white sm:text-4xl">
              使い続けているクリエイターの声
            </h2>
            <blockquote className="rounded-3xl border border-sky-500/20 bg-sky-500/10 p-8 text-lg text-sky-100 shadow-inner">
              <p>
                「完了したタスクがタイムラインで光る瞬間が最高です。ステータス更新が軽快で、一日のテンポが整い、
                作業がリズムワークに変わりました。」
              </p>
              <footer className="mt-6 text-sm text-sky-200/80">UI / UX デザイナー Mさん</footer>
            </blockquote>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-night-border-muted bg-charcoal-deep/70 p-6">
                <div className="text-3xl font-semibold text-white">+36%</div>
                <p className="mt-2 text-sm text-frost-muted">週次の完了タスク数がベータ参加後に増加</p>
              </div>
              <div className="rounded-2xl border border-night-border-muted bg-charcoal-deep/70 p-6">
                <div className="text-3xl font-semibold text-white">92%</div>
                <p className="mt-2 text-sm text-frost-muted">継続利用者が「作業リズムが整った」と回答</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-6 rounded-3xl border border-night-border-muted bg-charcoal-deep/60 p-8">
            <h3 className="text-lg font-semibold text-white">最新アップデート</h3>
            <ul className="flex flex-col gap-4 text-sm text-frost-muted">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-sky-400" />
                完了タイムラインでリストやグループの色分けに対応し、追跡しやすくなりました。
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-sky-400" />
                XPカードを刷新し、現在のレベルと次の到達点が直感的に把握できます。
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-sky-400" />
                タスク詳細ドロワーでメモ編集とステータス更新をよりスムーズに行えるよう改善しました。
              </li>
            </ul>
            <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 px-6 py-4 text-sm text-sky-100">
              新機能のリクエストはアプリ右下のフィードバックボタンからいつでも送信できます。
            </div>
          </div>
        </section>

        <section
          aria-labelledby="faq-title"
          className="relative flex flex-col gap-10 rounded-3xl border border-night-border bg-night-glass p-12 shadow-glass-xl backdrop-blur-[28px]"
        >
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-frost-subtle">faq</p>
            <h2 id="faq-title" className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
              よくある質問
            </h2>
            <p className="mt-4 text-base leading-relaxed text-frost-muted">
              プランや機能、今後のアップデートに関するお問い合わせをまとめました。
            </p>
          </div>
          <div className="grid gap-6">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="group rounded-3xl border border-night-border-muted bg-charcoal-deep/70 p-6"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-lg font-semibold text-white">
                  {item.question}
                  <span className="transition duration-200 group-open:rotate-45">＋</span>
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-frost-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="cta-title"
          className="relative overflow-hidden rounded-3xl border border-sky-500/30 bg-gradient-to-br from-sky-500/25 via-indigo-500/25 to-fuchsia-500/20 p-[1px]"
        >
          <div className="relative flex flex-col gap-8 rounded-[26px] bg-charcoal-deep/85 p-12 text-center shadow-glass-xl backdrop-blur-[30px]">
            <div className="absolute inset-x-8 inset-y-10 rounded-3xl border border-sky-500/20" />
            <div className="relative flex flex-col gap-4">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-200">get started</p>
              <h2 id="cta-title" className="text-3xl font-semibold text-white sm:text-4xl">
                今日のタスク管理を、感情に寄り添う体験へ
              </h2>
              <p className="text-base leading-relaxed text-sky-100/80">
                Specsy Todo はベータ期間中にたくさんのフィードバックを受け付けています。ぜひ実際に触れて、作業リズムの変化を体感してください。
              </p>
            </div>
            <div className="relative flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/todo#app"
                className="inline-flex items-center justify-center rounded-full bg-primary-gradient px-8 py-3 text-sm font-semibold text-white shadow-button-primary transition hover:-translate-y-0.5 hover:shadow-button-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
              >
                いますぐ使ってみる
              </Link>
              <a
                href="mailto:hello@specsy.app?subject=Specsy%20Todo%20Feedback"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
              >
                フィードバックを送る
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
