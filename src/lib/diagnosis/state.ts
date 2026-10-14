import type { DiagnosisAnswerMap, DiagnosisStoredState, DiagnosisTheme } from './types'

const STATE_VERSION = 1
const SHARE_FLAG_PARAM = 'shared'
const STATE_PARAM = 'state'

export function createInitialDiagnosisState(theme: DiagnosisTheme): DiagnosisStoredState {
  return {
    version: STATE_VERSION,
    themeId: theme.id,
    currentStep: 0,
    answers: {},
  }
}

export function sanitizeDiagnosisState(theme: DiagnosisTheme, input: Partial<DiagnosisStoredState> | null | undefined): DiagnosisStoredState {
  const initial = createInitialDiagnosisState(theme)
  if (!input || input.version !== STATE_VERSION || input.themeId !== theme.id) {
    return initial
  }

  const answers: DiagnosisAnswerMap = {}
  for (const question of theme.questions) {
    const rawAnswer = input.answers?.[question.id]
    if (typeof rawAnswer === 'string' && question.choices.some((choice) => choice.id === rawAnswer)) {
      answers[question.id] = rawAnswer
    }
  }

  const maxStep = Math.max(0, theme.questions.length - 1)
  const currentStep = Number.isInteger(input.currentStep)
    ? Math.max(0, Math.min(maxStep, Number(input.currentStep)))
    : 0

  return {
    version: STATE_VERSION,
    themeId: theme.id,
    currentStep,
    answers,
    completedAt: typeof input.completedAt === 'string' ? input.completedAt : undefined,
  }
}

export function encodeDiagnosisState(state: DiagnosisStoredState): string {
  return encodeURIComponent(JSON.stringify(state))
}

export function decodeDiagnosisState(theme: DiagnosisTheme, value: string | null): DiagnosisStoredState | null {
  if (!value) {
    return null
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as Partial<DiagnosisStoredState>
    return sanitizeDiagnosisState(theme, parsed)
  } catch {
    return null
  }
}

export function isDiagnosisShareSearch(search: string | URLSearchParams): boolean {
  const params = typeof search === 'string' ? new URLSearchParams(search) : search
  return params.get(SHARE_FLAG_PARAM) === '1' && params.has(STATE_PARAM)
}

export function buildDiagnosisSharePath(theme: DiagnosisTheme, state: DiagnosisStoredState): string {
  const sanitized = sanitizeDiagnosisState(theme, state)
  return `${theme.path}?${SHARE_FLAG_PARAM}=1&${STATE_PARAM}=${encodeDiagnosisState(sanitized)}`
}
