// src/lib/yesterday.ts
import { supabase } from './supabase';
import { PickSide } from './picks';

export interface UserPicksYesterdayRow {
  user_id: string;
  picks: Record<string, PickSide>;
  rankings?: Record<string, number>;
  is_locked?: boolean;
  submitted_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Fetch a single row (per user) containing yesterday's picks.
 * Returns empty map if user has no picks for yesterday.
 */
export const fetchUserPicksYesterday = async (
  userId: string
): Promise<{ data: UserPicksYesterdayRow | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('user_picks_yesterday')
      .select('user_id, picks, rankings, is_locked, submitted_at, created_at, updated_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) return { data: null, error };

    if (!data) {
      return {
        data: {
          user_id: userId,
          picks: {},
          rankings: {},
          is_locked: true,
          submitted_at: null,
          created_at: null,
          updated_at: null,
        },
        error: null,
      };
    }

    const safePicks = (data as any).picks ?? {};
    const safeRankings = (data as any).rankings ?? {};
    return {
      data: {
        user_id: data.user_id,
        picks: safePicks,
        rankings: safeRankings,
        is_locked: (data as any).is_locked ?? true,
        submitted_at: (data as any).submitted_at ?? null,
        created_at: (data as any).created_at ?? null,
        updated_at: (data as any).updated_at ?? null,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
};
