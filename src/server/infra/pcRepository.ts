import { supabase } from './supabaseClient'
import { Pc } from '../domain/models/pc'

export async function fetchAllPcs(): Promise<Pc[]> {
  const { data, error } = await supabase
    .from('am_pc_data')
    .select('*')

  if (error) {
    throw new Error(`Failed to fetch PCs: ${error.message}`)
  }

  if (!data) {
    throw new Error('No PCs found')
  }

  return data
}