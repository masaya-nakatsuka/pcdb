import { Monitor } from '../domain/models/monitor'
import { getSupabase } from './supabaseClient'

export async function fetchActiveMonitors(): Promise<Monitor[]> {
  const { data, error } = await getSupabase()
    .from('am_monitor_data')
    .select('*')
    .eq('is_active', true)

  if (error) {
    if (error.code === '42P01') {
      return []
    }

    throw new Error(`Failed to fetch monitors: ${error.message}`)
  }

  return (data ?? []) as unknown as Monitor[]
}
