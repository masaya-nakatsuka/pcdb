import { Tablet } from '../domain/models/tablet'
import { getSupabase } from './supabaseClient'

export async function fetchActiveTablets(): Promise<Tablet[]> {
  const { data, error } = await getSupabase()
    .from('am_tablet_data')
    .select('*')
    .eq('is_active', true)

  if (error) {
    if (error.code === '42P01') {
      return []
    }

    throw new Error(`Failed to fetch tablets: ${error.message}`)
  }

  return (data ?? []) as unknown as Tablet[]
}
