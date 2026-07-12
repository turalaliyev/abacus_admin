import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
      'Set them in Netlify → Site configuration → Environment variables, then redeploy.',
  )
}

export const supabase = createClient(url, key)

export const STORAGE_BUCKET = 'site-media'
