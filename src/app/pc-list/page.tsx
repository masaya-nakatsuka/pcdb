import { fetchPcList } from './fetchPcs'
import { PcWithCpuSpec } from '../../shared/types/pc'
import PcListContainer from '../../components/PcListContainer'

export default async function PcListPage() {
  let pcs: PcWithCpuSpec[] = []

  try {
    pcs = await fetchPcList()
  } catch (error) {
    console.error('Failed to fetch PCs:', error)
  }

  return (
    <div>
      <h1>PC List</h1>
      <PcListContainer pcs={pcs} />
    </div>
  )
}