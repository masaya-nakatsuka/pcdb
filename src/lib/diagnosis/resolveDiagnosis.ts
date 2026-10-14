import type { DiagnosisAnswerMap, DiagnosisResult, DiagnosisTheme } from './types'

export function resolveDiagnosis(theme: DiagnosisTheme, answers: DiagnosisAnswerMap): DiagnosisResult {
  return theme.resolve(answers)
}

export function hasRequiredDiagnosisAnswers(theme: DiagnosisTheme, answers: DiagnosisAnswerMap): boolean {
  return theme.questions.every((question) =>
    question.choices.some((choice) => choice.id === answers[question.id])
  )
}

export function getMissingDiagnosisQuestionIds(theme: DiagnosisTheme, answers: DiagnosisAnswerMap): string[] {
  return theme.questions
    .filter((question) => !question.choices.some((choice) => choice.id === answers[question.id]))
    .map((question) => question.id)
}
