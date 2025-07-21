import { fetchPcList } from './fetchPcs'
import { PcWithCpuSpec } from '../../shared/types/pc'
import ClientPcList from './ClientPcList'

export default async function PcListPage() {
  let pcs: PcWithCpuSpec[] = []

  try {
    pcs = await fetchPcList('cafe')
  } catch (error) {
    console.error('Failed to fetch PCs:', error)
  }

  return (
    <div>
      <ClientPcList pcs={pcs} />
    </div>
  )
}