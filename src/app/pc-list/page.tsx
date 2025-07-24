import { fetchPcList } from './fetchPcs'
import { ClientPcWithCpuSpec } from '../../components/types'
import ClientPcList from './ClientPcList'

export default async function PcListPage() {
  let pcs: ClientPcWithCpuSpec[] = []

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