import CostPerformancePcListClient from './CostPerformancePcListClient'

export const metadata = {
  title: 'コスパPCランキング - スペクシーハブ',
  description: '画面サイズを評価に入れず、価格と基本性能のバランスでPCを比較するランキングです。',
}

export default function CostPerformancePcListPage() {
  return <CostPerformancePcListClient />
}
