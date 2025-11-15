// src/lib/picks.ts
import { supabase } from './supabase';

export type PickSide = 'A' | 'B';

export interface UserPicksRow {
  user_id: string;
  picks: Record<string, PickSide>; // keys = bet_id as string
  rankings: Record<string, number>; // keys = bet_id as string, values = 1, 2, or 3
  is_locked?: boolean;
  submitted_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Fetch a single row (per user) containing the JSONB picks map + lock status.
 * If the user has no row yet, returns an empty map and is_locked=false.
 */
export const fetchUserPicksMap = async (
  userId: string
): Promise<{ data: UserPicksRow | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('user_picks')
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
          is_locked: false,
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
        is_locked: (data as any).is_locked ?? false,
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

/**
 * Save picks map and rankings, completely replacing any existing rankings.
 * Users can update picks and rankings until the deadline passes.
 * When rankingsMap is provided, it completely replaces the old rankings.
 */
export const saveUserPicksMap = async (
  userId: string,
  picksMap: Record<string, PickSide>,
  rankingsMap?: Record<string, number>
): Promise<{ success: boolean; error: any }> => {
  try {
    const { data: existing, error: readErr } = await fetchUserPicksMap(userId);
    if (readErr) return { success: false, error: readErr };

    const mergedPicks = { ...(existing?.picks ?? {}), ...picksMap };
    // Replace rankings completely instead of merging
    const finalRankings = rankingsMap !== undefined ? rankingsMap : (existing?.rankings ?? {});

    const { error: upsertErr } = await supabase
      .from('user_picks')
      .upsert(
        [{ user_id: userId, picks: mergedPicks, rankings: finalRankings }],
        { onConflict: 'user_id' }
      );

    if (upsertErr) return { success: false, error: upsertErr };
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Lock helper (set is_locked + submitted_at). Use after successful save.
 */
export const lockUserPicks = async (userId: string) => {
  const { error } = await supabase
    .from('user_picks')
    .update({ is_locked: true, submitted_at: new Date().toISOString() })
    .eq('user_id', userId);
  return { success: !error, error };
};

/**
 * (Optional) Overwrite all picks and rankings.
 */
export const overwriteUserPicksMap = async (
  userId: string,
  picksMap: Record<string, PickSide>,
  rankingsMap?: Record<string, number>
): Promise<{ success: boolean; error: any }> => {
  try {
    const { data: existing, error: readErr } = await fetchUserPicksMap(userId);
    if (readErr) return { success: false, error: readErr };

    const updateData: any = { user_id: userId, picks: picksMap };
    if (rankingsMap !== undefined) {
      updateData.rankings = rankingsMap;
    }

    const { error } = await supabase
      .from('user_picks')
      .upsert([updateData], { onConflict: 'user_id' });

    if (error) return { success: false, error };
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
};
