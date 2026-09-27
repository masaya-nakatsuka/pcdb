import type { Metadata } from 'next'
import { SITE_URL as SHARED_SITE_URL } from './seoMetadata'

export const SITE_URL = SHARED_SITE_URL

export interface ArticleMetadata {
  id: number
  title: string
  description: string
  date: string
}

export const blogArticles: ArticleMetadata[] = [
  {
    id: 63,
    title: 'PassMarkスコアの目安はどれくらい？用途別のざっくり早見 2026',
    description: 'PassMarkスコアの目安を、ネット閲覧、Office、写真編集、動画編集、ゲームなど用途別にざっくり整理し、実際のPC候補もSpecsyのPC-DBで確認する記事。',
    date: '2026-06-25',
  },
  {
    id: 33,
    title: 'AmazonコスパPCの予算目安 2026｜いくら出せばいいかPC-DB比較',
    description: 'Amazonでコスパの良いPCを選ぶために、SpecsyのPC-DBで5万円以下・6万円以下・7万円以下・10万円以上の価格分布と実用構成を比較する記事。',
    date: '2026-06-18',
  },
  {
    id: 38,
    title: '10万円以下で選ぶAmazon PC 2026｜安いだけで失敗しないPC-DB比較',
    description: '10万円以下のAmazon PCを、価格だけでなくCPU型番、GPU、メモリ、SSD、推定駆動時間からPC-DBで比較する記事。',
    date: '2026-06-17',
  },
  {
    id: 40,
    title: '5万円以下で選ぶAmazon PC 2026｜激安PCをPC-DBで比較',
    description: '5万円以下のAmazon PCを、価格だけでなくCPU型番、メモリ、SSD、GPU、推定駆動時間からPC-DBで比較する記事。',
    date: '2026-06-17',
  },
  {
    id: 51,
    title: '6万円以下で選ぶAmazon PC 2026｜低価格PCをPC-DB比較',
    description: '6万円以下のAmazon PCを、価格だけでなくCPU型番、メモリ、SSD、GPU、推定駆動時間からPC-DBで比較する記事。',
    date: '2026-06-17',
  },
  {
    id: 54,
    title: '7万円以下で選ぶAmazon PC 2026｜実用構成をPC-DB比較',
    description: '7万円以下のAmazon PCを、価格だけでなくCPU型番、メモリ16GB、SSD512GB、GPU、推定駆動時間からPC-DBで比較する記事。',
    date: '2026-06-17',
  },
  {
    id: 39,
    title: '15万円以下で選ぶAmazon PC 2026｜CPU・GPUまでPC-DB比較',
    description: '15万円以下のAmazon PCを、CPU型番、GPU、メモリ、SSD、推定駆動時間、用途別スコアからPC-DBで比較する記事。',
    date: '2026-06-17',
  },
  {
    id: 36,
    title: 'PassMarkスコア目安で選ぶAmazon PC 2026｜CPU型番をPC-DB比較',
    description: 'PassMarkスコアの目安を、Core i5/Ryzen 5などのCPU型番、価格、メモリ、SSDと合わせてSpecsyのPC-DBで比較する記事。',
    date: '2026-06-17',
  },
  {
    id: 47,
    title: 'N95/N100/N150搭載Amazon PC 2026｜低価格PCをPC-DB比較',
    description: 'N95/N100/N150搭載のAmazon PCを、価格、メモリ、SSD、画面サイズ、重量、推定駆動時間からPC-DBで比較する記事。',
    date: '2026-06-17',
  },
  {
    id: 56,
    title: 'N95/N100/N150・16GB/512GB構成のAmazon PC 2026｜低価格実用PCをPC-DB比較',
    description: 'N95/N100/N150搭載かつメモリ16GB・SSD512GB以上のAmazon PCを、価格、CPU型番、重量、画面サイズ、推定駆動時間からPC-DBで比較する記事。',
    date: '2026-06-18',
  },
  {
    id: 43,
    title: 'Ryzen搭載Amazon PC 2026｜Ryzen 5/7をPC-DBで比較',
    description: 'Ryzen搭載のAmazon PCを、Ryzen 5/7の世代差、メモリ、SSD、GPU、価格、推定駆動時間からPC-DBで比較する記事。',
    date: '2026-06-17',
  },
  {
    id: 44,
    title: 'Core搭載Amazon PC 2026｜Core i3/i5/Core UltraをPC-DB比較',
    description: 'Core搭載のAmazon PCを、Core i3/i5/Core Ultraの世代差、メモリ、SSD、GPU、価格からPC-DBで比較する記事。',
    date: '2026-06-17',
  },
  {
    id: 41,
    title: 'メモリ16GB以上のAmazon PC 2026｜8GBで後悔しないPC-DB比較',
    description: 'メモリ16GB以上のAmazon PCを、CPU型番、SSD容量、GPU、価格、推定駆動時間からPC-DBで比較する記事。',
    date: '2026-06-17',
  },
  {
    id: 42,
    title: 'SSD512GB以上のAmazon PC 2026｜256GBで後悔しないPC-DB比較',
    description: 'SSD512GB以上のAmazon PCを、CPU型番、メモリ、GPU、価格、推定駆動時間からPC-DBで比較する記事。',
    date: '2026-06-17',
  },
  {
    id: 55,
    title: 'メモリ16GB・SSD512GB以上のAmazon PC 2026｜実用構成をPC-DB比較',
    description: 'メモリ16GBかつSSD512GB以上のAmazon PCを、CPU型番、GPU、価格、推定駆動時間、用途別スコアからPC-DBで比較する記事。',
    date: '2026-06-18',
  },
  {
    id: 57,
    title: '1.3kg以下・16GB/512GB構成のAmazon軽量ノートPC 2026｜持ち運べる実用PCをPC-DB比較',
    description: '1.3kg以下かつメモリ16GB・SSD512GB以上のAmazon軽量ノートPCを、重量、CPU型番、価格、推定駆動時間からPC-DBで比較する記事。',
    date: '2026-06-18',
  },
  {
    id: 61,
    title: '1kg以下・16GB/512GB構成のAmazon軽量ノートPC 2026｜超軽量メインPCをPC-DB比較',
    description: '1kg以下かつメモリ16GB・SSD512GB以上のAmazon軽量ノートPCを、重量、CPU型番、価格、推定駆動時間からPC-DBで比較する記事。',
    date: '2026-06-18',
  },
  {
    id: 62,
    title: '11インチ以下・16GB/512GB構成のAmazonミニノートPC 2026｜超小型の実用PCをPC-DB比較',
    description: '11インチ以下かつメモリ16GB・SSD512GB以上のAmazonミニノートPCを、画面サイズ、重量、CPU型番、価格、推定駆動時間からPC-DBで比較する記事。',
    date: '2026-06-18',
  },
  {
    id: 58,
    title: '14インチ前後・16GB/512GB構成のAmazonノートPC 2026｜作業しやすい実用PCをPC-DB比較',
    description: '14インチ前後かつメモリ16GB・SSD512GB以上のAmazonノートPCを、画面サイズ、重量、CPU型番、価格、推定駆動時間からPC-DBで比較する記事。',
    date: '2026-06-18',
  },
  {
    id: 59,
    title: '2in1・16GB/512GB構成のAmazonノートPC 2026｜タブレット兼用の実用PCをPC-DB比較',
    description: '2in1かつメモリ16GB・SSD512GB以上のAmazonノートPCを、重量、画面サイズ、CPU型番、価格、推定駆動時間からPC-DBで比較する記事。',
    date: '2026-06-18',
  },
  {
    id: 60,
    title: '15.6インチ前後・16GB/512GB構成のAmazonノートPC 2026｜大画面の実用PCをPC-DB比較',
    description: '15.6インチ前後かつメモリ16GB・SSD512GB以上のAmazonノートPCを、画面サイズ、重量、CPU型番、価格、推定駆動時間からPC-DBで比較する記事。',
    date: '2026-06-18',
  },
  {
    id: 45,
    title: '15.6インチ前後のAmazonノートPC 2026｜大画面をPC-DB比較',
    description: '15.6インチ前後のAmazonノートPCを、CPU型番、メモリ、SSD、重量、価格、推定駆動時間からPC-DBで比較する記事。',
    date: '2026-06-17',
  },
  {
    id: 46,
    title: '14インチ前後のAmazonノートPC 2026｜持ち運びと作業性をPC-DB比較',
    description: '14インチ前後のAmazonノートPCを、CPU型番、メモリ、SSD、重量、価格、推定駆動時間からPC-DBで比較する記事。',
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
    description: '小型ノートPCをCPU型番、GPU、メモリ、SSD、推定駆動時間、価格、用途別スコアからPC-DBで比較します。',
    date: '2026-06-17',
  },
  {
    id: 49,
    title: '11インチ以下のAmazonミニノートPC 2026｜超小型をPC-DB比較',
    description: '11インチ以下のAmazonミニノートPCを、画面サイズ、重量、CPU型番、メモリ、SSD、価格、推定駆動時間からPC-DBで比較する記事。',
    date: '2026-06-17',
  },
  {
    id: 52,
    title: 'Amazon 2in1ノートPC 2026｜タブレット兼用PCをPC-DB比較',
    description: 'Amazonの2in1ノートPCを、画面サイズ、重量、CPU型番、メモリ、SSD、価格、推定駆動時間からPC-DBで比較する記事。',
    date: '2026-06-17',
  },
  {
    id: 28,
    title: '小型・軽量モバイルノートおすすめ 2026｜ミニノートをPC-DB比較',
    description: '小型ノートPCや軽量モバイルノートを、重量、画面サイズ、CPU型番、メモリ、SSD、推定駆動時間、価格からPC-DBで比較。',
    date: '2026-06-17',
  },
  {
    id: 48,
    title: '1.3kg以下のAmazon軽量ノートPC 2026｜持ち運びをPC-DB比較',
    description: '1.3kg以下のAmazon軽量ノートPCを、重量、CPU型番、メモリ、SSD、価格、推定駆動時間からPC-DBで比較する記事。',
    date: '2026-06-17',
  },
  {
    id: 50,
    title: '1kg以下のAmazon軽量ノートPC 2026｜超軽量をPC-DB比較',
    description: '1kg以下のAmazon軽量ノートPCを、重量、画面サイズ、CPU型番、メモリ、SSD、価格、推定駆動時間からPC-DBで比較する記事。',
    date: '2026-06-17',
  },
  {
    id: 53,
    title: '900g以下のAmazon超軽量ノートPC 2026｜持ち運び特化をPC-DB比較',
    description: '900g以下のAmazon超軽量ノートPCを、重量、画面サイズ、CPU型番、メモリ、SSD、価格、推定駆動時間からPC-DBで比較する記事。',
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
