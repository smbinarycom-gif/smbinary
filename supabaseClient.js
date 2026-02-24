import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://mkrwwrctlchdpbhiwlsk.supabase.co"
const supabaseKey = "sb_publishable_KtFuFVWO7D1GVBMfxd7cVw_BV2k1ylt"

export const supabase = createClient(supabaseUrl, supabaseKey)