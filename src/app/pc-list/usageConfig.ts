import type { ClientPcDeviceCategory, ClientPcListing, ClientUsageCategory } from '../../components/types'

export const pcListUsageLabels: Record<ClientUsageCategory, string> = {
  mobile: 'モバイル',
  cafe: 'カフェ作業',
  home: '自宅作業',
  cost_performance: 'コスパ',
  gaming: 'ゲーム',
  video_editing: '動画編集',
}

export const pcListUsagePages: Record<ClientUsageCategory, {
  path: string
  title: string
  heading: string
  description: string
  decisionPoints?: string[]
  relatedLinks?: Array<{
    href: string
    label: string
  }>
}> = {
  mobile: {
    path: '/pc-list/mobile',
    title: '軽量モバイルノートPCランキング - スペクシーハブ',
    heading: '軽量モバイルノートPCランキング',
    description: '持ち運びやすい小型ノートPCを、重量、画面サイズ、バッテリー、CPU、価格のバランスで比較します。13〜14インチ前後の軽量モデルやミニノート選びの入口に使えます。',
    decisionPoints: [
      '毎日持ち運ぶなら重量とバッテリーを優先',
      '作業量が多いなら13〜14インチ前後も候補',
      '長く使うならメモリ16GBとSSD512GB以上を確認',
    ],
    relatedLinks: [
      { href: '/pc-list/cafe', label: 'カフェ作業向けも見る' },
      { href: '/pc-list/cost-performance', label: 'コスパ重視で見る' },
      { href: '/tablet-list', label: 'タブレットも比較' },
    ],
  },
  cafe: {
    path: '/pc-list/cafe',
    title: 'カフェ作業向けPCランキング - スペクシーハブ',
    heading: 'カフェ作業向けPCランキング',
    description: 'カフェや出先で集中作業しやすいPCを、携帯性・画面サイズ・電池持ち・性能のバランスで比較します。'
  },
  home: {
    path: '/pc-list/home',
    title: '自宅作業向けPCランキング - スペクシーハブ',
    heading: '自宅作業向けPCランキング',
    description: '自宅でじっくり使うPCを、処理性能・メモリ・ストレージ・画面の見やすさを中心に比較します。'
  },
  cost_performance: {
    path: '/pc-list/cost-performance',
    title: 'コスパPCランキング - スペクシーハブ',
    heading: 'コスパPCランキング',
    description: '画面サイズを評価に入れず、価格と基本性能のバランスでPCを比較するランキングです。'
  },
  gaming: {
    path: '/pc-list/gaming',
    title: 'ゲーミングPCランキング - スペクシーハブ',
    heading: 'ゲーミングPCランキング',
    description: 'ゲーミングノート、デスクトップ、ミニPCをまとめて、GPU、CPU、メモリ、SSD、価格のバランスで比較します。内蔵GPUで軽めに遊ぶか、専用GPU搭載モデルを選ぶかの切り分けにも使えます。',
    decisionPoints: [
      '3DゲームはGPU名とGPUスコアを最優先',
      '軽めのゲームやクラウドゲームはCPUとメモリも重視',
      'ミニPCは発熱、騒音、拡張性も価格とセットで確認',
    ],
    relatedLinks: [
      { href: '/pc-list/mini-pc?usage=gaming', label: 'ゲーミングミニPCを見る' },
      { href: '/pc-list/desktop?usage=gaming', label: 'デスクトップで見る' },
      { href: '/pc-list/video-editing', label: '動画編集向けも比較' },
    ],
  },
  video_editing: {
    path: '/pc-list/video-editing',
    title: '動画編集向けPCランキング - スペクシーハブ',
    heading: '動画編集向けPCランキング',
    description: '動画編集に使うPCを、CPU・GPU・メモリ・ストレージ性能を中心に比較します。'
  }
}

export function getPcListUsagePath(
  usage: ClientUsageCategory,
  listing: ClientPcListing = 'new',
  device: ClientPcDeviceCategory = 'notebook_pc'
): string {
  if (listing === 'used') {
    const params = new URLSearchParams({ usage })
    return `/pc-list/used?${params.toString()}`
  }

  if (device === 'mini_pc') {
    const params = new URLSearchParams({ usage })
    return `/pc-list/mini-pc?${params.toString()}`
  }

  if (device === 'desktop_pc') {
    const params = new URLSearchParams({ usage })
    return `/pc-list/desktop?${params.toString()}`
  }

  return pcListUsagePages[usage].path
}

export function getPcListUsagePage(usage: ClientUsageCategory) {
  return pcListUsagePages[usage]
}

export function parsePcListUsage(value: string | string[] | undefined): ClientUsageCategory {
  const rawValue = Array.isArray(value) ? value[0] : value
  const normalized = rawValue === 'cost-performance'
    ? 'cost_performance'
    : rawValue === 'video-editing'
      ? 'video_editing'
      : rawValue

  if (
    normalized === 'mobile' ||
    normalized === 'cafe' ||
    normalized === 'home' ||
    normalized === 'cost_performance' ||
    normalized === 'gaming' ||
    normalized === 'video_editing'
  ) {
    return normalized
  }

  return 'cost_performance'
}
