import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database tables
export const TABLES = {
  USERS: 'users',
  FOOD_LISTINGS: 'food_listings',
  FOOD_CATEGORIES: 'food_categories',
  FOOD_CLAIMS: 'food_claims',
  FOOD_REQUESTS: 'food_requests',
  DELIVERY_REQUESTS: 'delivery_requests',
  NOTIFICATIONS: 'notifications',
  COMMUNITY_STORIES: 'community_stories',
  EVENTS: 'events',
  STATS: 'stats'
} as const