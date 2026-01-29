import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://tihrltssmpxpreadpzqm.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpaHJsdHNzbXB4cHJlYWRwenFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjEwNDksImV4cCI6MjA3OTczNzA0OX0.lXbPKA8tYj7o582onzj8c9y1vhkdXrk5SN8WmIahJpY"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Types pour les données Zigzag
export interface User {
  id: string
  email?: string
  username?: string
  pseudo?: string // Alias pour compatibilité
  created_at: string
  last_seen?: string
  last_seen_at?: string
}

export interface Game {
  id: string
  status: string
  created_at: string
  completed_at?: string
}

// Alias pour compatibilité
export type Zig = Game

export interface NewsletterSignup {
  id: string
  email: string
  created_at: string
}

export interface ContactMessage {
  id: string
  email: string
  message: string
  is_processed?: boolean
  created_at: string
}

