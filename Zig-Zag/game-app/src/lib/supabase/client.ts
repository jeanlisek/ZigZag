import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/utils/env';
import { logger } from '@/utils/logger';

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Singleton pattern pour éviter plusieurs instances de GoTrueClient
let supabaseInstance: SupabaseClient | null = null;

export const supabase = ((): SupabaseClient => {
  // Si l'instance existe déjà, la retourner
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Créer une nouvelle instance uniquement si elle n'existe pas
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  });

  return supabaseInstance;
})();

