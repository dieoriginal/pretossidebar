/**
 * Cliente Supabase compartilhado
 * Funciona tanto no web quanto no mobile
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  // Para web (Next.js)
  const supabaseUrl = 
    typeof window !== 'undefined' 
      ? (window as any).__NEXT_PUBLIC_SUPABASE_URL__ || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      : process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  
  const supabaseAnonKey = 
    typeof window !== 'undefined'
      ? (window as any).__NEXT_PUBLIC_SUPABASE_ANON_KEY__ || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL ou Anon Key não configurados');
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Usamos Clerk para auth
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });

  return supabaseClient;
}

export const supabase = getSupabaseClient();
