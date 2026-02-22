"use client";

/**
 * Hook compartilhado para real-time subscriptions
 * Funciona tanto no web quanto no mobile
 */

import { useEffect, useRef } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface RealtimeOptions {
  table: string;
  filter?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  callback: (payload: RealtimePostgresChangesPayload<any>) => void;
}

/**
 * Hook para escutar mudanças em tempo real do Supabase
 */
export function useRealtime(options: RealtimeOptions) {
  const { table, filter, event = '*', callback } = options;
  const supabase = getSupabaseClient();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    const channelName = `${table}-changes-${Date.now()}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          filter,
        },
        callback
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, filter, event, callback, supabase]);
}
