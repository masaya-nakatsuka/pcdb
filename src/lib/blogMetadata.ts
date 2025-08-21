export interface ArticleMetadata {
  id: number,
  title: string
  description: string
  date: string
}

export const blogArticles: ArticleMetadata[] = [
  {
    id: 1,
    title: 'Amazonで販売しているPCを定量的にスコア付けして評価してみた',
    description: 'Amazon販売PCの性能を客観的なスコアで比較分析。コスパの良いパソコンを見つける方法を解説します。',
    date: '2025-05-21'
  },
  {
    id: 2,
    title: '用途ごとのPassmarkスコア目安：自分に合ったPC選びのために',
    description: 'Passmarkスコアを用途別に解説。オフィス作業、動画編集、ゲームに必要なCPU性能の目安をご紹介。',
    date: '2025-06-03'
  },
  {
    id: 3,
    title: 'CPUのベンチマークスコアは計算で推測できるのか？',
    description: 'CPUのベンチマークスコアを計算で推測できるのか？というテーマについて掘り下げます。',
    date: '2025-06-22'
  },
  {
    id: 4,
    title: 'N100はなぜ生まれたのか？ 軽量・省電力CPUの背景と狙い',
    description: 'Intel N100プロセッサーの登場背景と特徴を解説。省電力と性能のバランスを実現したCPUの魅力。',
    date: '2025-06-24'
  },
  {
    id: 5,
    title: 'AMDはN100対抗CPUを出してこないのか？ローエンド市場における静かな駆け引き',
    description: 'AMDがN100対抗CPUを出してこないのか？というテーマについて掘り下げます。',
    date: '2025-06-27'
  },
  {
    id: 6,
    title: '2万円台のノートPCってどうなの？実際に買う前に知っておくべきこと',
    description: '2万円台のノートPCの実力と注意点を解説。N100搭載PCのスコアと実用性を数値で比較。',
    date: '2025-07-02'
  },
  {
    id: 7,
    title: 'Snapdragon搭載Windows PCは買わない方がよいのか',
    description: 'Snapdragon搭載Windows PCの実力と注意点を解説。Snapdragonのスコアと実用性を数値で比較。',
    date: '2025-07-14'
  },
  {
    id: 8,
    title: 'UMPCの活用法｜小さなボディに詰まった可能性',
    description: 'UMPCの活用法を解説。小さなボディに詰まった可能性を数値で比較。',
    date: '2025-07-16'
  },
  {
    id: 9,
    title: 'UMPCを家でも外でも！一台で完結する使い方の提案',
    description: 'UMPCを家でも外でも使う方法を解説。一台で完結する使い方の提案。',
    date: '2025-07-19'
  },
  {
    id: 10,
    title: 'UMPCは小さすぎ？持ち運びしやすく作業もしやすいのは11〜12インチかも',
    description: 'UMPCは小さすぎ？持ち運びしやすく作業もしやすいのは11〜12インチかも',
    date: '2025-07-30'
  }
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())