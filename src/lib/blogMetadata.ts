import type { Metadata } from 'next'

export const SITE_URL = 'https://specsy-hub.com'

export interface ArticleMetadata {
  id: number
  title: string
  description: string
  date: string
}

export const blogArticles: ArticleMetadata[] = [
  {
    id: 33,
    title: 'Amazon PCコスパランキング 2026｜実売価格と性能スコアで選ぶ',
    description: 'SpecsyのPC-DBを使い、Amazon内のPCを価格・CPU型番・GPU・メモリ・SSDで比較。安いだけではないコスパPCを探す記事。',
    date: '2026-06-17',
  },
  {
    id: 38,
    title: '10万円以下で選ぶAmazon PC 2026｜安いだけで失敗しないPC-DB比較',
    description: '10万円以下のAmazon PCを、価格だけでなくCPU型番、GPU、メモリ、SSD、推定駆動時間からPC-DBで比較する記事。',
    date: '2026-06-17',
  },
  {
    id: 36,
    title: 'CPU型番で選ぶAmazon PC 2026｜Core i5/Ryzen 5の世代差をPC-DB比較',
    description: 'Core i5やRyzen 5の名前だけで判断せず、詳細CPU型番・価格・メモリ・SSDをSpecsyのPC-DBで比較する記事。',
    date: '2026-06-17',
  },
  {
    id: 34,
    title: 'ゲーム向けPCランキング 2026｜GPU・CPU・価格をPC-DBで比較',
    description: 'Amazon内のPCをゲーム適性で比較。GPUだけでなくCPU型番、メモリ、SSD、価格をSpecsyのPC-DBで横断評価。',
    date: '2026-06-17',
  },
  {
    id: 35,
    title: '動画編集向けノートPC比較 2026｜CPU・GPU・メモリをPC-DBで見る',
    description: '動画編集向けPCをCPU型番、GPU、メモリ、SSD、推定駆動時間で比較。SpecsyのPC-DBを活用した実データ記事。',
    date: '2026-06-17',
  },
  {
    id: 37,
    title: 'バッテリー持ちの良いノートPC 2026｜用途別推定時間をPC-DB比較',
    description: 'Excel作業、動画視聴、動画編集、3Dゲームの用途別推定駆動時間を使い、バッテリー重視のノートPCをPC-DBで比較。',
    date: '2026-06-17',
  },
  {
    id: 29,
    title: 'Amazon小型ノートPCおすすめ 2026｜総合スコアでPC-DB比較',
    description: '小型ノートPCをCPU型番、GPU、メモリ、SSD、推定駆動時間、価格からPC-DBで比較。',
    date: '2026-06-17',
  },
  {
    id: 28,
    title: '軽量モバイルノートおすすめ 2026｜PC-DBで持ち運びやすさを比較',
    description: '軽量モバイルノートを重量、CPU型番、メモリ、SSD、推定駆動時間、価格からPC-DBで比較。',
    date: '2026-06-17',
  },
  {
    id: 30,
    title: 'Amazon N100ミニノートPC一覧 2026｜PC-DBでモバイル性を比較',
    description: 'N100搭載かつ13.5インチ以下のミニノートをPC-DBから抽出し、価格、メモリ、SSD、推定駆動時間で比較。',
    date: '2026-06-17',
  },
  {
    id: 31,
    title: 'Amazon N150ミニノートPC一覧 2026｜N100より余裕のある軽量PC',
    description: 'N150搭載かつ13.5インチ以下のミニノートをPC-DBから抽出し、価格、メモリ、SSD、推定駆動時間で比較。',
    date: '2026-06-17',
  },
  {
    id: 32,
    title: 'Amazon N95ミニノートPC一覧 2026｜低価格モバイルPCをDB比較',
    description: 'N95搭載かつ13.5インチ以下のミニノートをPC-DBから抽出し、価格、メモリ、SSD、推定駆動時間で比較。',
    date: '2026-06-17',
  },
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

export const listedBlogArticles = blogArticles

export function getBlogArticle(id: number) {
  const article = blogArticles.find((item) => item.id === id)

  if (!article) {
    throw new Error(`Blog article ${id} is not registered`)
  }

  return article
}

export function createBlogArticleMetadata(id: number): Metadata {
  const article = getBlogArticle(id)
  const path = `/blog/article${id}`
  const url = `${SITE_URL}${path}`

  return {
    title: `${article.title} | Specsy`,
    description: article.description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: article.title,
      description: article.description,
      url,
      siteName: 'Specsy',
      type: 'article',
      publishedTime: article.date,
      modifiedTime: article.date,
      locale: 'ja_JP',
    },
    twitter: {
      card: 'summary',
      title: article.title,
      description: article.description,
    },
  }
}
