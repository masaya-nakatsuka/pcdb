export interface ArticleMetadata {
  id: string
  title: string
  description: string
  date: string
}

export const blogArticles: ArticleMetadata[] = [
  {
    id: 'article1',
    title: 'Amazonで販売しているPCを定量的にスコア付けして評価してみた',
    description: 'Amazon販売PCの性能を客観的なスコアで比較分析。コスパの良いパソコンを見つける方法を解説します。',
    date: '2025-07-30'
  },
  {
    id: 'article2',
    title: '用途ごとのPassmarkスコア目安：自分に合ったPC選びのために',
    description: 'Passmarkスコアを用途別に解説。オフィス作業、動画編集、ゲームに必要なCPU性能の目安をご紹介。',
    date: '2025-07-30'
  },
  {
    id: 'article3',
    title: 'CPUのベンチマークスコアは計算で推測できるのか？',
    description: 'CPUのベンチマークスコアを計算で推測できるのか？というテーマについて掘り下げます。',
    date: '2025-07-30'
  },
  {
    id: 'article4',
    title: 'N100はなぜ生まれたのか？ 軽量・省電力CPUの背景と狙い',
    description: 'Intel N100プロセッサーの登場背景と特徴を解説。省電力と性能のバランスを実現したCPUの魅力。',
    date: '2025-07-30'
  },
  {
    id: 'article5',
    title: 'AMDはN100対抗CPUを出してこないのか？ローエンド市場における静かな駆け引き',
    description: 'AMDがN100対抗CPUを出してこないのか？というテーマについて掘り下げます。',
    date: '2025-07-30'
  }
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())