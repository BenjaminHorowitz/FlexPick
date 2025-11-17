import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { MdLeaderboard } from 'react-icons/md';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface LeaderboardEntry {
  id: string;
  Username: string;
  win_pct: number;
  W: number;
  L: number;
  Points?: number;
}

type TabType = 'all-time' | 'yesterday';

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
}

type SortField = 'win_pct' | 'W' | 'L' | 'Points';

export const Leaderboard = ({ isOpen, onClose }: LeaderboardProps) => {
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('yesterday');
  const [sortField, setSortField] = useState<SortField>('Points');
  const [sortAscending, setSortAscending] = useState(false);
  const { username } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchRankings();
    }
  }, [isOpen, activeTab, sortField, sortAscending]);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const tableName = activeTab === 'all-time' ? 'all_time_rankings' : 'yesterday_rankings';
      const selectFields = activeTab === 'yesterday'
        ? 'id, Username, win_pct, W, L, Points'
        : 'id, Username, win_pct, W, L';

      // Use appropriate sort field based on active tab
      const effectiveSortField = activeTab === 'all-time' && sortField === 'Points' ? 'win_pct' : sortField;

      const { data, error } = await supabase
        .from(tableName)
        .select(selectFields)
        .order(effectiveSortField, { ascending: sortAscending, nullsFirst: false });

      if (error) throw error;
      setRankings(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAscending(!sortAscending);
    } else {
      setSortField(field);
      setSortAscending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-gray-800 p-2 rounded-lg">
              <MdLeaderboard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Leaderboard</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 sm:px-6 pt-4">
          <button
            onClick={() => setActiveTab('yesterday')}
            className={`flex-1 px-4 py-3 sm:py-2 rounded-lg font-semibold text-sm transition-all min-h-[44px] ${
              activeTab === 'yesterday'
                ? 'bg-gray-800 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Yesterday
          </button>
          <button
            onClick={() => setActiveTab('all-time')}
            className={`flex-1 px-4 py-3 sm:py-2 rounded-lg font-semibold text-sm transition-all min-h-[44px] ${
              activeTab === 'all-time'
                ? 'bg-gray-800 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Time
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500 text-lg">Loading rankings...</div>
            </div>
          ) : rankings.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500 text-lg">No rankings available yet</div>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Desktop Table Header - Hidden on Mobile */}
              {activeTab === 'all-time' ? (
                <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 rounded-lg font-semibold text-gray-700 text-sm">
                  <div className="col-span-1 text-center">Rank</div>
                  <div className="col-span-5">Username</div>
                  <button
                    onClick={() => handleSort('win_pct')}
                    className="col-span-2 text-center flex items-center justify-center gap-1 hover:text-gray-900 transition-colors"
                  >
                    Win %
                    {sortField === 'win_pct' && (
                      sortAscending ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleSort('W')}
                    className="col-span-2 text-center flex items-center justify-center gap-1 hover:text-gray-900 transition-colors"
                  >
                    W
                    {sortField === 'W' && (
                      sortAscending ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleSort('L')}
                    className="col-span-2 text-center flex items-center justify-center gap-1 hover:text-gray-900 transition-colors"
                  >
                    L
                    {sortField === 'L' && (
                      sortAscending ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ) : (
                <div className="hidden sm:grid grid-cols-[50px_1fr_80px_80px_60px_60px] gap-4 px-4 py-3 bg-gray-50 rounded-lg font-semibold text-gray-700 text-sm">
                  <div className="text-center">Rank</div>
                  <div>Username</div>
                  <div className="text-center">Points</div>
                  <div className="text-center">Win %</div>
                  <div className="text-center">W</div>
                  <div className="text-center">L</div>
                </div>
              )}

              {/* Mobile Table Header */}
              {activeTab === 'all-time' ? (
                <div className="sm:hidden grid grid-cols-[32px_1fr_52px_32px_32px] gap-1.5 px-2 py-2 bg-gray-50 rounded-lg font-semibold text-gray-700 text-[10px]">
                  <div className="text-center">Rank</div>
                  <div className="truncate">Username</div>
                  <button
                    onClick={() => handleSort('win_pct')}
                    className="text-center flex items-center justify-center gap-0.5 hover:text-gray-900 transition-colors"
                  >
                    Win %
                    {sortField === 'win_pct' && (
                      sortAscending ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleSort('W')}
                    className="text-center flex items-center justify-center gap-0.5 hover:text-gray-900 transition-colors"
                  >
                    W
                    {sortField === 'W' && (
                      sortAscending ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleSort('L')}
                    className="text-center flex items-center justify-center gap-0.5 hover:text-gray-900 transition-colors"
                  >
                    L
                    {sortField === 'L' && (
                      sortAscending ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />
                    )}
                  </button>
                </div>
              ) : (
                <div className="sm:hidden grid grid-cols-[28px_1fr_40px_46px_28px_28px] gap-1.5 px-2 py-2 bg-gray-50 rounded-lg font-semibold text-gray-700 text-[10px]">
                  <div className="text-center">Rank</div>
                  <div className="truncate">Username</div>
                  <div className="text-center">Pts</div>
                  <div className="text-center">Win %</div>
                  <div className="text-center">W</div>
                  <div className="text-center">L</div>
                </div>
              )}

              {/* Table Rows */}
              {rankings.map((entry, index) => {
                const isCurrentUser = username && entry.Username === username;
                return (
                  <div
                    key={entry.id}
                    className={`grid rounded-lg transition-colors border ${
                      isCurrentUser
                        ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                        : 'bg-white border-gray-100 hover:bg-gray-50'
                    } ${
                      activeTab === 'yesterday'
                        ? 'grid-cols-[28px_1fr_40px_46px_28px_28px] gap-1.5 px-2 py-2 sm:grid-cols-[50px_1fr_80px_80px_60px_60px] sm:gap-4 sm:px-4 sm:py-3'
                        : 'grid-cols-[32px_1fr_52px_32px_32px] gap-1.5 px-2 py-2 sm:grid-cols-12 sm:gap-4 sm:px-4 sm:py-3'
                    }`}
                  >
                    <div className={`text-center font-semibold text-gray-900 text-[11px] sm:text-base ${
                      activeTab === 'all-time' ? 'sm:col-span-1' : ''
                    }`}>
                      {index + 1}
                    </div>
                    <div className={`font-medium text-gray-900 truncate text-[11px] sm:text-base ${
                      activeTab === 'all-time' ? 'sm:col-span-5' : ''
                    }`}>
                      {entry.Username}
                    </div>
                    {activeTab === 'yesterday' && (
                      <div className="text-center text-gray-900 font-semibold text-[11px] sm:text-base">
                        {entry.Points ?? 0}
                      </div>
                    )}
                    <div className={`text-center text-gray-900 font-semibold text-[11px] sm:text-base ${
                      activeTab === 'all-time' ? 'sm:col-span-2' : ''
                    }`}>
                      {entry.win_pct.toFixed(1)}%
                    </div>
                    <div className={`text-center text-gray-900 font-semibold text-[11px] sm:text-base ${
                      activeTab === 'all-time' ? 'sm:col-span-2' : ''
                    }`}>
                      {entry.W}
                    </div>
                    <div className={`text-center text-gray-900 font-semibold text-[11px] sm:text-base ${
                      activeTab === 'all-time' ? 'sm:col-span-2' : ''
                    }`}>
                      {entry.L}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
