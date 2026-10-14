import {
  aiCodingPcTheme,
  buildDiagnosisSharePath,
  createInitialDiagnosisState,
  isDiagnosisShareSearch,
  resolveDiagnosis,
  type BudgetFit,
  type DiagnosisAnswerMap,
} from '../src/lib/diagnosis'

interface CaseExpectation {
  name: string
  answers: DiagnosisAnswerMap
  resultKey: string
  budgetFit: BudgetFit
  modifiers?: string[]
}

const baseAnswers: DiagnosisAnswerMap = {
  budget: '100_150k',
  mobility: 'weekly',
  os: 'windows_or_flexible',
  devLoad: 'db_api',
  videoLoad: 'none',
  peripherals: 'none',
  localAi: 'none',
}

const cases: CaseExpectation[] = [
  {
    name: 'standard web api work',
    answers: baseAnswers,
    resultKey: 'ai_coding_standard',
    budgetFit: 'fits',
  },
  {
    name: 'daily light blog work',
    answers: {
      ...baseAnswers,
      budget: 'under_100k',
      mobility: 'daily',
      devLoad: 'text_blog',
    },
    resultKey: 'budget_guard',
    budgetFit: 'fits',
    modifiers: ['daily_carry'],
  },
  {
    name: 'docker heavy needs higher budget',
    answers: {
      ...baseAnswers,
      budget: '100_150k',
      devLoad: 'multi_project_docker',
    },
    resultKey: 'docker_heavy',
    budgetFit: 'tradeoff',
  },
  {
    name: 'docker heavy sufficient budget',
    answers: {
      ...baseAnswers,
      budget: '150_220k',
      devLoad: 'multi_project_docker',
    },
    resultKey: 'docker_heavy',
    budgetFit: 'fits',
  },
  {
    name: 'local llm heavy overrides everything',
    answers: {
      ...baseAnswers,
      budget: '150_220k',
      devLoad: 'multi_project_docker',
      videoLoad: 'regular_youtube',
      localAi: 'local_heavy',
    },
    resultKey: 'local_llm_attention',
    budgetFit: 'tradeoff',
  },
  {
    name: 'local llm heavy low budget insufficient',
    answers: {
      ...baseAnswers,
      budget: 'under_100k',
      localAi: 'local_heavy',
    },
    resultKey: 'local_llm_attention',
    budgetFit: 'insufficient',
    modifiers: ['budget_insufficient'],
  },
  {
    name: '4k video overrides windows flexible',
    answers: {
      ...baseAnswers,
      budget: '150_220k',
      videoLoad: 'four_k_long',
    },
    resultKey: 'video_editing_plus',
    budgetFit: 'tradeoff',
  },
  {
    name: '4k video high budget fits',
    answers: {
      ...baseAnswers,
      budget: 'over_220k',
      videoLoad: 'four_k_long',
    },
    resultKey: 'video_editing_plus',
    budgetFit: 'fits',
  },
  {
    name: 'windows required wins before docker when no video local',
    answers: {
      ...baseAnswers,
      os: 'windows_required',
      devLoad: 'db_api',
    },
    resultKey: 'windows_business',
    budgetFit: 'fits',
    modifiers: ['windows_required'],
  },
  {
    name: 'mac required stays visible as modifier',
    answers: {
      ...baseAnswers,
      os: 'mac_required',
    },
    resultKey: 'ai_coding_standard',
    budgetFit: 'fits',
    modifiers: ['mac_required'],
  },
  {
    name: 'dual monitor drives stationary result',
    answers: {
      ...baseAnswers,
      peripherals: 'dual_monitor_dock',
    },
    resultKey: 'stationary_value',
    budgetFit: 'fits',
    modifiers: ['dual_monitor_dock'],
  },
  {
    name: 'desktop ok drives stationary result',
    answers: {
      ...baseAnswers,
      mobility: 'desktop_ok',
    },
    resultKey: 'stationary_value',
    budgetFit: 'fits',
  },
  {
    name: 'unknown dev load is safe side modifier',
    answers: {
      ...baseAnswers,
      devLoad: 'unknown',
    },
    resultKey: 'ai_coding_standard',
    budgetFit: 'fits',
    modifiers: ['unknown_dev_load'],
  },
  {
    name: 'small local ai remains standard with modifier',
    answers: {
      ...baseAnswers,
      localAi: 'small',
    },
    resultKey: 'ai_coding_standard',
    budgetFit: 'fits',
    modifiers: ['small_local_ai'],
  },
  {
    name: 'regular youtube video uses video result',
    answers: {
      ...baseAnswers,
      budget: '150_220k',
      videoLoad: 'regular_youtube',
    },
    resultKey: 'video_editing_plus',
    budgetFit: 'fits',
  },
  {
    name: 'low budget standard work tradeoff',
    answers: {
      ...baseAnswers,
      budget: 'under_100k',
    },
    resultKey: 'budget_guard',
    budgetFit: 'fits',
  },
  {
    name: 'low budget heavy docker insufficient',
    answers: {
      ...baseAnswers,
      budget: 'under_100k',
      devLoad: 'multi_project_docker',
    },
    resultKey: 'docker_heavy',
    budgetFit: 'insufficient',
  },
  {
    name: 'mac required with 4k video still video first',
    answers: {
      ...baseAnswers,
      budget: 'over_220k',
      os: 'mac_required',
      videoLoad: 'four_k_long',
    },
    resultKey: 'video_editing_plus',
    budgetFit: 'fits',
    modifiers: ['mac_required'],
  },
  {
    name: 'windows required with local heavy still local first',
    answers: {
      ...baseAnswers,
      budget: 'over_220k',
      os: 'windows_required',
      localAi: 'local_heavy',
    },
    resultKey: 'local_llm_attention',
    budgetFit: 'fits',
    modifiers: ['windows_required'],
  },
  {
    name: 'light blog without low budget gets light result',
    answers: {
      ...baseAnswers,
      devLoad: 'text_blog',
      videoLoad: 'none',
      localAi: 'none',
    },
    resultKey: 'light_blog',
    budgetFit: 'fits',
  },
]

const errors: string[] = []

for (const testCase of cases) {
  const result = resolveDiagnosis(aiCodingPcTheme, testCase.answers)

  if (result.primaryResultKey !== testCase.resultKey) {
    errors.push(`${testCase.name}: expected result ${testCase.resultKey}, got ${result.primaryResultKey}`)
  }

  if (result.budgetFit !== testCase.budgetFit) {
    errors.push(`${testCase.name}: expected budgetFit ${testCase.budgetFit}, got ${result.budgetFit}`)
  }

  for (const modifier of testCase.modifiers ?? []) {
    if (!result.modifiers.some((item) => item.id === modifier)) {
      errors.push(`${testCase.name}: expected modifier ${modifier}`)
    }
  }

  if (result.ctas.length === 0) {
    errors.push(`${testCase.name}: expected at least one CTA`)
  }

  if (result.references.length === 0) {
    errors.push(`${testCase.name}: expected references`)
  }
}

const sharePath = buildDiagnosisSharePath(aiCodingPcTheme, {
  ...createInitialDiagnosisState(aiCodingPcTheme),
  answers: baseAnswers,
})
const shareSearch = sharePath.split('?')[1] ?? ''

if (!sharePath.startsWith(`${aiCodingPcTheme.path}?shared=1&state=`)) {
  errors.push(`share path should require shared=1 flag, got ${sharePath}`)
}

if (!isDiagnosisShareSearch(shareSearch)) {
  errors.push('shared URL search should be restorable')
}

if (isDiagnosisShareSearch(shareSearch.replace('shared=1&', ''))) {
  errors.push('plain state URL should not be treated as a shared restore URL')
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(error)
  }
  process.exit(1)
}

console.log(`AI coding diagnosis tests passed: ${cases.length} cases`)
