import { fetchPcList } from './fetchPcs'
import { Pc } from '../../shared/types/pc'

export default async function PcListPage() {
  let pcs: Pc[] = []

  try {
    pcs = await fetchPcList()
  } catch (error) {
    console.error('Failed to fetch PCs:', error)
  }

  return (
    <div>
      <h1>PC List</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Form Factor</th>
            <th>Display Size</th>
            <th>Brand</th>
            <th>Name</th>
            <th>Price</th>
            <th>Real Price</th>
            <th>CPU</th>
            <th>RAM</th>
            <th>ROM</th>
            <th>Battery</th>
            <th>Battery WH</th>
            <th>Weight</th>
            <th>URL</th>
            <th>AF URL</th>
            <th>Image URL</th>
            <th>Imp Image URL</th>
            <th>Fetched At</th>
          </tr>
        </thead>
        <tbody>
          {pcs.map((pc) => (
            <tr key={pc.id}>
              <td>{pc.id}</td>
              <td>{pc.form_factor}</td>
              <td>{pc.display_size}</td>
              <td>{pc.brand}</td>
              <td>{pc.name}</td>
              <td>{pc.price}</td>
              <td>{pc.real_price}</td>
              <td>{pc.cpu}</td>
              <td>{pc.ram}</td>
              <td>{pc.rom}</td>
              <td>{pc.battery}</td>
              <td>{pc.battery_wh_normalized}</td>
              <td>{pc.weight}</td>
              <td>{pc.url}</td>
              <td>{pc.af_url}</td>
              <td>{pc.img_url}</td>
              <td>{pc.imp_img_url}</td>
              <td>{pc.fetched_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}