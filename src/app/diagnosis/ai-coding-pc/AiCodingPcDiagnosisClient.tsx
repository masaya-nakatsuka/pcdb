'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import PcListHeader from '@/app/pc-list/PcListHeader'
import {
  aiCodingPcTheme,
  buildDiagnosisSharePath,
  createInitialDiagnosisState,
  decodeDiagnosisState,
  hasRequiredDiagnosisAnswers,
  isDiagnosisShareSearch,
  resolveDiagnosis,
  type DiagnosisCta,
  type DiagnosisStoredState,
} from '@/lib/diagnosis'
import { trackDiagnosisEvent } from '@/components/analytics/diagnosisTracking'
import styles from './AiCodingPcDiagnosisClient.module.css'

const STORAGE_KEY = 'specsy_ai_coding_pc_diagnosis_v1'

interface AiCodingPcDiagnosisClientProps {
  faqItems: Array<{
    question: string
    answer: string
  }>
}

type Phase = 'intro' | 'question' | 'result'

function isExternalHref(href: string): boolean {
  return /^https?:\/\//.test(href)
}

function countAnswered(state: DiagnosisStoredState): number {
  return aiCodingPcTheme.questions.filter((question) => state.answers[question.id]).length
}

function getQuestionIndex(questionId: string): number {
  return aiCodingPcTheme.questions.findIndex((question) => question.id === questionId)
}

function removeStoredState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore storage failures.
  }
}

function CtaLink({
  cta,
  onClick,
}: {
  cta: DiagnosisCta
  onClick: (cta: DiagnosisCta) => void
}) {
  if (isExternalHref(cta.href)) {
    return (
      <a
        href={cta.href}
        target="_blank"
        rel={cta.isAffiliate ? 'nofollow sponsored noopener noreferrer' : 'noopener noreferrer'}
        className={styles.resultCta}
        onClick={() => onClick(cta)}
      >
        <strong>{cta.label}</strong>
        <span>{cta.note}</span>
      </a>
    )
  }

  return (
    <Link href={cta.href} className={styles.resultCta} onClick={() => onClick(cta)}>
      <strong>{cta.label}</strong>
      <span>{cta.note}</span>
    </Link>
  )
}

export default function AiCodingPcDiagnosisClient({ faqItems }: AiCodingPcDiagnosisClientProps) {
  const [state, setState] = useState<DiagnosisStoredState>(() => createInitialDiagnosisState(aiCodingPcTheme))
  const [phase, setPhase] = useState<Phase>('intro')
  const [restoreMessage, setRestoreMessage] = useState('')
  const [shareMessage, setShareMessage] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const diagnosisRef = useRef<HTMLDivElement | null>(null)
  const resultEventKeyRef = useRef('')

  const currentQuestion = aiCodingPcTheme.questions[state.currentStep]
  const answeredCount = countAnswered(state)
  const isComplete = hasRequiredDiagnosisAnswers(aiCodingPcTheme, state.answers)
  const result = useMemo(() => resolveDiagnosis(aiCodingPcTheme, state.answers), [state.answers])
  const progressPercent = Math.round((answeredCount / aiCodingPcTheme.questions.length) * 100)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const shouldRestoreSharedState = isDiagnosisShareSearch(params)
    const stateFromUrl = shouldRestoreSharedState ? decodeDiagnosisState(aiCodingPcTheme, params.get('state')) : null

    removeStoredState()

    if (shouldRestoreSharedState && stateFromUrl) {
      setState(stateFromUrl)
      setPhase(hasRequiredDiagnosisAnswers(aiCodingPcTheme, stateFromUrl.answers) ? 'result' : 'question')
      setRestoreMessage('共有URLの回答を復元しました。')
    } else if (shouldRestoreSharedState && params.has('state')) {
      setRestoreMessage('共有URLの回答を復元できませんでした。最初から診断できます。')
    } else if (params.has('state') || params.has('shared')) {
      window.history.replaceState(null, '', aiCodingPcTheme.path)
    }

    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted || phase !== 'result' || !isComplete) {
      return
    }

    const resultEventKey = `${result.primaryResultKey}:${result.budgetFit}:${Object.values(state.answers).join('|')}`
    if (resultEventKeyRef.current === resultEventKey) {
      return
    }

    resultEventKeyRef.current = resultEventKey
    trackDiagnosisEvent({
      eventName: 'diagnosis_result',
      theme: aiCodingPcTheme.id,
      themeVersion: aiCodingPcTheme.version,
      resolverVersion: aiCodingPcTheme.resolverVersion,
      resultKey: result.primaryResultKey,
      resultType: result.analyticsLabel,
      budgetFit: result.budgetFit,
      modifierIds: result.modifiers.map((modifier) => modifier.id),
    })
  }, [isComplete, isMounted, phase, result, state.answers])

  const startDiagnosis = () => {
    setState(createInitialDiagnosisState(aiCodingPcTheme))
    setPhase('question')
    setRestoreMessage('')
    setShareMessage('')
    resultEventKeyRef.current = ''
    removeStoredState()
    window.history.replaceState(null, '', aiCodingPcTheme.path)
    trackDiagnosisEvent({
      eventName: 'diagnosis_start',
      theme: aiCodingPcTheme.id,
      themeVersion: aiCodingPcTheme.version,
      resolverVersion: aiCodingPcTheme.resolverVersion,
    })

    window.setTimeout(() => {
      diagnosisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  const updateAnswer = (questionId: string, answerId: string) => {
    const questionIndex = getQuestionIndex(questionId)
    setShareMessage('')
    setState((current) => ({
      ...current,
      currentStep: questionIndex >= 0 ? questionIndex : current.currentStep,
      answers: {
        ...current.answers,
        [questionId]: answerId,
      },
    }))
    trackDiagnosisEvent({
      eventName: 'diagnosis_answer',
      theme: aiCodingPcTheme.id,
      themeVersion: aiCodingPcTheme.version,
      resolverVersion: aiCodingPcTheme.resolverVersion,
      step: questionIndex + 1,
      questionId,
      answerId,
    })
  }

  const goNext = () => {
    if (!currentQuestion || !state.answers[currentQuestion.id]) {
      return
    }

    if (state.currentStep < aiCodingPcTheme.questions.length - 1) {
      setState((current) => ({
        ...current,
        currentStep: current.currentStep + 1,
      }))
      return
    }

    if (isComplete) {
      setState((current) => ({
        ...current,
        completedAt: new Date().toISOString(),
      }))
      setPhase('result')
    }
  }

  const goBack = () => {
    setState((current) => ({
      ...current,
      currentStep: Math.max(0, current.currentStep - 1),
    }))
  }

  const editQuestion = (questionId: string) => {
    const index = getQuestionIndex(questionId)
    if (index < 0) {
      return
    }

    setPhase('question')
    setState((current) => ({
      ...current,
      currentStep: index,
    }))
    window.setTimeout(() => {
      diagnosisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  const resetDiagnosis = () => {
    const nextState = createInitialDiagnosisState(aiCodingPcTheme)
    setState(nextState)
    setPhase('intro')
    setRestoreMessage('')
    setShareMessage('')
    resultEventKeyRef.current = ''
    removeStoredState()
    window.history.replaceState(null, '', aiCodingPcTheme.path)
    trackDiagnosisEvent({
      eventName: 'diagnosis_reset',
      theme: aiCodingPcTheme.id,
      themeVersion: aiCodingPcTheme.version,
      resolverVersion: aiCodingPcTheme.resolverVersion,
    })
  }

  const copyShareUrl = async () => {
    const shareUrl = `${window.location.origin}${buildDiagnosisSharePath(aiCodingPcTheme, state)}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      setShareMessage('結果URLをコピーしました。')
    } catch {
      setShareMessage(shareUrl)
    }

    trackDiagnosisEvent({
      eventName: 'diagnosis_share',
      theme: aiCodingPcTheme.id,
      themeVersion: aiCodingPcTheme.version,
      resolverVersion: aiCodingPcTheme.resolverVersion,
      resultKey: result.primaryResultKey,
      resultType: result.analyticsLabel,
      budgetFit: result.budgetFit,
      modifierIds: result.modifiers.map((modifier) => modifier.id),
    })
  }

  const trackCtaClick = (cta: DiagnosisCta) => {
    trackDiagnosisEvent({
      eventName: 'diagnosis_cta_click',
      theme: aiCodingPcTheme.id,
      themeVersion: aiCodingPcTheme.version,
      resolverVersion: aiCodingPcTheme.resolverVersion,
      resultKey: result.primaryResultKey,
      resultType: result.analyticsLabel,
      budgetFit: result.budgetFit,
      modifierIds: result.modifiers.map((modifier) => modifier.id),
      ctaId: cta.id,
      ctaKind: cta.kind,
      ctaLabel: cta.analyticsLabel,
    })
  }

  return (
    <div className={styles.page}>
      <PcListHeader />
      <main>
        <section className={styles.hero} aria-labelledby="ai-coding-diagnosis-title">
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>AI coding PC diagnosis</p>
            <h1 id="ai-coding-diagnosis-title">AIコーディング用PC診断</h1>
            <p className={styles.heroLead}>7問で必要スペックを出します。</p>
            <p className={styles.adNotice}>広告を含みます。価格・仕様は販売ページで確認してください。</p>
          </div>
          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.deviceFrame}>
              <div className={styles.deviceScreen} />
              <div className={styles.devicePanel}>
                <span>RAM</span>
                <strong>16GBから32GBへ</strong>
              </div>
              <div className={styles.devicePanel}>
                <span>Docker</span>
                <strong>同時起動で判定</strong>
              </div>
              <div className={styles.devicePanel}>
                <span>Local AI</span>
                <strong>GPU/VRAMは別枠</strong>
              </div>
            </div>
          </div>
        </section>

        <section ref={diagnosisRef} className={styles.diagnosisSection} aria-labelledby="diagnosis-heading">
          <div className={styles.diagnosisHeader}>
            <div>
              <p className={styles.kicker}>Diagnosis</p>
              <h2 id="diagnosis-heading">7問診断</h2>
            </div>
            <div className={styles.progressMeta} aria-label={`回答済み ${answeredCount} 問 / ${aiCodingPcTheme.questions.length} 問`}>
              <span>{answeredCount}/{aiCodingPcTheme.questions.length}</span>
              <div className={styles.progressTrack} aria-hidden="true">
                <span style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>

          {restoreMessage && (
            <p className={styles.restoreMessage}>{restoreMessage}</p>
          )}

          {phase === 'question' && (
            <div className={styles.questionCard}>
              <div className={styles.questionTop}>
                <span>Q{state.currentStep + 1}</span>
                <strong>{currentQuestion.title}</strong>
              </div>

              <div className={styles.choiceGrid} role="group" aria-label={currentQuestion.title}>
                {currentQuestion.choices.map((choice) => {
                  const isSelected = state.answers[currentQuestion.id] === choice.id
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      className={`${styles.choiceButton}${isSelected ? ` ${styles.choiceButtonActive}` : ''}`}
                      aria-pressed={isSelected}
                      onClick={() => updateAnswer(currentQuestion.id, choice.id)}
                    >
                      <span className={styles.choiceMarker} aria-hidden="true" />
                      <span>
                        <strong>{choice.label}</strong>
                        <small>{choice.note}</small>
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className={styles.stepControls}>
                <button type="button" className={styles.subtleButton} onClick={goBack} disabled={state.currentStep === 0}>
                  戻る
                </button>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={goNext}
                  disabled={!state.answers[currentQuestion.id]}
                >
                  {state.currentStep === aiCodingPcTheme.questions.length - 1 ? '結果を見る' : '次へ'}
                </button>
              </div>
            </div>
          )}

          {phase === 'intro' && (
            <div className={styles.startPanel}>
              <button type="button" className={styles.primaryButton} onClick={startDiagnosis}>
                診断を始める
              </button>
            </div>
          )}

          {phase === 'result' && isComplete && (
            <section className={styles.resultPanel} aria-live="polite" aria-label="診断結果">
              <div className={styles.resultHead}>
                <div>
                  <p className={styles.kicker}>Result</p>
                  <h2>{result.displayName}</h2>
                </div>
                <div className={`${styles.scoreBadge} ${styles[`scoreBadge_${result.tone}`]}`}>
                  <strong>{result.score}</strong>
                  <span>/100</span>
                </div>
              </div>

              <p className={styles.resultSummary}>{result.summary}</p>

              <div className={`${styles.budgetFit} ${styles[`budgetFit_${result.budgetFit}`]}`}>
                <strong>{result.budgetFitLabel}</strong>
                <span>{result.budgetFitDescription}</span>
              </div>

              {result.modifiers.length > 0 && (
                <div className={styles.modifierGrid} aria-label="補助タグ">
                  {result.modifiers.map((modifier) => (
                    <div key={modifier.id} className={`${styles.modifier} ${styles[`modifier_${modifier.tone}`]}`}>
                      <strong>{modifier.label}</strong>
                      <span>{modifier.description}</span>
                    </div>
                  ))}
                </div>
              )}

              <section className={styles.ctaSection} aria-labelledby="result-cta-heading">
                <div className={styles.sectionTitleRow}>
                  <div>
                    <h3 id="result-cta-heading">次に見る候補</h3>
                    <p>条件に近い一覧へ進みます。</p>
                  </div>
                </div>
                <div className={styles.resultCtaGrid}>
                  {result.ctas.slice(0, 2).map((cta) => (
                    <CtaLink key={cta.id} cta={cta} onClick={trackCtaClick} />
                  ))}
                </div>
              </section>

              <div className={styles.resultActions}>
                <button type="button" className={styles.secondaryButton} onClick={copyShareUrl}>
                  結果URLをコピー
                </button>
                <button type="button" className={styles.subtleButton} onClick={resetDiagnosis}>
                  最初からやり直す
                </button>
              </div>
              {shareMessage && <p className={styles.shareMessage}>{shareMessage}</p>}

              <details className={styles.resultDetailBox}>
                <summary>詳細を見る</summary>

                <section className={styles.answerSummary} aria-labelledby="answer-summary-heading">
                  <div className={styles.sectionTitleRow}>
                    <h3 id="answer-summary-heading">あなたの回答</h3>
                    <button type="button" className={styles.textButton} onClick={() => editQuestion(result.answerSummary[0].questionId)}>
                      修正する
                    </button>
                  </div>
                  <div className={styles.answerGrid}>
                    {result.answerSummary.map((item) => (
                      <button
                        key={item.questionId}
                        type="button"
                        className={styles.answerChip}
                        onClick={() => editQuestion(item.questionId)}
                      >
                        <span>{item.questionTitle}</span>
                        <strong>{item.answerLabel}</strong>
                      </button>
                    ))}
                  </div>
                </section>

                <section className={styles.specSection} aria-labelledby="spec-heading">
                  <h3 id="spec-heading">推奨スペック</h3>
                  <div className={styles.specGrid}>
                    {result.specLines.map((line) => (
                      <article key={line.label} className={styles.specCard}>
                        <span>{line.label}</span>
                        <strong>{line.value}</strong>
                        <p>{line.note}</p>
                      </article>
                    ))}
                  </div>
                </section>

                <div className={styles.resultColumns}>
                  <section className={styles.reasonCard}>
                    <h3>効いた条件</h3>
                    <ul>
                      {result.effectiveConditions.map((condition) => (
                        <li key={condition}>{condition}</li>
                      ))}
                    </ul>
                  </section>
                  <section className={styles.avoidCard}>
                    <h3>避けたい構成</h3>
                    <ul>
                      {result.avoidConditions.map((condition) => (
                        <li key={condition}>{condition}</li>
                      ))}
                    </ul>
                  </section>
                </div>

                <section className={styles.candidateGuide} aria-labelledby="candidate-guide-heading">
                  <h3 id="candidate-guide-heading">候補を見る前の整理</h3>
                  <ul>
                    {result.candidateGuide.map((guide) => (
                      <li key={guide}>{guide}</li>
                    ))}
                  </ul>
                </section>

                <section className={styles.referenceList} aria-labelledby="result-reference-heading">
                  <h3 id="result-reference-heading">根拠</h3>
                  <ul>
                    {result.references.map((reference) => (
                      <li key={reference.id}>
                        <a href={reference.sourceUrl} target="_blank" rel="noopener noreferrer">
                          {reference.label}
                        </a>
                        <span>{reference.summary}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </details>
            </section>
          )}
        </section>

        <details className={styles.infoDetails}>
          <summary>診断の見方</summary>
          <ul>
            <li>AI PC表記より、同時起動するアプリ数で判定します。</li>
            <li>本格ローカルLLMと4K長尺動画は別枠で扱います。</li>
            <li>価格・在庫・仕様は販売ページで確認してください。</li>
          </ul>
        </details>

        <section className={styles.faqSection} aria-label="FAQ">
          <details className={styles.faqShell}>
            <summary>FAQ</summary>
            <div className={styles.faqGrid}>
              {faqItems.map((item) => (
                <details key={item.question} className={styles.faqItem}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </details>
        </section>
      </main>
    </div>
  )
}
