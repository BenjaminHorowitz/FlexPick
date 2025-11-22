// src/App.tsx
import { useState } from 'react';
import { LogIn, Info } from 'lucide-react';
import { MdLeaderboard } from 'react-icons/md';
import { Analytics } from '@vercel/analytics/react';
import { AuthModal } from './components/AuthModal';
import { Leaderboard } from './components/Leaderboard';
import { UserProfile } from './components/UserProfile';
import { InfoModal } from './components/InfoModal';
import { useAuth } from './contexts/AuthContext';
import { TodayPage } from './components/TodayPage';
import { YesterdayPage } from './components/YesterdayPage';

type TabType = 'today' | 'yesterday';

function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const { user, username, signOut } = useAuth();

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{
      background: 'radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)'
    }}>
      <div className="absolute inset-0 stars-container"></div>

      <div className="absolute top-4 left-4 z-50 flex items-center gap-3">
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 px-4 py-1.5 rounded-md font-bold text-sm shadow-lg">
          BETA
        </div>
        <button
          onClick={() => setInfoModalOpen(true)}
          className="w-10 h-10 rounded-full bg-transparent border-3 border-white text-white flex items-center justify-center shadow-lg hover:bg-white hover:text-gray-900 active:bg-white active:text-gray-900 transition-all font-bold text-xl"
          style={{ borderWidth: '3px' }}
          title="How FlexPick Works"
        >
          i
        </button>
      </div>

      <div className="absolute top-4 right-4 z-50">
        {user ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLeaderboardOpen(true)}
              className="w-10 h-10 rounded-full bg-transparent border-3 border-white text-white flex items-center justify-center shadow-lg hover:bg-white hover:text-gray-900 active:bg-white active:text-gray-900 transition-all"
              style={{ borderWidth: '3px' }}
              title="Leaderboard"
            >
              <MdLeaderboard className="w-5 h-5" />
            </button>
            <button
              onClick={() => setProfileOpen(true)}
              className="bg-transparent border-3 border-white text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-lg hover:bg-white hover:text-gray-900 active:bg-white active:text-gray-900 transition-all"
              style={{ borderWidth: '3px' }}
            >
              {username || user.email?.split('@')[0]}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLeaderboardOpen(true)}
              className="w-10 h-10 rounded-full bg-transparent border-3 border-white text-white flex items-center justify-center shadow-lg hover:bg-white hover:text-gray-900 active:bg-white active:text-gray-900 transition-all"
              style={{ borderWidth: '3px' }}
              title="Leaderboard"
            >
              <MdLeaderboard className="w-5 h-5" />
            </button>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-2 bg-transparent border-3 border-white text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-lg hover:bg-white hover:text-gray-900 active:bg-white active:text-gray-900 transition-all"
              style={{ borderWidth: '3px' }}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {activeTab === 'today' ? (
          <TodayPage onTabChange={setActiveTab} onAuthModalOpen={() => setAuthModalOpen(true)} />
        ) : (
          <YesterdayPage onTabChange={setActiveTab} />
        )}
      </div>

      <footer className="relative z-10 mt-12 pb-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/80 text-sm">
            Any questions or suggestions? Contact us at{' '}
            <a
              href="mailto:info@flexpick.space"
              className="text-white font-semibold hover:text-green-400 transition-colors"
            >
              info@flexpick.space
            </a>
          </p>
        </div>
      </footer>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <Leaderboard isOpen={leaderboardOpen} onClose={() => setLeaderboardOpen(false)} />
      <InfoModal isOpen={infoModalOpen} onClose={() => setInfoModalOpen(false)} />
      <UserProfile
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        username={username}
        onSignOut={() => {
          signOut();
          setProfileOpen(false);
        }}
      />

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
      <Analytics />
    </div>
  );
}

export default App;
