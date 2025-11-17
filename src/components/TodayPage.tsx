// src/components/TodayPage.tsx
import { useState, useEffect } from 'react';
import { Check, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { BetCard } from './BetCard';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserPicksMap, saveUserPicksMap, lockUserPicks } from '../lib/picks';
import {
  fetchEarliestEvent,
  isBeforeDeadline,
  formatDeadlineTime,
  formatTimeRemaining,
} from '../lib/deadline';

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

interface TodayPageProps {
  onTabChange: (tab: 'today' | 'yesterday') => void;
  onAuthModalOpen: () => void;
}

export const TodayPage = ({ onTabChange, onAuthModalOpen }: TodayPageProps) => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState<Record<number, 'A' | 'B'>>({});
  const [confidences, setConfidences] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [deadlineTime, setDeadlineTime] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isAfterDeadline, setIsAfterDeadline] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchBets();
    fetchDeadline();
  }, []);

  useEffect(() => {
    if (!deadlineTime) return;

    const updateCountdown = () => {
      const remaining = formatTimeRemaining(deadlineTime);
      setTimeRemaining(remaining);
      setIsAfterDeadline(!isBeforeDeadline(deadlineTime));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [deadlineTime]);

  useEffect(() => {
    if (!user && bets.length > 0) {
      loadFromLocalStorage();
    }
  }, [user, bets]);

  useEffect(() => {
    if (user && bets.length > 0) {
      loadUserPicksFromJson();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, bets]);

  const fetchDeadline = async () => {
    const { data, error } = await fetchEarliestEvent();
    if (error) {
      console.error('Error fetching deadline:', error);
      return;
    }
    if (data?.commence_time) {
      setDeadlineTime(data.commence_time);
    }
  };

  const fetchBets = async () => {
    try {
      const { data, error } = await supabase
        .from('top10_bets')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      if (data) {
        const formattedBets: Bet[] = data.map((row: any) => {
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

          const isGameTotal = row.type_1?.toLowerCase().includes('game total') ||
                              row.type_2?.toLowerCase().includes('game total');

          return {
            id: row.id,
            type: isGameTotal ? 'Game Total' : '',
            optionA: {
              playerName: row.description_1,
              market: row.type_1,
              projectedValue: row.expected_value_1,
              teamColor: parseColor(row.primary_1, '#DC2626'),
              teamColorSecondary: parseColor(row.secondary_1, '#3B82F6'),
              isTeam: row.is_team_1,
              teamAbbr: row.team_abbr_1,
              league: row.league_1,
            },
            optionB: {
              playerName: row.description_2,
              market: row.type_2,
              projectedValue: row.expected_value_2,
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
      console.error('Error fetching bets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const savedSelections = localStorage.getItem('draft_selections');
      const savedConfidences = localStorage.getItem('draft_confidences');

      if (savedSelections) {
        setSelections(JSON.parse(savedSelections));
      }
      if (savedConfidences) {
        setConfidences(JSON.parse(savedConfidences));
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  };

  const loadUserPicksFromJson = async () => {
    if (!user) return;
    const { data, error } = await fetchUserPicksMap(user.id);
    if (error) {
      console.error('Error loading user picks (json):', error);
      return;
    }
    console.log('Loaded data from DB:', data);
    const isLocked = data?.is_locked ?? false;

    if (isLocked) {
      setSelections({});
      setConfidences({});
      setLocked(true);
      setSubmitted(true);
      return;
    }

    const map = data?.picks ?? {};
    const rankingsMap = data?.rankings ?? {};
    console.log('Rankings map:', rankingsMap);
    const loaded: Record<number, 'A' | 'B'> = {};
    const loadedRankings: Record<number, number> = {};

    for (const [betId, side] of Object.entries(map)) {
      loaded[Number(betId)] = side as 'A' | 'B';
    }

    for (const [betId, ranking] of Object.entries(rankingsMap)) {
      loadedRankings[Number(betId)] = ranking as number;
    }

    console.log('Loaded rankings:', loadedRankings);
    setSelections(loaded);
    setConfidences(loadedRankings);
    setLocked(false);
    setSubmitted(false);
  };

  const handleSelect = (betId: number, option: 'A' | 'B') => {
    if (isAfterDeadline) return;
    setSelections((prev) => {
      if (prev[betId] === option) {
        const next = { ...prev };
        delete next[betId];
        return next;
      }
      return { ...prev, [betId]: option };
    });
  };

  const handleConfidenceChange = (betId: number, confidence: number | null) => {
    setConfidences((prev) => {
      if (confidence === null) {
        const next = { ...prev };
        delete next[betId];
        return next;
      }
      return { ...prev, [betId]: confidence };
    });
  };

  // Auto-save picks when selections or confidences change
  useEffect(() => {
    const autoSave = async () => {
      if (locked || isAfterDeadline) return;

      if (!user) {
        localStorage.setItem('draft_selections', JSON.stringify(selections));
        localStorage.setItem('draft_confidences', JSON.stringify(confidences));
        return;
      }

      if (Object.keys(selections).length === 0 && Object.keys(confidences).length === 0) return;

      const picksMap: Record<string, 'A' | 'B'> = {};
      Object.entries(selections).forEach(([betId, side]) => {
        picksMap[String(betId)] = side;
      });

      const rankingsMap: Record<string, number> = {};
      Object.entries(confidences).forEach(([betId, ranking]) => {
        rankingsMap[String(betId)] = ranking;
      });

      await saveUserPicksMap(user.id, picksMap, rankingsMap);
    };

    const timeoutId = setTimeout(autoSave, 500);
    return () => clearTimeout(timeoutId);
  }, [selections, confidences, user, locked, isAfterDeadline]);

  const getUsedConfidences = (excludeBetId?: number): Set<number> => {
    const used = new Set<number>();
    Object.entries(confidences).forEach(([betId, conf]) => {
      if (excludeBetId === undefined || Number(betId) !== excludeBetId) {
        used.add(conf);
      }
    });
    return used;
  };

  const allSelected = bets.every((bet) => selections[bet.id]);

  // Check if all 3 confidence levels are assigned
  const assignedConfidences = Object.values(confidences);
  const hasAllRankings = assignedConfidences.includes(1) &&
                         assignedConfidences.includes(2) &&
                         assignedConfidences.includes(3);

  const handleSubmit = async () => {
    if (!user) {
      onAuthModalOpen();
      return;
    }
    if (!allSelected) return;

    if (!hasAllRankings) {
      setError('You must assign rankings 1, 2, and 3 to three different picks before submitting.');
      setTimeout(() => setError(null), 5000);
      return;
    }

    if (isAfterDeadline) {
      setError('The deadline has passed. Picks can no longer be submitted.');
      setTimeout(() => setError(null), 5000);
      return;
    }

    setSubmitting(true);
    setError(null);

    const picksMap: Record<string, 'A' | 'B'> = {};
    Object.entries(selections).forEach(([betId, side]) => {
      picksMap[String(betId)] = side;
    });

    const rankingsMap: Record<string, number> = {};
    Object.entries(confidences).forEach(([betId, ranking]) => {
      rankingsMap[String(betId)] = ranking;
    });

    const { success, error: saveErr } = await saveUserPicksMap(user.id, picksMap, rankingsMap);
    if (!success) {
      setSubmitting(false);
      const errorMsg = saveErr === 'LOCKED'
        ? 'Your picks are already locked.'
        : saveErr?.message?.includes('picks_submission_allowed')
        ? 'The deadline has passed. Picks can no longer be submitted.'
        : 'Failed to save your picks. Please try again.';
      setError(errorMsg);
      setTimeout(() => setError(null), 5000);
      return;
    }

    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden" style={{
        background: 'radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)'
      }}>
        <div className="absolute inset-0 stars-container"></div>
        <div className="text-white text-xl relative z-10">Loading bets...</div>
      </div>
    );
  }

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
              onClick={() => onTabChange('yesterday')}
              className="px-8 py-3 rounded-md font-semibold text-sm transition-all duration-200 text-white hover:bg-white hover:bg-opacity-10"
            >
              Yesterday
            </button>
            <button
              className="px-8 py-3 rounded-md font-semibold text-sm transition-all duration-200 bg-white text-gray-900 shadow-md"
            >
              Today
            </button>
          </div>
        </div>

        <p className="text-lg text-white">
          {isAfterDeadline
            ? 'Picks are locked.'
            : 'Choose your side for each matchup and submit your picks!'}
        </p>

        {deadlineTime && (
          <div className="mt-4 inline-block bg-white bg-opacity-10 backdrop-blur-sm rounded-lg px-6 py-3 shadow-lg">
            <div className="flex items-center gap-3 text-white">
              <Clock className="w-5 h-5" />
              <div>
                <span className="text-sm opacity-80">Deadline </span>
                <span className="font-semibold">{formatDeadlineTime(deadlineTime)}</span>
              </div>
              {!isAfterDeadline && (
                <div className="border-l border-white border-opacity-30 pl-3 ml-1">
                  <span className="text-sm opacity-80">Time remaining: </span>
                  <span className="font-mono text-sm">{timeRemaining}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {bets.map((bet) => (
          <BetCard
            key={bet.id}
            bet={bet}
            selection={selections[bet.id]}
            onSelect={(option) => handleSelect(bet.id, option)}
            locked={isAfterDeadline}
            confidence={confidences[bet.id]}
            onConfidenceChange={(conf) => handleConfidenceChange(bet.id, conf)}
            usedConfidences={getUsedConfidences(bet.id)}
          />
        ))}
      </div>

      <div className="flex flex-col items-center mb-8">
        {!isAfterDeadline && (
          <div className="text-white text-sm mb-3 text-center">
            {!hasAllRankings && allSelected && (
              <span className="text-red-400">
                Assign rankings 1, 2, and 3 to submit
              </span>
            )}
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={!allSelected || !hasAllRankings || submitting || isAfterDeadline}
          className={`py-4 px-16 rounded-lg font-bold text-lg transition-all duration-200 ${
            allSelected && hasAllRankings && !submitting && !isAfterDeadline
              ? 'bg-white text-[#000814] hover:bg-gray-100 shadow-lg hover:shadow-xl cursor-pointer transform hover:scale-105'
              : 'bg-gray-400 bg-opacity-50 text-gray-300 cursor-not-allowed opacity-60'
          }`}
        >
          {isAfterDeadline
            ? 'Picks Locked'
            : submitting
            ? 'Saving...'
            : 'Submit Picks'}
        </button>
      </div>

      {error && (
        <div className="flex justify-center mb-8">
          <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
            {error}
          </div>
        </div>
      )}

      {submitted && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-4 text-center transform animate-scaleIn">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#000814] rounded-full mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#000814] mb-2">Success!</h2>
            <p className="text-gray-600">Your picks have been saved.</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
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
