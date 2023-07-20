import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(import.meta.env.VITE_SUPABASE_PUBLIC_URL, import.meta.env.VITE_SUPABASE_PUBLIC_KEY)
