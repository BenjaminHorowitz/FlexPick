import { useEffect, useState } from 'react';
import { X, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  username: string | null;
  onSignOut: () => void;
}

interface Stats {
  W: number;
  L: number;
  win_pct: number;
}

export const UserProfile = ({ isOpen, onClose, username, onSignOut }: UserProfileProps) => {
  const [allTimeStats, setAllTimeStats] = useState<Stats | null>(null);
  const [yesterdayStats, setYesterdayStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && username) {
      fetchUserStats();
    }
  }, [isOpen, username]);

  const fetchUserStats = async () => {
    if (!username) return;

    setLoading(true);
    try {
      const { data: allTime } = await supabase
        .from('all_time_rankings')
        .select('W, L, win_pct')
        .eq('Username', username)
        .maybeSingle();

      const { data: yesterday } = await supabase
        .from('yesterday_rankings')
        .select('W, L, win_pct')
        .eq('Username', username)
        .maybeSingle();

      setAllTimeStats(allTime);
      setYesterdayStats(yesterday);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{username}</h2>
            <p className="text-sm text-gray-500">Player Profile</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500 text-lg">Loading stats...</div>
            </div>
          ) : (
            <>
              {/* All Time Stats */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-gray-900">All Time Stats</h3>
                {allTimeStats ? (
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{allTimeStats.win_pct.toFixed(1)}%</div>
                        <div className="text-xs text-gray-600 font-medium mt-1">Win Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{allTimeStats.W}</div>
                        <div className="text-xs text-gray-600 font-medium mt-1">Wins</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{allTimeStats.L}</div>
                        <div className="text-xs text-gray-600 font-medium mt-1">Losses</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 text-center text-gray-500">
                    No all-time stats available yet
                  </div>
                )}
              </div>

              {/* Yesterday Stats */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-gray-900">Yesterday's Stats</h3>
                {yesterdayStats ? (
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{yesterdayStats.win_pct.toFixed(1)}%</div>
                        <div className="text-xs text-gray-600 font-medium mt-1">Win Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{yesterdayStats.W}</div>
                        <div className="text-xs text-gray-600 font-medium mt-1">Wins</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{yesterdayStats.L}</div>
                        <div className="text-xs text-gray-600 font-medium mt-1">Losses</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 text-center text-gray-500">
                    No yesterday stats available yet
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer with Sign Out */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onSignOut}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold text-sm shadow-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
