export type DiagnosisThemeId = 'ai-coding-pc'

export type BudgetFit = 'fits' | 'tradeoff' | 'insufficient'

export type ResultTone = 'good' | 'review' | 'warn'

export type DiagnosisCtaKind = 'exact_product' | 'search_link' | 'list_filter' | 'official_link'

export type DiagnosisAnswerMap = Record<string, string>

export interface DiagnosisChoice {
  id: string
  label: string
  note: string
  helper?: string
}

export interface DiagnosisQuestion {
  id: string
  title: string
  lead: string
  choices: DiagnosisChoice[]
  unknownHandling?: string
}

export interface DiagnosisModifier {
  id: string
  label: string
  tone: ResultTone
  description: string
  priority: number
}

export interface DiagnosisSpecLine {
  label: string
  value: string
  note: string
}

export interface DiagnosisCta {
  id: string
  kind: DiagnosisCtaKind
  label: string
  href: string
  note: string
  analyticsLabel: string
  isAffiliate?: boolean
  freshness?: 'live_list' | 'search_fallback' | 'official_reference'
  fallbackHref?: string
}

export interface DiagnosisReference {
  id: string
  label: string
  summary: string
  sourceUrl: string
}

export interface DiagnosisResult {
  themeId: DiagnosisThemeId
  themeVersion: string
  resolverVersion: string
  primaryResultKey: string
  displayName: string
  analyticsLabel: string
  tone: ResultTone
  summary: string
  budgetFit: BudgetFit
  budgetFitLabel: string
  budgetFitDescription: string
  modifiers: DiagnosisModifier[]
  score: number
  specLines: DiagnosisSpecLine[]
  minimumLine: string
  recommendedLine: string
  niceToHaveLine: string
  avoidConditions: string[]
  effectiveConditions: string[]
  answerSummary: Array<{
    questionId: string
    questionTitle: string
    answerId: string
    answerLabel: string
  }>
  candidateGuide: string[]
  ctas: DiagnosisCta[]
  references: DiagnosisReference[]
}

export interface DiagnosisTheme {
  id: DiagnosisThemeId
  version: string
  resolverVersion: string
  path: string
  title: string
  shortTitle: string
  description: string
  questions: DiagnosisQuestion[]
  references: DiagnosisReference[]
  resolve: (answers: DiagnosisAnswerMap) => DiagnosisResult
}

export interface DiagnosisStoredState {
  version: 1
  themeId: DiagnosisThemeId
  currentStep: number
  answers: DiagnosisAnswerMap
  completedAt?: string
}
