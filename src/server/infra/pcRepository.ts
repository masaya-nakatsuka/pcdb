import { getSupabase } from './supabaseClient'
import { Pc } from '../domain/models/pc'
import { normalizeAffiliateUrls } from './affiliateUrl'

export async function fetchAllPcs(): Promise<Pc[]> {
  const { data, error } = await getSupabase()
    .from('am_pc_data')
    .select('*')

  if (error) {
    throw new Error(`Failed to fetch PCs: ${error.message}`)
  }

  if (!data) {
    throw new Error('No PCs found')
  }

  return normalizeAffiliateUrls(data as unknown as Pc[])
}
