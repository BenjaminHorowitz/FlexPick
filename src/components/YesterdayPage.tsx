// src/components/YesterdayPage.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BetCard } from './BetCard';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserPicksYesterday } from '../lib/yesterday';

interface BetOption {
  playerName: string;
  market: string;
  projectedValue: string;
  teamColor: string | string[];
  teamColorSecondary: string | string[];
  isTeam?: boolean;
  teamAbbr?: string;
  league?: string;
}

interface Bet {
  id: number;
  type: string;
  optionA: BetOption;
  optionB: BetOption;
}

interface YesterdayPageProps {
  onTabChange: (tab: 'today' | 'yesterday') => void;
}

export const YesterdayPage = ({ onTabChange }: YesterdayPageProps) => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState<Record<number, 'A' | 'B' | 'T'>>({});
  const [rankings, setRankings] = useState<Record<number, number>>({});
  const [perfectSelections, setPerfectSelections] = useState<Record<number, 'A' | 'B' | 'T'>>({});
  const [hasUserPicks, setHasUserPicks] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchBets();
    fetchPerfectPicks();
  }, []);

  useEffect(() => {
    if (user && bets.length > 0) {
      loadUserPicksFromYesterday();
    } else if (!user) {
      // If user is not signed in, show perfect picks
      setHasUserPicks(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, bets]);

  const parseColor = (color: any, defaultColor: string) => {
    if (!color) return defaultColor;
    if (Array.isArray(color)) return color;
    if (typeof color === 'string') {
      if (color.includes(',')) {
        return color.split(',').map((c) => c.trim());
      }
      return color;
    }
    return defaultColor;
  };

  const fetchBets = async () => {
    try {
      const { data, error } = await supabase
        .from('top10_bets_day1')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      if (data) {
        const formattedBets: Bet[] = data.map((row: any) => {
          const isGameTotal = row.type_1?.toLowerCase().includes('game total') ||
                              row.type_2?.toLowerCase().includes('game total');

          return {
            id: row.id,
            type: isGameTotal ? 'Game Total' : '',
            optionA: {
              playerName: row.description_1,
              market: row.type_1,
              projectedValue: row.value_1,
              teamColor: parseColor(row.primary_1, '#DC2626'),
              teamColorSecondary: parseColor(row.secondary_1, '#3B82F6'),
              isTeam: row.is_team_1,
              teamAbbr: row.team_abbr_1,
              league: row.league_1,
            },
            optionB: {
              playerName: row.description_2,
              market: row.type_2,
              projectedValue: row.value_2,
              teamColor: parseColor(row.primary_2, '#DC2626'),
              teamColorSecondary: parseColor(row.secondary_2, '#3B82F6'),
              isTeam: row.is_team_2,
              teamAbbr: row.team_abbr_2,
              league: row.league_2,
            },
          };
        });
        setBets(formattedBets);
      }
    } catch (error) {
      console.error('Error fetching yesterday bets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPerfectPicks = async () => {
    try {
      const { data, error } = await supabase
        .from('winners_today')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const winnersData = data[0].winners;
        if (winnersData && typeof winnersData === 'object') {
          const perfectSels: Record<number, 'A' | 'B' | 'T'> = {};
          for (const [betId, side] of Object.entries(winnersData)) {
            perfectSels[Number(betId)] = side as 'A' | 'B' | 'T';
          }
          setPerfectSelections(perfectSels);
        }
      }
    } catch (error) {
      console.error('Error fetching perfect picks:', error);
    }
  };

  const loadUserPicksFromYesterday = async () => {
    if (!user) return;
    const { data, error } = await fetchUserPicksYesterday(user.id);
    if (error) {
      console.error('Error loading yesterday picks:', error);
      setHasUserPicks(false);
      return;
    }
    const map = data?.picks ?? {};
    const rankingsMap = data?.rankings ?? {};
    const loaded: Record<number, 'A' | 'B' | 'T'> = {};
    const loadedRankings: Record<number, number> = {};

    for (const [betId, side] of Object.entries(map)) {
      loaded[Number(betId)] = side as 'A' | 'B' | 'T';
    }

    for (const [betId, ranking] of Object.entries(rankingsMap)) {
      loadedRankings[Number(betId)] = ranking as number;
    }

    setSelections(loaded);
    setRankings(loadedRankings);

    // Check if user has any picks
    const hasPicks = Object.keys(map).length > 0;
    setHasUserPicks(hasPicks);
  };

  const handleSelect = () => {
    // Yesterday picks are read-only, no action needed
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden" style={{
        background: 'radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)'
      }}>
        <div className="absolute inset-0 stars-container"></div>
        <div className="text-white text-xl relative z-10">Loading yesterday's bets...</div>
      </div>
    );
  }

  // If user is not signed in or has no picks, always show perfect picks
  const currentSelections = (!user || !hasUserPicks) ? perfectSelections : selections;

  return (
    <div className="max-w-7xl mx-auto relative z-10">
      <div className="text-center mb-6 mt-16 sm:mt-0">
        <h1 className="text-6xl sm:text-7xl font-black text-white mb-3 tracking-tight">
          <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
            FLEX<span className="text-emerald-400">PICK</span>
          </span>
        </h1>

        <div className="flex justify-center mb-4">
          <div className="inline-flex bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-1 shadow-lg">
            <button
              className="px-8 py-3 rounded-md font-semibold text-sm transition-all duration-200 bg-white text-gray-900 shadow-md"
            >
              Yesterday
            </button>
            <button
              onClick={() => onTabChange('today')}
              className="px-8 py-3 rounded-md font-semibold text-sm transition-all duration-200 text-white hover:bg-white hover:bg-opacity-10"
            >
              Today
            </button>
          </div>
        </div>

        <p className="text-lg text-white">
          {!user || !hasUserPicks
            ? 'The perfect picks from yesterday.'
            : 'Your picks from yesterday.'}
        </p>
      </div>

      {bets.length === 0 ? (
        <div className="text-center text-white text-xl py-12">
          No bets available for yesterday
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {bets.map((bet) => (
            <BetCard
              key={bet.id}
              bet={bet}
              selection={currentSelections[bet.id]}
              onSelect={handleSelect}
              locked={true}
              showActual={true}
              confidence={hasUserPicks ? rankings[bet.id] : undefined}
              showConfidenceOnly={true}
            />
          ))}
        </div>
      )}

      <style>{`
        .stars-container {
          background-image:
            radial-gradient(2px 2px at 20px 30px, white, transparent),
            radial-gradient(2px 2px at 60px 70px, white, transparent),
            radial-gradient(1px 1px at 50px 50px, white, transparent),
            radial-gradient(1px 1px at 130px 80px, white, transparent),
            radial-gradient(2px 2px at 90px 10px, white, transparent),
            radial-gradient(1px 1px at 10px 90px, white, transparent),
            radial-gradient(1px 1px at 150px 30px, white, transparent),
            radial-gradient(2px 2px at 110px 130px, white, transparent),
            radial-gradient(1px 1px at 40px 120px, white, transparent),
            radial-gradient(1px 1px at 170px 100px, white, transparent);
          background-size: 200px 200px;
          background-position: 0 0, 40px 60px, 130px 270px, 70px 100px, 0 0, 40px 60px, 130px 270px, 70px 100px, 0 0, 40px 60px;
          animation: twinkle 3s ease-in-out infinite;
        }
        @keyframes twinkle { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
};
