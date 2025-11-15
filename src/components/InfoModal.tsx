import { X } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal = ({ isOpen, onClose }: InfoModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Info</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-4 text-gray-700 leading-relaxed">
          <p className="text-lg">
            The <strong>first-ever platform</strong> where you can compare <strong>different stats</strong> and <strong>different sports</strong> in a single head-to-head.
          </p>

          <p>
            Every day you'll get <strong>10 unique, balanced matchups</strong>. Pick your side on each matchup and rank your Top-3 Picks before the deadline. These rankings act as the tiebreak, giving you bonus points if they hit and helping separate you from players with the same record.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="font-semibold text-gray-900">Scoring is simple:</p>
            <ul className="space-y-1.5 ml-4">
              <li className="flex items-baseline">
                <span className="mr-2">•</span>
                <span>Win a matchup: <strong className="text-emerald-600">+10 points</strong></span>
              </li>
              <li className="flex items-baseline">
                <span className="mr-2">•</span>
                <span>Your #1 hits: <strong className="text-emerald-600">+5 extra</strong></span>
              </li>
              <li className="flex items-baseline">
                <span className="mr-2">•</span>
                <span>Your #2 hits: <strong className="text-emerald-600">+3 extra</strong></span>
              </li>
              <li className="flex items-baseline">
                <span className="mr-2">•</span>
                <span>Your #3 hits: <strong className="text-emerald-600">+1 extra</strong></span>
              </li>
              <li className="flex items-baseline">
                <span className="mr-2">•</span>
                <span>Pushes are worth <strong className="text-gray-900">0</strong></span>
              </li>
            </ul>
          </div>

          <p>
            Once the games are underway, sit back and watch your picks battle it out. Win more, rank higher, and prove you're the sharpest in the room.
          </p>

          <p className="text-sm italic text-gray-600 pt-2">
            <strong>FlexPick</strong> is currently in beta, and will be constantly improving. Big things are on the way!
          </p>
        </div>
      </div>
    </div>
  );
};
