export interface ArticleMetadata {
  id: number,
  title: string
  description: string
  date: string
  listed?: boolean
}

export const blogArticles: ArticleMetadata[] = [
  {
    id: 1,
    title: 'Amazonで販売しているPCを定量的にスコア付けして評価してみた',
    description: 'Amazon販売PCの性能を客観的なスコアで比較分析。コスパの良いパソコンを見つける方法を解説します。',
    date: '2025-05-21',
    listed: false
  },
  {
    id: 2,
    title: '用途ごとのPassmarkスコア目安：自分に合ったPC選びのために',
    description: 'Passmarkスコアを用途別に解説。オフィス作業、動画編集、ゲームに必要なCPU性能の目安をご紹介。',
    date: '2025-06-03',
    listed: false
  },
  {
    id: 3,
    title: 'CPUのベンチマークスコアは計算で推測できるのか？',
    description: 'CPUのベンチマークスコアを計算で推測できるのか？というテーマについて掘り下げます。',
    date: '2025-06-22',
    listed: false
  },
  {
    id: 4,
    title: 'N100はなぜ生まれたのか？ 軽量・省電力CPUの背景と狙い',
    description: 'Intel N100プロセッサーの登場背景と特徴を解説。省電力と性能のバランスを実現したCPUの魅力。',
    date: '2025-06-24',
    listed: false
  },
  {
    id: 5,
    title: 'AMDはN100対抗CPUを出してこないのか？ローエンド市場における静かな駆け引き',
    description: 'AMDがN100対抗CPUを出してこないのか？というテーマについて掘り下げます。',
    date: '2025-06-27',
    listed: false
  },
  {
    id: 6,
    title: '2万円台のノートPCってどうなの？実際に買う前に知っておくべきこと',
    description: '2万円台のノートPCの実力と注意点を解説。N100搭載PCのスコアと実用性を数値で比較。',
    date: '2025-07-02',
    listed: false
  },
  {
    id: 7,
    title: 'Snapdragon搭載Windows PCは買わない方がよいのか',
    description: 'Snapdragon搭載Windows PCの実力と注意点を解説。Snapdragonのスコアと実用性を数値で比較。',
    date: '2025-07-14',
    listed: false
  },
  {
    id: 8,
    title: 'UMPCの活用法｜小さなボディに詰まった可能性',
    description: 'UMPCの活用法を解説。小さなボディに詰まった可能性を数値で比較。',
    date: '2025-07-16',
    listed: false
  },
  {
    id: 9,
    title: 'UMPCを家でも外でも！一台で完結する使い方の提案',
    description: 'UMPCを家でも外でも使う方法を解説。一台で完結する使い方の提案。',
    date: '2025-07-19',
    listed: false
  },
  {
    id: 10,
    title: 'UMPCは小さすぎ？持ち運びしやすく作業もしやすいのは11〜12インチかも',
    description: 'UMPCは小さすぎ？持ち運びしやすく作業もしやすいのは11〜12インチかも',
    date: '2025-07-30',
    listed: false
  },
  {
    id: 33,
    title: 'Amazon PCコスパランキング 2026｜実売価格と性能スコアで選ぶ',
    description: 'SpecsyのPC-DBを使い、Amazon内のPCを価格・CPU型番・GPU・メモリ・SSDで比較。安いだけではないコスパPCを探す記事。',
    date: '2026-06-17'
  },
  {
    id: 34,
    title: 'ゲーム向けPCランキング 2026｜GPU・CPU・価格をPC-DBで比較',
    description: 'Amazon内のPCをゲーム適性で比較。GPUだけでなくCPU型番、メモリ、SSD、価格をSpecsyのPC-DBで横断評価。',
    date: '2026-06-17'
  },
  {
    id: 35,
    title: '動画編集向けノートPC比較 2026｜CPU・GPU・メモリをPC-DBで見る',
    description: '動画編集向けPCをCPU型番、GPU、メモリ、SSD、推定駆動時間で比較。SpecsyのPC-DBを活用した実データ記事。',
    date: '2026-06-17'
  },
  {
    id: 29,
    title: '総合スコア順 小型ノート おすすめ 2025｜数値で比較して選ぶ',
    description: 'pcScoreを軸に小型ノートを数値で比較。重量・推定駆動・16GB/512GBの現実基準で後悔しない選び方。',
    date: '2025-09-03'
  }
  ,{
    id: 28,
    title: '軽量モバイルノート おすすめ 2025｜“持続×軽さ×実用”の最適点',
    description: '通学・通勤やカフェ学習向け。1.3kg以下・推定8〜10時間・16GB/512GBを基準に最適解を整理。',
    date: '2025-08-31'
  }
  ,{
    id: 30,
    title: 'Amazon N100ミニノートPC一覧 2025｜PC-DBでモバイル性重視比較',
    description: 'N100搭載ミニノートをSpecsyのPC-DBから抽出。価格、重量、推定駆動時間、メモリで比較。',
    date: '2025-09-10'
  }
  ,{
    id: 31,
    title: 'Amazon N150ミニノートPC一覧 2025｜N100より余裕のある軽量PC',
    description: 'N150搭載ミニノートをPC-DBで比較。13.5インチ以下、重量、メモリ、推定駆動時間で探す。',
    date: '2025-09-10'
  }
  ,{
    id: 32,
    title: 'Amazon N95ミニノートPC一覧 2025｜低価格モバイルPCをDB比較',
    description: 'N95搭載ミニノートをSpecsyのPC-DBから抽出し、価格、重量、メモリ、推定駆動時間で比較。',
    date: '2025-09-10'
  }
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

export const listedBlogArticles = blogArticles.filter((article) => article.listed !== false)
