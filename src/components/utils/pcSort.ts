import { ClientPcWithCpuSpec, ClientSortOptions } from '../types'

export function sortPcs(
  pcsToSort: ClientPcWithCpuSpec[], 
  options: ClientSortOptions,
  cpuOrderList?: string[]
): ClientPcWithCpuSpec[] {
  // CPU名でソートする場合は事前取得したCPUリストを使用
  if (options.field === 'cpu') {
    if (cpuOrderList && cpuOrderList.length > 0) {
      return [...pcsToSort].sort((a, b) => {
        const aCpu = a.cpu || ''
        const bCpu = b.cpu || ''
        
        const aIndex = cpuOrderList.indexOf(aCpu)
        const bIndex = cpuOrderList.indexOf(bCpu)
        
        // CPU名がリストにない場合は最後に配置
        const aOrderIndex = aIndex === -1 ? cpuOrderList.length : aIndex
        const bOrderIndex = bIndex === -1 ? cpuOrderList.length : bIndex
        
        return options.order === 'desc' ? aOrderIndex - bOrderIndex : bOrderIndex - aOrderIndex
      })
    } else {
      // CPUリストが取得できていない場合は文字列ソートにフォールバック
      return [...pcsToSort].sort((a, b) => {
        const aCpu = a.cpu || ''
        const bCpu = b.cpu || ''
        const comparison = aCpu.localeCompare(bCpu)
        return options.order === 'desc' ? -comparison : comparison
      })
    }
  }

  // CPU以外のフィールドは従来通り
  return [...pcsToSort].sort((a, b) => {
    let aValue: number | string | null = null
    let bValue: number | string | null = null

    switch (options.field) {
      case 'pcScore':
        aValue = a.pcScore
        bValue = b.pcScore
        break
      case 'ram':
        aValue = a.ram
        bValue = b.ram
        break
      case 'rom':
        aValue = a.rom
        bValue = b.rom
        break
      case 'display_size':
        aValue = a.display_size
        bValue = b.display_size
        break
      case 'estimatedBatteryLifeHours':
        aValue = a.estimatedBatteryLifeHours
        bValue = b.estimatedBatteryLifeHours
        break
      case 'weight':
        aValue = a.weight
        bValue = b.weight
        break
      case 'price':
        aValue = a.price
        bValue = b.price
        break
    }

    // null値の処理
    if (aValue === null && bValue === null) return 0
    if (aValue === null) return 1
    if (bValue === null) return -1

    // 文字列の場合
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = (aValue as string).localeCompare(bValue as string)
      return options.order === 'desc' ? -comparison : comparison
    }

    // 数値の場合
    const numA = typeof aValue === 'number' ? aValue : 0
    const numB = typeof bValue === 'number' ? bValue : 0
    
    return options.order === 'desc' ? numB - numA : numA - numB
  })
}