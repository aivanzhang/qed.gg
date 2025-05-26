import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // In a real app, you might want to handle this more gracefully,
  // especially if some parts of the app can work without Supabase.
  // For this project, we'll throw an error during development if they're missing.
  throw new Error('Missing Supabase URL or anon key environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
