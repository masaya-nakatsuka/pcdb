import type { ClientUsageCategory } from '../../components/types'

export const pcListUsagePages: Record<ClientUsageCategory, {
  path: string
  title: string
  heading: string
  description: string
}> = {
  mobile: {
    path: '/pc-list/mobile',
    title: 'モバイルPCランキング - スペクシーハブ',
    heading: 'モバイルPCランキング',
    description: '外出先で使いやすいPCを、軽さ・電池持ち・基本性能のバランスで比較します。'
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
    title: 'ゲーム向けPCランキング - スペクシーハブ',
    heading: 'ゲーム向けPCランキング',
    description: 'ゲーム用途のPCを、GPU・CPU・メモリ・ストレージを中心に比較します。'
  },
  video_editing: {
    path: '/pc-list/video-editing',
    title: '動画編集向けPCランキング - スペクシーハブ',
    heading: '動画編集向けPCランキング',
    description: '動画編集に使うPCを、CPU・GPU・メモリ・ストレージ性能を中心に比較します。'
  }
}

export function getPcListUsagePath(usage: ClientUsageCategory): string {
  return pcListUsagePages[usage].path
}

export function getPcListUsagePage(usage: ClientUsageCategory) {
  return pcListUsagePages[usage]
}
