'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import PcListHeader from '../pc-list/PcListHeader'

type Usage = 'office' | 'mobile' | 'student' | 'creative' | 'gaming' | 'home'
type Budget = 'low' | 'standard' | 'high' | 'premium'
type Mobility = 'daily' | 'sometimes' | 'home'
type PurchasePlace = 'amazon' | 'retail' | 'maker' | 'used'

interface CheckState {
  usage: Usage
  budget: Budget
  mobility: Mobility
  purchasePlace: PurchasePlace
  office: boolean
  webMeeting: boolean
  gaming: boolean
  creative: boolean
  programming: boolean
  accounting: boolean
}

interface Choice<T extends string> {
  value: T
  label: string
  note: string
}

interface Result {
  score: number
  title: string
  summary: string
  primaryHref: string
  primaryLabel: string
  specLine: string
  buyConditions: string[]
  avoidConditions: string[]
  nextLinks: Array<{
    href: string
    label: string
    note: string
  }>
}

const usageChoices: Array<Choice<Usage>> = [
  { value: 'office', label: '仕事・Office', note: 'Excel、資料作成' },
  { value: 'mobile', label: '持ち運び', note: '通学、外回り' },
  { value: 'student', label: '学生・学習', note: 'レポート、授業' },
  { value: 'creative', label: '制作', note: '画像・動画編集' },
  { value: 'gaming', label: 'ゲーム', note: 'GPUも確認' },
  { value: 'home', label: '家用', note: '動画、写真整理' },
]

const budgetChoices: Array<Choice<Budget>> = [
  { value: 'low', label: '5万円前後', note: '最低限を安全に選ぶ' },
  { value: 'standard', label: '8万円前後', note: '失敗しにくい実用帯' },
  { value: 'high', label: '12万円前後', note: '長く使うメインPC' },
  { value: 'premium', label: '15万円以上', note: '制作・ゲームも視野' },
]

const mobilityChoices: Array<Choice<Mobility>> = [
  { value: 'daily', label: '毎日持ち運ぶ', note: '軽さと電池持ちを優先' },
  { value: 'sometimes', label: 'たまに持ち出す', note: '画面サイズとのバランス' },
  { value: 'home', label: 'ほぼ据え置き', note: '性能と画面の見やすさ重視' },
]

const purchasePlaceChoices: Array<Choice<PurchasePlace>> = [
  { value: 'amazon', label: 'Amazon中心', note: '価格と在庫を早く見たい' },
  { value: 'retail', label: '量販店も見る', note: '保証や相談も重視' },
  { value: 'maker', label: 'メーカー直販', note: '構成や保証を選びたい' },
  { value: 'used', label: '中古も可', note: '価格優先で候補を広げる' },
]

const featureChoices: Array<{
  key: keyof Pick<CheckState, 'office' | 'webMeeting' | 'gaming' | 'creative' | 'programming' | 'accounting'>
  label: string
  note: string
}> = [
  { key: 'office', label: 'Office', note: 'Word / Excel' },
  { key: 'webMeeting', label: 'Web会議', note: 'カメラ・端子' },
  { key: 'gaming', label: 'ゲーム', note: 'GPU・冷却' },
  { key: 'creative', label: '動画・画像編集', note: 'CPU / GPU' },
  { key: 'programming', label: 'プログラミング', note: '16GB目安' },
  { key: 'accounting', label: '会計・確定申告', note: '画面・テンキー' },
]

const initialState: CheckState = {
  usage: 'office',
  budget: 'standard',
  mobility: 'sometimes',
  purchasePlace: 'amazon',
  office: true,
  webMeeting: true,
  gaming: false,
  creative: false,
  programming: false,
  accounting: false,
}

function clampScore(score: number) {
  return Math.max(38, Math.min(96, score))
}

function buildResult(state: CheckState): Result {
  const heavyWork = state.usage === 'gaming' || state.usage === 'creative' || state.gaming || state.creative
  const lowBudgetHeavy = state.budget === 'low' && heavyWork
  const dailyCarry = state.mobility === 'daily'
  const shouldPreferUsed = state.purchasePlace === 'used' && state.budget === 'low'

  let score = 74

  if (state.budget === 'standard') score += 8
  if (state.budget === 'high') score += 12
  if (state.budget === 'premium') score += 14
  if (state.budget === 'low') score -= 8
  if (dailyCarry) score -= state.budget === 'low' ? 8 : 2
  if (lowBudgetHeavy) score -= 24
  if (state.programming && state.budget === 'low') score -= 6
  if (state.webMeeting && state.budget === 'low') score -= 4
  if (shouldPreferUsed) score += 4

  const finalScore = clampScore(score)

  const primaryHref = (() => {
    if (state.usage === 'gaming' || state.gaming) return '/pc-list/gaming'
    if (state.usage === 'creative' || state.creative) return '/pc-list/video-editing'
    if (dailyCarry || state.usage === 'mobile') return '/pc-list/mobile'
    if (shouldPreferUsed) return '/pc-list/used'
    if (state.budget === 'low') return '/pc-list/cost-performance?q=N100'
    if (state.usage === 'home') return '/pc-list/home'
    return '/pc-list/cafe'
  })()

  const primaryLabel = (() => {
    if (primaryHref.includes('gaming')) return 'ゲーム向け候補を見る'
    if (primaryHref.includes('video-editing')) return '制作向け候補を見る'
    if (primaryHref.includes('mobile')) return '軽量ノートを見る'
    if (primaryHref.includes('used')) return '中古候補を見る'
    if (primaryHref.includes('cost-performance')) return 'コスパ候補を見る'
    return '候補PCを見る'
  })()

  const specLine = (() => {
    if (heavyWork) return '16GB+ / SSD512GB+ / GPU目安'
    if (state.budget === 'low') return '8GB-16GB / SSD256GB+'
    return '16GB / SSD512GB / Core i5級'
  })()

  const buyConditions = [
    specLine,
    dailyCarry ? '毎日持つなら1.3kg前後' : '据え置きなら画面と端子を優先',
    state.office || state.accounting ? 'Office代込みで総額を見る' : '不要な高性能を削る',
  ]

  const avoidConditions = [
    lowBudgetHeavy ? '5万円で制作・ゲームまで1台化' : 'CPU型番が分からない商品',
    state.budget === 'low' ? '4GB / eMMC / 古すぎるCPU' : '高価格なのに8GB / 256GB止まり',
    dailyCarry ? '本体1.5kg超の持ち歩き' : '価格だけで決める買い方',
  ]

  const title = finalScore >= 82
    ? 'この条件なら買う候補を絞れます'
    : finalScore >= 65
      ? '条件を少し絞ると失敗しにくいです'
      : '予算か用途を分けた方が安全です'

  const summary = finalScore >= 82
    ? 'このまま候補比較へ進めます。'
    : finalScore >= 65
      ? '優先順位を1つ決めると絞れます。'
      : '用途か予算を分けた方が安全です。'

  const nextLinks = [
    { href: primaryHref, label: primaryLabel, note: '条件に近い候補へ' },
    dailyCarry
      ? { href: '/pc-list/used', label: '中古も比較', note: '予算を抑える' }
      : { href: '/monitor-list', label: 'モニターも見る', note: '家用・仕事用に' },
  ]

  return {
    score: finalScore,
    title,
    summary,
    primaryHref,
    primaryLabel,
    specLine,
    buyConditions,
    avoidConditions,
    nextLinks,
  }
}

export default function PcCheckClient() {
  const [state, setState] = useState<CheckState>(initialState)
  const result = useMemo(() => buildResult(state), [state])
  const scoreTone = result.score >= 82 ? 'good' : result.score >= 65 ? 'middle' : 'risk'
  const scoreColor = result.score >= 82 ? '#0f766e' : result.score >= 65 ? '#2563eb' : '#b45309'

  const setField = <K extends keyof CheckState>(key: K, value: CheckState[K]) => {
    setState((current) => ({ ...current, [key]: value }))
  }

  const toggleFeature = (key: keyof Pick<CheckState, 'office' | 'webMeeting' | 'gaming' | 'creative' | 'programming' | 'accounting'>) => {
    setState((current) => ({ ...current, [key]: !current[key] }))
  }

  return (
    <div className="pc-check-page">
      <PcListHeader />
      <main className="pc-check-main">
        <section className="pc-check-hero">
          <div className="pc-check-hero__copy">
            <p className="pc-check-kicker">PC購入前チェック</p>
            <h1>買ってから後悔しない条件を先に決める</h1>
            <p>
              用途と予算から、買ってよい条件だけに絞ります。
            </p>
          </div>
          <div className={`pc-check-hero__panel pc-check-hero__panel--${scoreTone}`} aria-label="診断結果サマリー">
            <div className="pc-check-panel__eyebrow">
              <span>Live diagnosis</span>
              <strong>{result.score >= 82 ? 'Ready' : result.score >= 65 ? 'Review' : 'Careful'}</strong>
            </div>
            <div className="pc-check-score-card">
              <div
                className="pc-check-score-ring"
                style={{
                  background: `conic-gradient(${scoreColor} ${result.score * 3.6}deg, #e2e8f0 0deg)`,
                }}
                aria-hidden="true"
              >
                <div className="pc-check-score-ring__inner">
                  <span>{result.score}</span>
                  <small>/100</small>
                </div>
              </div>
              <div>
                <h2>{result.title}</h2>
                <p>{result.summary}</p>
              </div>
            </div>
            <Link href={result.primaryHref} className="pc-check-primary-link">
              {result.primaryLabel}
            </Link>
          </div>
        </section>

        <section className="pc-check-grid" aria-label="PC購入前チェック項目">
          <div className="pc-check-form">
            <div className="pc-check-form__intro">
              <span>Input</span>
              <strong>条件を選ぶ</strong>
            </div>
            <ChoiceGroup
              step="01"
              title="主な用途"
              choices={usageChoices}
              value={state.usage}
              onChange={(value) => setField('usage', value)}
            />

            <ChoiceGroup
              step="02"
              title="予算"
              choices={budgetChoices}
              value={state.budget}
              onChange={(value) => setField('budget', value)}
            />

            <ChoiceGroup
              step="03"
              title="持ち運び"
              choices={mobilityChoices}
              value={state.mobility}
              onChange={(value) => setField('mobility', value)}
            />

            <ChoiceGroup
              step="04"
              title="買う場所"
              choices={purchasePlaceChoices}
              value={state.purchasePlace}
              onChange={(value) => setField('purchasePlace', value)}
            />

            <div className="pc-check-section">
              <div className="pc-check-section__head">
                <div>
                  <span className="pc-check-section__step">05</span>
                  <h2>必要な作業</h2>
                </div>
                <span>複数選択</span>
              </div>
              <div className="pc-check-feature-grid">
                {featureChoices.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={`pc-check-feature${state[item.key] ? ' pc-check-feature--active' : ''}`}
                    aria-pressed={state[item.key]}
                    onClick={() => toggleFeature(item.key)}
                  >
                    <span className="pc-check-choice__marker" aria-hidden="true" />
                    <span className="pc-check-choice__body">
                      <strong>{item.label}</strong>
                      <span>{item.note}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="pc-check-result" aria-label="診断結果">
            <div className="pc-check-result__header">
              <span>Personal report</span>
              <h2>{result.title}</h2>
            </div>
            <div className="pc-check-result__top">
              <span>推奨ライン</span>
              <strong>{result.specLine}</strong>
            </div>

            <ResultList title="買ってよい条件" items={result.buyConditions} tone="good" />
            <ResultList title="避けたい条件" items={result.avoidConditions} tone="warn" />

            <div className="pc-check-next">
              <h2>次に見るページ</h2>
              <div className="pc-check-next__list">
                {result.nextLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="pc-check-next__link">
                    <strong>{link.label}</strong>
                    <span>{link.note}</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </main>

      <style jsx global>{`
        .pc-check-page {
          min-height: 100vh;
          background:
            linear-gradient(180deg, #f8fafc 0%, #ffffff 42%, #f1f5f9 100%);
          color: #0f172a;
        }

        .pc-check-main {
          width: min(1180px, calc(100% - 32px));
          margin: 0 auto;
          padding: 30px 0 56px;
        }

        .pc-check-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.08fr) minmax(360px, 0.92fr);
          gap: 20px;
          align-items: stretch;
          margin-bottom: 22px;
        }

        .pc-check-hero__copy,
        .pc-check-hero__panel,
        .pc-check-form,
        .pc-check-result {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #ffffff;
          box-shadow: 0 18px 36px rgba(15, 23, 42, 0.07);
        }

        .pc-check-hero__copy {
          padding: 34px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .pc-check-kicker {
          margin: 0 0 10px;
          color: #2563eb;
          font-size: 13px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .pc-check-hero h1 {
          margin: 0;
          max-width: 720px;
          font-size: 36px;
          line-height: 1.22;
          font-weight: 900;
        }

        .pc-check-hero__copy > p {
          max-width: 720px;
          margin: 14px 0 0;
          color: #475569;
          font-size: 15px;
          line-height: 1.8;
        }

        .pc-check-hero__panel {
          padding: 22px;
          display: grid;
          gap: 16px;
          align-content: center;
          border-top: 4px solid #0f766e;
        }

        .pc-check-hero__panel--middle {
          border-top-color: #2563eb;
        }

        .pc-check-hero__panel--risk {
          border-top-color: #b45309;
        }

        .pc-check-panel__eyebrow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          color: #64748b;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .pc-check-panel__eyebrow strong {
          color: #0f172a;
        }

        .pc-check-score-card {
          display: grid;
          grid-template-columns: 112px minmax(0, 1fr);
          gap: 16px;
          align-items: center;
        }

        .pc-check-score-ring {
          width: 112px;
          height: 112px;
          padding: 8px;
          border-radius: 999px;
        }

        .pc-check-score-ring__inner {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2px;
          border-radius: 999px;
          background: #ffffff;
          box-shadow: inset 0 0 0 1px #e2e8f0;
        }

        .pc-check-score-ring__inner span {
          font-size: 34px;
          line-height: 1;
          font-weight: 900;
        }

        .pc-check-score-ring__inner small {
          color: #475569;
          font-size: 12px;
          font-weight: 800;
          transform: translateY(5px);
        }

        .pc-check-hero__panel h2,
        .pc-check-next h2,
        .pc-check-section h2,
        .pc-check-list h2 {
          margin: 0;
          font-size: 17px;
          line-height: 1.4;
          font-weight: 900;
        }

        .pc-check-hero__panel p {
          margin: 8px 0 0;
          color: #475569;
          font-size: 14px;
          line-height: 1.75;
        }

        .pc-check-primary-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          padding: 0 16px;
          border-radius: 8px;
          background: #0f172a;
          color: #ffffff;
          font-size: 14px;
          font-weight: 900;
          text-decoration: none;
          box-shadow: 0 12px 22px rgba(15, 23, 42, 0.18);
        }

        .pc-check-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(340px, 0.95fr);
          gap: 20px;
          align-items: start;
        }

        .pc-check-form,
        .pc-check-result {
          padding: 20px;
        }

        .pc-check-form {
          display: grid;
          gap: 18px;
        }

        .pc-check-form__intro {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 12px;
          padding-bottom: 14px;
          border-bottom: 1px solid #e2e8f0;
        }

        .pc-check-form__intro span {
          color: #64748b;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .pc-check-form__intro strong {
          font-size: 18px;
          font-weight: 900;
        }

        .pc-check-section {
          display: grid;
          gap: 10px;
        }

        .pc-check-section__head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .pc-check-section__head > div {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pc-check-section__step {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 24px;
          border-radius: 8px;
          background: #f1f5f9;
          color: #334155;
          font-size: 11px;
          font-weight: 900;
        }

        .pc-check-section__head > span {
          color: #64748b;
          font-size: 12px;
          font-weight: 800;
        }

        .pc-check-choice-grid,
        .pc-check-feature-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .pc-check-choice,
        .pc-check-feature {
          min-height: 76px;
          padding: 11px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          color: #0f172a;
          text-align: left;
          cursor: pointer;
          display: grid;
          grid-template-columns: 18px minmax(0, 1fr);
          gap: 9px;
          align-items: start;
          transition: border-color 0.16s ease, background-color 0.16s ease, box-shadow 0.16s ease;
        }

        .pc-check-choice__marker {
          width: 14px;
          height: 14px;
          margin-top: 2px;
          border: 2px solid #cbd5e1;
          border-radius: 999px;
          background: #ffffff;
        }

        .pc-check-choice--active .pc-check-choice__marker,
        .pc-check-feature--active .pc-check-choice__marker {
          border-color: #ffffff;
          background: #2563eb;
          box-shadow: 0 0 0 2px #2563eb;
        }

        .pc-check-feature--active .pc-check-choice__marker {
          background: #0f766e;
          box-shadow: 0 0 0 2px #0f766e;
        }

        .pc-check-choice strong,
        .pc-check-feature strong {
          display: block;
          font-size: 14px;
          line-height: 1.35;
          font-weight: 900;
        }

        .pc-check-choice__body > span {
          display: block;
          margin-top: 5px;
          color: #64748b;
          font-size: 12px;
          line-height: 1.45;
          font-weight: 700;
        }

        .pc-check-choice:hover,
        .pc-check-feature:hover {
          border-color: #bfdbfe;
          background: #f8fafc;
        }

        .pc-check-choice--active {
          border-color: #2563eb;
          background: #eff6ff;
          box-shadow: inset 0 0 0 1px #2563eb;
        }

        .pc-check-feature--active {
          border-color: #0f766e;
          background: #f0fdfa;
          box-shadow: inset 0 0 0 1px #0f766e;
        }

        .pc-check-result {
          position: sticky;
          top: 18px;
          display: grid;
          gap: 16px;
          border-top: 4px solid #0f172a;
        }

        .pc-check-result__header {
          display: grid;
          gap: 5px;
          padding-bottom: 14px;
          border-bottom: 1px solid #e2e8f0;
        }

        .pc-check-result__header span {
          color: #64748b;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .pc-check-result__header h2 {
          margin: 0;
          font-size: 20px;
          line-height: 1.35;
          font-weight: 900;
        }

        .pc-check-result__top {
          display: grid;
          gap: 7px;
          padding: 14px 16px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background:
            linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
        }

        .pc-check-result__top span {
          color: #475569;
          font-size: 12px;
          font-weight: 900;
        }

        .pc-check-result__top strong {
          font-size: 15px;
          line-height: 1.55;
        }

        .pc-check-list {
          display: grid;
          gap: 10px;
        }

        .pc-check-list ul {
          margin: 0;
          padding: 0;
          list-style: none;
          display: grid;
          gap: 8px;
        }

        .pc-check-list li {
          display: grid;
          grid-template-columns: 18px minmax(0, 1fr);
          gap: 8px;
          color: #334155;
          font-size: 13px;
          line-height: 1.6;
          font-weight: 700;
        }

        .pc-check-list__dot {
          width: 8px;
          height: 8px;
          margin-top: 7px;
          border-radius: 999px;
        }

        .pc-check-list--good .pc-check-list__dot {
          background: #0f766e;
        }

        .pc-check-list--warn .pc-check-list__dot {
          background: #d97706;
        }

        .pc-check-next {
          display: grid;
          gap: 10px;
        }

        .pc-check-next__list {
          display: grid;
          gap: 8px;
        }

        .pc-check-next__link {
          display: grid;
          gap: 4px;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #ffffff;
          color: #0f172a;
          text-decoration: none;
        }

        .pc-check-next__link:first-child {
          border-color: #bfdbfe;
          background: #eff6ff;
        }

        .pc-check-next__link:hover {
          border-color: #bfdbfe;
          background: #f8fafc;
        }

        .pc-check-next__link strong {
          font-size: 14px;
          font-weight: 900;
        }

        .pc-check-next__link span {
          color: #64748b;
          font-size: 12px;
          line-height: 1.45;
          font-weight: 700;
        }

        @media (max-width: 900px) {
          .pc-check-hero,
          .pc-check-grid {
            grid-template-columns: 1fr;
          }

          .pc-check-result {
            position: static;
          }
        }

        @media (max-width: 640px) {
          .pc-check-main {
            width: min(100% - 24px, 1180px);
            padding-top: 18px;
          }

          .pc-check-hero__copy,
          .pc-check-hero__panel,
          .pc-check-form,
          .pc-check-result {
            padding: 16px;
          }

          .pc-check-hero h1 {
            font-size: 26px;
          }

          .pc-check-score-card {
            grid-template-columns: 92px minmax(0, 1fr);
            gap: 12px;
          }

          .pc-check-score-ring {
            width: 92px;
            height: 92px;
          }

          .pc-check-score-ring__inner span {
            font-size: 28px;
          }

          .pc-check-choice-grid,
          .pc-check-feature-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

function ChoiceGroup<T extends string>({
  step,
  title,
  choices,
  value,
  onChange,
}: {
  step: string
  title: string
  choices: Array<Choice<T>>
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="pc-check-section">
      <div className="pc-check-section__head">
        <div>
          <span className="pc-check-section__step">{step}</span>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="pc-check-choice-grid">
        {choices.map((choice) => (
          <button
            key={choice.value}
            type="button"
            className={`pc-check-choice${choice.value === value ? ' pc-check-choice--active' : ''}`}
            aria-pressed={choice.value === value}
            onClick={() => onChange(choice.value)}
          >
            <span className="pc-check-choice__marker" aria-hidden="true" />
            <span className="pc-check-choice__body">
              <strong>{choice.label}</strong>
              <span>{choice.note}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function ResultList({ title, items, tone }: { title: string; items: string[]; tone: 'good' | 'warn' }) {
  return (
    <div className={`pc-check-list pc-check-list--${tone}`}>
      <h2>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item}>
            <span className="pc-check-list__dot" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
