'use client'

import { PcTableProps } from '../../shared/types/components'
import ImageComponent from './ImageComponent'

export default function PcTable({ pcs }: PcTableProps) {
  return (
    <table style={{borderCollapse: 'collapse', width: '100%'}}>
      <thead>
        <tr>
          <th style={{border: '1px solid #ddd', padding: '8px'}}>Form Factor</th>
          <th style={{border: '1px solid #ddd', padding: '8px'}}>Display Size</th>
          <th style={{border: '1px solid #ddd', padding: '8px'}}>Brand</th>
          <th style={{border: '1px solid #ddd', padding: '8px'}}>Name</th>
          <th style={{border: '1px solid #ddd', padding: '8px'}}>Price</th>
          <th style={{border: '1px solid #ddd', padding: '8px'}}>Real Price</th>
          <th style={{border: '1px solid #ddd', padding: '8px'}}>CPU</th>
          <th style={{border: '1px solid #ddd', padding: '8px'}}>RAM</th>
          <th style={{border: '1px solid #ddd', padding: '8px'}}>ROM</th>
          <th style={{border: '1px solid #ddd', padding: '8px'}}>Battery (Wh)</th>
          <th style={{border: '1px solid #ddd', padding: '8px'}}>Weight</th>
          <th style={{border: '1px solid #ddd', padding: '8px'}}>URL</th>
          <th style={{border: '1px solid #ddd', padding: '8px'}}>AF URL</th>
          <th style={{border: '1px solid #ddd', padding: '8px'}}>Image</th>
          <th style={{border: '1px solid #ddd', padding: '8px'}}>Fetched At</th>
        </tr>
      </thead>
      <tbody>
        {pcs.map((pc) => (
          <tr key={pc.id}>
            <td style={{border: '1px solid #ddd', padding: '8px'}}>{pc.form_factor}</td>
            <td style={{border: '1px solid #ddd', padding: '8px'}}>{pc.display_size}</td>
            <td style={{border: '1px solid #ddd', padding: '8px'}}>{pc.brand}</td>
            <td style={{border: '1px solid #ddd', padding: '8px'}}>{pc.name}</td>
            <td style={{border: '1px solid #ddd', padding: '8px'}}>{pc.price}</td>
            <td style={{border: '1px solid #ddd', padding: '8px'}}>{pc.real_price}</td>
            <td style={{border: '1px solid #ddd', padding: '8px'}}>{pc.cpu}</td>
            <td style={{border: '1px solid #ddd', padding: '8px'}}>{pc.ram}</td>
            <td style={{border: '1px solid #ddd', padding: '8px'}}>{pc.rom}</td>
            <td style={{border: '1px solid #ddd', padding: '8px'}}>{pc.battery_wh_normalized}</td>
            <td style={{border: '1px solid #ddd', padding: '8px'}}>{pc.weight}</td>
            <td style={{border: '1px solid #ddd', padding: '8px'}}>{pc.url}</td>
            <td style={{border: '1px solid #ddd', padding: '8px'}}>{pc.af_url}</td>
            <td style={{border: '1px solid #ddd', padding: '8px'}}>
              {pc.img_url ? (
                <ImageComponent 
                  src={pc.img_url} 
                  alt={pc.name || 'PC Image'} 
                  style={{width: '100px', height: 'auto'}} 
                />
              ) : (
                'No Image'
              )}
            </td>
            <td style={{border: '1px solid #ddd', padding: '8px'}}>{pc.fetched_at}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}