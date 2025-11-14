import { createClient, SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

if (!hasSupabase) {
  console.warn('⚠️ Supabase not configured. Using localStorage fallback.')
}

export const supabase: SupabaseClient | null = hasSupabase
  ? createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
  : null

export const getSupabase = () => supabase

// Types for our tables
export interface DBOrder {
  id?: string
  order_id: string
  user_id: string
  user_name: string
  vendor_id: string
  vendor_name: string
  items: any[]
  total: number
  status: 'pending' | 'preparing' | 'ready' | 'completed'
  payment_method: string
  created_at?: string
  updated_at?: string
}

export interface VendorOrder {
  id?: string
  order_id: string
  vendor_id: string
  status: 'pending' | 'ready' | 'completed'
  scanned_at?: string
  completed_at?: string
  created_at?: string
}
