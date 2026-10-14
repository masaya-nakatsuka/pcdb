import type {
  BudgetFit,
  DiagnosisAnswerMap,
  DiagnosisCta,
  DiagnosisModifier,
  DiagnosisQuestion,
  DiagnosisReference,
  DiagnosisResult,
  DiagnosisSpecLine,
  DiagnosisTheme,
  ResultTone,
} from '../types'

export const AI_CODING_PC_THEME_VERSION = '2026-07-08.1'
export const AI_CODING_PC_RESOLVER_VERSION = 'ai-coding-pc-resolver-1'

const questionDefinitions = [
  {
    id: 'budget',
    title: '予算はどのあたりですか？',
    lead: '本体だけで見た目安です。モニターやドックは別に考えます。',
    choices: [
      { id: 'under_100k', label: '10万円未満', note: '軽い開発なら候補あり', helper: '中古や据え置きも視野に入ります。' },
      { id: '100_150k', label: '10〜15万円', note: 'AIコーディングの入口', helper: '16GB/512GBを狙いやすい帯です。' },
      { id: '150_220k', label: '15〜22万円', note: 'Dockerや長めの利用も視野', helper: '32GB/1TBを現実的に見られます。' },
      { id: 'over_220k', label: '22万円以上', note: '重い用途もまとめたい', helper: '動画やローカルAIの余地が出ます。' },
    ],
  },
  {
    id: 'mobility',
    title: 'PCはどのくらい持ち運びますか？',
    lead: '軽さを優先するほど、同じ予算で取れる性能は下がります。',
    choices: [
      { id: 'daily', label: '毎日持ち運ぶ', note: '軽さと電池を重視' },
      { id: 'weekly', label: '週に数回', note: '14インチ前後を中心に見る' },
      { id: 'desk', label: 'ほぼ机で使う', note: '画面と性能を取りやすい' },
      { id: 'desktop_ok', label: '据え置きでもよい', note: 'Mini PC/デスクトップも候補' },
    ],
  },
  {
    id: 'os',
    title: 'OSに必須条件はありますか？',
    lead: '好みではなく、仕事・学校・開発対象で縛りがあるかを見ます。',
    choices: [
      { id: 'mac_required', label: 'Mac必須', note: 'iOS開発やApple環境が必要' },
      { id: 'windows_required', label: 'Windows必須', note: '業務ソフト/CUDA/ゲームなど' },
      { id: 'mac_prefer', label: 'Mac希望', note: '必須ではないがMac寄り' },
      { id: 'windows_or_flexible', label: 'Windows希望・どちらでも', note: '条件に合う方で見る' },
    ],
  },
  {
    id: 'devLoad',
    title: '開発作業はどのくらい重いですか？',
    lead: 'Dockerだけでなく、ブラウザ、エディタ、AI補助ツール、DB/APIの同時起動を含めます。',
    choices: [
      { id: 'text_blog', label: '記事・軽いコード中心', note: 'Markdown、静的サイト、軽い修正' },
      { id: 'db_api', label: 'Webアプリ+DB/API', note: 'Next.js、DB、APIを動かす' },
      { id: 'multi_project_docker', label: 'Docker/複数リポジトリ', note: '複数サービスを同時に動かす' },
      { id: 'unknown', label: 'まだ分からない', note: '安全側に少し寄せて判定' },
    ],
    unknownHandling: '不明は軽量扱いにせず、16GBより上を見やすいように補正します。',
  },
  {
    id: 'videoLoad',
    title: '動画編集も同じPCでしますか？',
    lead: '軽いショート動画と4K長尺では、必要なメモリ・SSD・GPUが変わります。',
    choices: [
      { id: 'none', label: 'しない', note: '開発用途を中心に見る' },
      { id: 'light_short', label: '短い動画をたまに', note: 'SNS/画面録画の編集程度' },
      { id: 'regular_youtube', label: 'YouTubeを定期的に', note: '編集時間も重視する' },
      { id: 'four_k_long', label: '4K/長尺も扱う', note: '別枠で性能を見た方がよい' },
    ],
  },
  {
    id: 'peripherals',
    title: '外部モニターや周辺機器は使いますか？',
    lead: '据え置き運用なら、PC本体の軽さより端子・ドック・電源まわりが効きます。',
    choices: [
      { id: 'none', label: 'ほぼ使わない', note: '本体だけで完結' },
      { id: 'one_monitor', label: 'モニター1枚', note: 'USB-C出力やHDMIを見る' },
      { id: 'dual_monitor_dock', label: '2枚以上/ドックあり', note: 'Thunderboltや電源も確認' },
      { id: 'stationary_powered', label: '据え置き電源前提', note: 'Mini PC/デスクトップも自然' },
    ],
  },
  {
    id: 'localAi',
    title: 'ローカルLLMや画像生成はどのくらい使いますか？',
    lead: 'API利用やAIエディタ補助と、ローカルでモデルを回すPCは別物です。',
    choices: [
      { id: 'none', label: '使わない', note: 'クラウドAIやAPI中心' },
      { id: 'curious', label: '少し興味あり', note: '小さく試す程度' },
      { id: 'small', label: '小型モデルを試したい', note: '7B〜13B級を想定' },
      { id: 'local_heavy', label: '本格的に動かしたい', note: 'VRAM/GPU前提で別枠' },
    ],
  },
] satisfies DiagnosisQuestion[]

export const aiCodingPcReferences: DiagnosisReference[] = [
  {
    id: 'docker-windows',
    label: 'Docker Desktop Windows 要件',
    summary: 'Windows/WSL2でのDocker利用は、仮想化と8GB RAM以上を前提に見る。',
    sourceUrl: 'https://docs.docker.com/desktop/setup/install/windows-install/',
  },
  {
    id: 'ollama-model-memory',
    label: 'Ollama モデル別RAM目安',
    summary: '7B/13B/70Bで必要メモリが段階的に上がるため、本格ローカルLLMは通常開発PCと分ける。',
    sourceUrl: 'https://ollama.com/library/llama2',
  },
  {
    id: 'adobe-video-requirements',
    label: 'Adobe Premiere Pro 推奨要件',
    summary: 'HDと4KでRAM/GPU/SSDの見方が変わるため、動画編集兼用は別の重みで判定する。',
    sourceUrl: 'https://helpx.adobe.com/premiere/desktop/get-started/technical-requirements/adobe-premiere-pro-technical-requirements.html',
  },
]

type BudgetAnswer = 'under_100k' | '100_150k' | '150_220k' | 'over_220k'
type MobilityAnswer = 'daily' | 'weekly' | 'desk' | 'desktop_ok'
type OsAnswer = 'mac_required' | 'windows_required' | 'mac_prefer' | 'windows_or_flexible'
type DevLoadAnswer = 'text_blog' | 'db_api' | 'multi_project_docker' | 'unknown'
type VideoLoadAnswer = 'none' | 'light_short' | 'regular_youtube' | 'four_k_long'
type PeripheralAnswer = 'none' | 'one_monitor' | 'dual_monitor_dock' | 'stationary_powered'
type LocalAiAnswer = 'none' | 'curious' | 'small' | 'local_heavy'

interface NormalizedAiCodingAnswers {
  budget: BudgetAnswer
  mobility: MobilityAnswer
  os: OsAnswer
  devLoad: DevLoadAnswer
  videoLoad: VideoLoadAnswer
  peripherals: PeripheralAnswer
  localAi: LocalAiAnswer
}

interface ResultProfile {
  key: string
  displayName: string
  analyticsLabel: string
  tone: ResultTone
  minBudgetRank: number
  summary: string
  minimumLine: string
  recommendedLine: string
  niceToHaveLine: string
  avoidConditions: string[]
  candidateGuide: string[]
  baseCtas: DiagnosisCta[]
}

const resultProfiles: Record<string, ResultProfile> = {
  light_blog: {
    key: 'light_blog',
    displayName: 'ブログ・軽い開発中心型',
    analyticsLabel: 'light_blog',
    tone: 'good',
    minBudgetRank: 0,
    summary: '文章作成、軽いWeb修正、AIエディタ補助が中心なら、軽さと16GB/512GBを優先して見る構成です。',
    minimumLine: '16GBメモリ / SSD 512GB / 13〜14インチ前後',
    recommendedLine: '16GB以上 / SSD 512GB以上 / 軽量ノート',
    niceToHaveLine: '長く使うなら24GB以上、またはSSD 1TBも検討',
    avoidConditions: ['8GBメモリ固定のモデル', 'SSD 256GBだけのモデル', '軽さだけでCPU世代が古いモデル'],
    candidateGuide: ['毎日持つなら1.3kg前後を目安にする', 'AIエディタを常時使うなら16GBを下限にする', '予算を抑える場合もSSD容量は削りすぎない'],
    baseCtas: [
      createCta('mobile-16gb', 'list_filter', '軽量ノートPCを見る', '/pc-list/mobile?q=16GB%20512GB', '16GB/512GBの軽量候補へ', 'mobile_16gb_512gb'),
      createCta('used-16gb', 'list_filter', '中古も含めて見る', '/pc-list/used?q=16GB%20512GB', '予算を抑える場合の逃げ道', 'used_16gb_512gb'),
    ],
  },
  ai_coding_standard: {
    key: 'ai_coding_standard',
    displayName: 'AIコーディング標準型',
    analyticsLabel: 'ai_coding_standard',
    tone: 'good',
    minBudgetRank: 1,
    summary: 'AI補助ツール、ブラウザ、エディタ、軽いDB/APIを同時に使う前提で、メモリとSSDに余裕を持たせる構成です。',
    minimumLine: '16GBメモリ / SSD 512GB / Core Ultra・Ryzen 5・Apple M系クラス',
    recommendedLine: '24〜32GBメモリ / SSD 1TB / 14〜15インチ前後',
    niceToHaveLine: 'Dockerや長期利用も見るなら32GB/1TBへ上げる',
    avoidConditions: ['8GBメモリのままAI補助ツールを常用する', 'SSD 256GBで開発環境と素材をまとめる', '安さだけでCPU型番が読めない商品を選ぶ'],
    candidateGuide: ['迷う場合は16GBを最低ラインにする', 'DockerやDBも使うなら32GBを優先する', 'Mac希望でも容量違いのASIN直リンクは無理に使わない'],
    baseCtas: [
      createCta('standard-cafe', 'list_filter', '標準候補を見る', '/pc-list/cafe?q=16GB%20512GB', '開発しやすい実用帯を確認', 'standard_cafe_16gb'),
      createCta('standard-32gb', 'search_link', '32GB候補を探す', '/pc-list?q=32GB%201TB', 'Dockerまで見る場合の候補', 'standard_32gb_search'),
    ],
  },
  docker_heavy: {
    key: 'docker_heavy',
    displayName: 'Docker・複数プロジェクト型',
    analyticsLabel: 'docker_heavy',
    tone: 'review',
    minBudgetRank: 2,
    summary: 'Docker、DB/API、複数リポジトリ、AI補助ツールを同時に使うため、32GB/1TBを現実ラインに置く構成です。',
    minimumLine: '32GBメモリ / SSD 1TB / 冷却に余裕のある筐体',
    recommendedLine: '32GB以上 / SSD 1TB以上 / 14〜16インチまたは据え置き',
    niceToHaveLine: '外部モニターやドック前提ならMini PC/デスクトップも検討',
    avoidConditions: ['16GBでDocker複数サービスを常時動かす', '薄型軽量だけで冷却に余裕がないモデル', 'SSD 512GBで開発環境を詰め込む'],
    candidateGuide: ['メモリ32GBを先に固定する', '外部モニターを使うなら端子と給電も見る', '低予算なら軽量ノート1台化より据え置き代替を考える'],
    baseCtas: [
      createCta('docker-32gb', 'search_link', '32GB/1TB候補を見る', '/pc-list?q=32GB%201TB', 'Docker多めの下限候補', 'docker_32gb_1tb'),
      createCta('docker-desktop', 'list_filter', '据え置きPCも見る', '/pc-list/desktop?q=32GB%201TB', '性能を取りやすい代替', 'docker_desktop'),
    ],
  },
  video_editing_plus: {
    key: 'video_editing_plus',
    displayName: '動画編集兼用型',
    analyticsLabel: 'video_editing_plus',
    tone: 'review',
    minBudgetRank: 2,
    summary: 'AIコーディングに加えて動画編集も見るため、メモリ、SSD、GPU/メディアエンジンをまとめて確認する構成です。',
    minimumLine: '32GBメモリ / SSD 1TB / GPUまたは動画処理に強いSoC',
    recommendedLine: '32GB以上 / SSD 1TB以上 / dGPUまたはApple Pro系',
    niceToHaveLine: '4K長尺なら外付けSSDと据え置き候補も分けて見る',
    avoidConditions: ['16GB/512GBで4K長尺編集までまとめる', 'GPUや動画処理性能を見ずに価格だけで決める', '素材保存用ストレージを考えない'],
    candidateGuide: ['動画頻度が高いなら開発PCより動画編集側を優先する', '4Kはノート1台で無理に安くまとめない', '外部SSDやモニターも総額に入れる'],
    baseCtas: [
      createCta('video-list', 'list_filter', '動画編集向け候補を見る', '/pc-list/video-editing?q=32GB%201TB', '動画兼用の候補へ', 'video_32gb_1tb'),
      createCta('video-desktop', 'list_filter', 'デスクトップも見る', '/pc-list/desktop?q=GPU%2032GB', '4K編集や長時間作業の代替', 'video_desktop'),
    ],
  },
  stationary_value: {
    key: 'stationary_value',
    displayName: '据え置きコスパ型',
    analyticsLabel: 'stationary_value',
    tone: 'good',
    minBudgetRank: 1,
    summary: '外部モニターや電源接続が前提なら、軽さよりメモリ、SSD、端子、価格を優先する構成です。',
    minimumLine: '16〜32GBメモリ / SSD 512GB〜1TB / HDMIまたはUSB-C出力',
    recommendedLine: '32GBメモリ / SSD 1TB / Mini PCまたはデスクトップ',
    niceToHaveLine: 'モニター2枚ならUSB-C/Thunderbolt/HDMIの構成を確認',
    avoidConditions: ['持ち運ばないのに軽量ノートへ予算を寄せる', 'ドックや給電を見ずに本体だけで決める', '外部モニター2枚をあとから無理に足す'],
    candidateGuide: ['机で使うならMini PCも候補に入れる', 'モニターとドックを総額で見る', 'ノートを選ぶ場合も端子と給電を確認する'],
    baseCtas: [
      createCta('mini-32gb', 'list_filter', 'Mini PCを見る', '/pc-list/mini-pc?q=32GB%201TB', '据え置きで性能を取りやすい候補', 'mini_32gb_1tb'),
      createCta('desktop-list', 'list_filter', 'デスクトップを見る', '/pc-list/desktop?q=32GB%201TB', '拡張性を取りたい場合', 'desktop_32gb_1tb'),
    ],
  },
  windows_business: {
    key: 'windows_business',
    displayName: 'Windows実務・開発型',
    analyticsLabel: 'windows_business',
    tone: 'good',
    minBudgetRank: 1,
    summary: 'Windows専用ソフト、CUDA、会社/学校指定を優先し、その範囲でメモリとSSDを確保する構成です。',
    minimumLine: 'Windows 11 / 16GBメモリ / SSD 512GB',
    recommendedLine: 'Windows 11 / 32GBメモリ / SSD 1TB',
    niceToHaveLine: 'CUDAやローカルAIを使うならNVIDIA GPU搭載機を別枠で確認',
    avoidConditions: ['Windows必須なのにMac前提で候補を固定する', '業務ソフトの対応OSを見ない', 'CUDAが必要なのに内蔵GPUだけで考える'],
    candidateGuide: ['必須ソフトの対応OSを先に確認する', 'AI開発はNPUよりGPU/VRAMが必要な場面を分ける', '会社/学校指定がある場合は保証条件も見る'],
    baseCtas: [
      createCta('windows-standard', 'list_filter', 'Windows候補を見る', '/pc-list?q=Windows%2016GB%20512GB', '標準的なWindows候補へ', 'windows_standard'),
      createCta('windows-gpu', 'search_link', 'GPU搭載機を探す', '/pc-list/gaming?q=RTX%2032GB', 'CUDAやローカルAI寄りの確認', 'windows_gpu'),
    ],
  },
  budget_guard: {
    key: 'budget_guard',
    displayName: '予算重視の軽開発型',
    analyticsLabel: 'budget_guard',
    tone: 'warn',
    minBudgetRank: 0,
    summary: '予算を抑える場合は、重い用途を分け、16GB/512GBを最低ラインに近い目安として見る構成です。',
    minimumLine: '16GBメモリ / SSD 512GB / 軽い開発中心',
    recommendedLine: '中古・整備済みも含めて16GB/512GB以上',
    niceToHaveLine: 'Dockerや動画編集は予算を上げるか据え置きに分ける',
    avoidConditions: ['4GB/8GBメモリでAI補助ツールを常用する', 'eMMCやSSD 128〜256GBだけのモデル', '重い開発と動画編集を低予算1台にまとめる'],
    candidateGuide: ['まず16GB/512GBを探す', '新品で厳しければ中古や据え置きに分ける', 'ローカルAIや動画編集は別予算で考える'],
    baseCtas: [
      createCta('budget-cost', 'list_filter', 'コスパ候補を見る', '/pc-list/cost-performance?q=16GB%20512GB', '予算重視の候補へ', 'budget_cost'),
      createCta('budget-used', 'list_filter', '中古候補を見る', '/pc-list/used?q=16GB%20512GB', '新品で厳しい場合の逃げ道', 'budget_used'),
    ],
  },
  local_llm_attention: {
    key: 'local_llm_attention',
    displayName: 'ローカルLLM注意型',
    analyticsLabel: 'local_llm_attention',
    tone: 'warn',
    minBudgetRank: 3,
    summary: 'ローカルLLMや画像生成を本格的に動かすなら、通常のAIコーディングPCとは別にGPU/VRAMを見ます。',
    minimumLine: '32GBメモリ / GPU VRAM 8GB以上を別枠で確認',
    recommendedLine: '64GBメモリまたはVRAM 12〜16GB以上のGPU機を検討',
    niceToHaveLine: '70B級や画像生成/学習はデスクトップやクラウドGPUも候補',
    avoidConditions: ['NPU搭載だけでローカルLLM本格運用を期待する', '内蔵GPUだけで大きいモデルを常用する', '軽量ノート1台に本格ローカルAIまで詰める'],
    candidateGuide: ['API利用とローカル実行を分ける', '7B〜13Bの小型モデルと本格運用を分ける', '本格派はローカルLLM用PC診断へ分岐する'],
    baseCtas: [
      createCta('local-gpu', 'search_link', 'GPU搭載PCを確認する', '/pc-list/gaming?q=RTX%2032GB', 'VRAMが必要な用途の候補', 'local_gpu'),
      createCta('local-desktop', 'list_filter', 'デスクトップ候補を見る', '/pc-list/desktop?q=RTX%2032GB', '据え置きでGPUを取りやすい候補', 'local_desktop'),
    ],
  },
}

const answerLabels = new Map(
  questionDefinitions.flatMap((question) =>
    question.choices.map((choice) => [`${question.id}:${choice.id}`, choice.label] as const)
  )
)

function createCta(
  id: string,
  kind: DiagnosisCta['kind'],
  label: string,
  href: string,
  note: string,
  analyticsLabel: string
): DiagnosisCta {
  return {
    id,
    kind,
    label,
    href,
    note,
    analyticsLabel,
    freshness: kind === 'list_filter' ? 'live_list' : 'search_fallback',
  }
}

function normalizeAnswers(answers: DiagnosisAnswerMap): NormalizedAiCodingAnswers {
  return {
    budget: normalizeChoice<BudgetAnswer>(answers.budget, ['under_100k', '100_150k', '150_220k', 'over_220k'], '100_150k'),
    mobility: normalizeChoice<MobilityAnswer>(answers.mobility, ['daily', 'weekly', 'desk', 'desktop_ok'], 'weekly'),
    os: normalizeChoice<OsAnswer>(answers.os, ['mac_required', 'windows_required', 'mac_prefer', 'windows_or_flexible'], 'windows_or_flexible'),
    devLoad: normalizeChoice<DevLoadAnswer>(answers.devLoad, ['text_blog', 'db_api', 'multi_project_docker', 'unknown'], 'unknown'),
    videoLoad: normalizeChoice<VideoLoadAnswer>(answers.videoLoad, ['none', 'light_short', 'regular_youtube', 'four_k_long'], 'none'),
    peripherals: normalizeChoice<PeripheralAnswer>(answers.peripherals, ['none', 'one_monitor', 'dual_monitor_dock', 'stationary_powered'], 'none'),
    localAi: normalizeChoice<LocalAiAnswer>(answers.localAi, ['none', 'curious', 'small', 'local_heavy'], 'none'),
  }
}

function normalizeChoice<T extends string>(value: string | undefined, choices: readonly T[], fallback: T): T {
  return choices.includes(value as T) ? (value as T) : fallback
}

function budgetRank(value: BudgetAnswer): number {
  if (value === 'under_100k') return 0
  if (value === '100_150k') return 1
  if (value === '150_220k') return 2
  return 3
}

function resolvePrimaryResult(answers: NormalizedAiCodingAnswers): string {
  if (answers.localAi === 'local_heavy') return 'local_llm_attention'
  if (answers.videoLoad === 'four_k_long' || answers.videoLoad === 'regular_youtube') return 'video_editing_plus'
  if (answers.os === 'windows_required') return 'windows_business'
  if (answers.devLoad === 'multi_project_docker') return 'docker_heavy'
  if (answers.mobility === 'desktop_ok' || answers.peripherals === 'stationary_powered' || answers.peripherals === 'dual_monitor_dock') {
    return 'stationary_value'
  }
  if (answers.budget === 'under_100k') return 'budget_guard'
  if (answers.devLoad === 'text_blog' && answers.videoLoad === 'none' && answers.localAi === 'none') return 'light_blog'
  return 'ai_coding_standard'
}

function resolveBudgetFit(rank: number, profile: ResultProfile, answers: NormalizedAiCodingAnswers): BudgetFit {
  const effectiveMinBudgetRank = answers.videoLoad === 'four_k_long' || answers.localAi === 'local_heavy'
    ? Math.max(profile.minBudgetRank, 3)
    : profile.minBudgetRank

  if (rank >= effectiveMinBudgetRank) return 'fits'
  if (rank + 1 >= effectiveMinBudgetRank) return 'tradeoff'
  return 'insufficient'
}

function budgetFitCopy(fit: BudgetFit): { label: string; description: string } {
  if (fit === 'fits') {
    return {
      label: '予算内で成立',
      description: 'この条件なら、候補を比較しながら現実的に探せます。',
    }
  }
  if (fit === 'tradeoff') {
    return {
      label: '妥協が必要',
      description: 'メモリ、SSD、軽さ、動画編集のどれかを調整すると探しやすくなります。',
    }
  }
  return {
    label: '予算不足',
    description: 'この用途を1台にまとめるには予算が足りません。用途分離や据え置き代替を先に見ます。',
  }
}

function buildModifiers(answers: NormalizedAiCodingAnswers, fit: BudgetFit): DiagnosisModifier[] {
  const modifiers: DiagnosisModifier[] = []

  if (answers.os === 'mac_required') {
    modifiers.push({
      id: 'mac_required',
      label: 'Mac必須',
      tone: 'review',
      description: 'iOS開発やApple環境が前提なら、Windows候補よりMacのメモリ/SSD構成を優先します。',
      priority: 10,
    })
  }

  if (answers.os === 'windows_required') {
    modifiers.push({
      id: 'windows_required',
      label: 'Windows必須',
      tone: 'review',
      description: '業務ソフト、CUDA、ゲームなどの制約を優先します。',
      priority: 9,
    })
  }

  if (answers.devLoad === 'unknown') {
    modifiers.push({
      id: 'unknown_dev_load',
      label: '開発負荷は安全側',
      tone: 'review',
      description: '作業内容が未確定なので、軽すぎる構成には寄せません。',
      priority: 7,
    })
  }

  if (answers.mobility === 'daily') {
    modifiers.push({
      id: 'daily_carry',
      label: '毎日持ち運び',
      tone: 'review',
      description: '軽さと電池を優先するため、重い用途との両立は予算が上がります。',
      priority: 6,
    })
  }

  if (answers.peripherals === 'dual_monitor_dock') {
    modifiers.push({
      id: 'dual_monitor_dock',
      label: '2画面/ドック前提',
      tone: 'good',
      description: 'USB-C、Thunderbolt、HDMI、給電まわりも候補条件に入れます。',
      priority: 5,
    })
  }

  if (answers.localAi === 'small') {
    modifiers.push({
      id: 'small_local_ai',
      label: '小型ローカルAI',
      tone: 'review',
      description: '7B〜13B級を試す程度なら、通常開発PCよりメモリ多めで見ます。',
      priority: 4,
    })
  }

  if (fit === 'insufficient') {
    modifiers.push({
      id: 'budget_insufficient',
      label: '予算不足',
      tone: 'warn',
      description: '商品候補より先に、用途分離や据え置き代替を見ます。',
      priority: 20,
    })
  }

  return modifiers.sort((a, b) => b.priority - a.priority).slice(0, 3)
}

function buildSpecLines(profile: ResultProfile, answers: NormalizedAiCodingAnswers, fit: BudgetFit): DiagnosisSpecLine[] {
  const lines: DiagnosisSpecLine[] = [
    {
      label: '最低ライン',
      value: profile.minimumLine,
      note: 'ここを下回ると、AI補助ツールや開発環境の同時起動で詰まりやすくなります。',
    },
    {
      label: 'おすすめ構成',
      value: profile.recommendedLine,
      note: '今回の回答から見た中心ラインです。',
    },
    {
      label: 'できれば欲しい',
      value: profile.niceToHaveLine,
      note: '長めに使う、素材が増える、同時起動が多い場合の余裕です。',
    },
  ]

  if (answers.os === 'mac_required' || answers.os === 'mac_prefer') {
    lines.push({
      label: 'Macで見るなら',
      value: answers.devLoad === 'multi_project_docker' || answers.localAi !== 'none' ? '24〜32GBメモリ / SSD 1TB寄り' : '16〜24GBメモリ / SSD 512GB以上',
      note: '容量違いの直リンク誤爆を避け、構成を販売ページで確認します。',
    })
  }

  if (answers.os === 'windows_required' || answers.os === 'windows_or_flexible') {
    lines.push({
      label: 'Windowsで見るなら',
      value: answers.localAi === 'local_heavy' ? 'NVIDIA RTX / VRAM 8GB以上を別枠で確認' : '16〜32GBメモリ / SSD 512GB〜1TB',
      note: 'CUDAや業務ソフトの有無で候補が変わります。',
    })
  }

  if (fit !== 'fits') {
    lines.push({
      label: '予算を抑えるなら',
      value: answers.mobility === 'daily' ? '中古軽量ノートか、重い作業を据え置きPCへ分ける' : '中古・Mini PC・デスクトップも含める',
      note: '低予算で重い用途を1台にまとめないための逃げ道です。',
    })
  }

  return lines
}

function buildEffectiveConditions(profile: ResultProfile, answers: NormalizedAiCodingAnswers, fit: BudgetFit): string[] {
  const conditions = [
    `主結果: ${profile.displayName}`,
    `予算判定: ${budgetFitCopy(fit).label}`,
  ]

  if (answers.devLoad === 'multi_project_docker') {
    conditions.push('Docker/複数リポジトリを重めに評価')
  } else if (answers.devLoad === 'db_api') {
    conditions.push('DB/APIとAI補助ツールの同時起動を評価')
  } else if (answers.devLoad === 'unknown') {
    conditions.push('開発負荷不明のため安全側に補正')
  }

  if (answers.videoLoad !== 'none') {
    conditions.push(answers.videoLoad === 'four_k_long' ? '4K/長尺動画を別枠で評価' : '動画編集兼用を補助条件に追加')
  }

  if (answers.localAi !== 'none') {
    conditions.push(answers.localAi === 'local_heavy' ? '本格ローカルAIを通常候補から分離' : '小型ローカルAIの余裕を補助条件に追加')
  }

  if (answers.peripherals !== 'none') {
    conditions.push('外部モニター/ドックの運用を候補条件に追加')
  }

  return conditions
}

function buildAnswerSummary(answers: NormalizedAiCodingAnswers) {
  return questionDefinitions.map((question) => {
    const answerId = answers[question.id as keyof NormalizedAiCodingAnswers]
    return {
      questionId: question.id,
      questionTitle: question.title,
      answerId,
      answerLabel: answerLabels.get(`${question.id}:${answerId}`) ?? answerId,
    }
  })
}

function adjustScore(profile: ResultProfile, answers: NormalizedAiCodingAnswers, fit: BudgetFit): number {
  let score = 82
  if (profile.tone === 'review') score -= 6
  if (profile.tone === 'warn') score -= 12
  if (fit === 'tradeoff') score -= 12
  if (fit === 'insufficient') score -= 28
  if (answers.mobility === 'daily' && (answers.devLoad === 'multi_project_docker' || answers.videoLoad !== 'none')) score -= 6
  if (answers.os === 'mac_required' || answers.os === 'windows_required') score -= 2
  if (answers.localAi === 'small') score -= 4
  return Math.max(32, Math.min(96, score))
}

function resolveAiCodingPcDiagnosis(answers: DiagnosisAnswerMap): DiagnosisResult {
  const normalized = normalizeAnswers(answers)
  const profile = resultProfiles[resolvePrimaryResult(normalized)]
  const fit = resolveBudgetFit(budgetRank(normalized.budget), profile, normalized)
  const fitCopy = budgetFitCopy(fit)
  const modifiers = buildModifiers(normalized, fit)

  return {
    themeId: 'ai-coding-pc',
    themeVersion: AI_CODING_PC_THEME_VERSION,
    resolverVersion: AI_CODING_PC_RESOLVER_VERSION,
    primaryResultKey: profile.key,
    displayName: profile.displayName,
    analyticsLabel: profile.analyticsLabel,
    tone: fit === 'insufficient' ? 'warn' : profile.tone,
    summary: profile.summary,
    budgetFit: fit,
    budgetFitLabel: fitCopy.label,
    budgetFitDescription: fitCopy.description,
    modifiers,
    score: adjustScore(profile, normalized, fit),
    specLines: buildSpecLines(profile, normalized, fit),
    minimumLine: profile.minimumLine,
    recommendedLine: profile.recommendedLine,
    niceToHaveLine: profile.niceToHaveLine,
    avoidConditions: profile.avoidConditions,
    effectiveConditions: buildEffectiveConditions(profile, normalized, fit),
    answerSummary: buildAnswerSummary(normalized),
    candidateGuide: profile.candidateGuide,
    ctas: profile.baseCtas,
    references: aiCodingPcReferences,
  }
}

export const aiCodingPcTheme: DiagnosisTheme = {
  id: 'ai-coding-pc',
  version: AI_CODING_PC_THEME_VERSION,
  resolverVersion: AI_CODING_PC_RESOLVER_VERSION,
  path: '/diagnosis/ai-coding-pc',
  title: 'AIコーディングPC診断',
  shortTitle: 'AIコーディング診断',
  description: 'AI補助ツール、Docker、動画編集、ローカルAIの条件から、PC購入前に見るべき構成を整理します。',
  questions: questionDefinitions,
  references: aiCodingPcReferences,
  resolve: resolveAiCodingPcDiagnosis,
}
