// src/components/BetCard.tsx
import { useState } from 'react';
import { FaHockeyPuck } from 'react-icons/fa6';
import { IoBasketball, IoAmericanFootball } from 'react-icons/io5';
import { Hash } from 'lucide-react';

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

interface BetCardProps {
  bet: {
    id: number;
    type: string;
    optionA: BetOption;
    optionB: BetOption;
  };
  selection: 'A' | 'B' | 'T' | undefined;
  onSelect: (option: 'A' | 'B') => void;
  locked?: boolean;
  showActual?: boolean;
  confidence?: number;
  onConfidenceChange?: (confidence: number | null) => void;
  usedConfidences?: Set<number>;
  showConfidenceOnly?: boolean; // Only show badge if confidence value exists
}

const getTeamIcon = (league?: string) => {
  const leagueUpper = league?.toUpperCase();
  if (leagueUpper === 'NBA') return IoBasketball;
  if (leagueUpper === 'NHL') return FaHockeyPuck;
  if (leagueUpper === 'NFL') return IoAmericanFootball;
  return IoAmericanFootball; // Default to NFL
};

export const BetCard = ({ bet, selection, onSelect, locked, showActual, confidence, onConfidenceChange, usedConfidences, showConfidenceOnly }: BetCardProps) => {
  const isGameTotal = bet.type?.toLowerCase().includes('game total');
  if (isGameTotal) {
    return <GameTotalBetCard bet={bet} selection={selection} onSelect={onSelect} locked={locked} showActual={showActual} confidence={confidence} onConfidenceChange={onConfidenceChange} usedConfidences={usedConfidences} showConfidenceOnly={showConfidenceOnly} />;
  }
  return <RegularBetCard bet={bet} selection={selection} onSelect={onSelect} locked={locked} showActual={showActual} confidence={confidence} onConfidenceChange={onConfidenceChange} usedConfidences={usedConfidences} showConfidenceOnly={showConfidenceOnly} />;
};

/* ---------------- Regular Card ---------------- */
const RegularBetCard = ({ bet, selection, onSelect, locked, showActual, confidence: propConfidence, onConfidenceChange, usedConfidences, showConfidenceOnly }: BetCardProps) => {
  const [isVibrating, setIsVibrating] = useState(false);

  const primaryA = Array.isArray(bet.optionA.teamColor) ? bet.optionA.teamColor[0] : bet.optionA.teamColor;
  const secondaryA = Array.isArray(bet.optionA.teamColorSecondary)
    ? bet.optionA.teamColorSecondary[0]
    : bet.optionA.teamColorSecondary;
  const primaryB = Array.isArray(bet.optionB.teamColor) ? bet.optionB.teamColor[0] : bet.optionB.teamColor;
  const secondaryB = Array.isArray(bet.optionB.teamColorSecondary)
    ? bet.optionB.teamColorSecondary[0]
    : bet.optionB.teamColorSecondary;

  const isDNP_A = showActual && (bet.optionA.projectedValue === null || bet.optionA.projectedValue === undefined || bet.optionA.projectedValue === 'null' || bet.optionA.projectedValue === '');
  const isDNP_B = showActual && (bet.optionB.projectedValue === null || bet.optionB.projectedValue === undefined || bet.optionB.projectedValue === 'null' || bet.optionB.projectedValue === '');
  const isTie = selection === 'T';

  // Always highlight user selection, even with DNP
  const isSelectedA = selection === 'A' || selection === 'T';
  const isSelectedB = selection === 'B' || selection === 'T';

  const handleConfidenceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (locked || !onConfidenceChange) return;

    const currentConf = propConfidence ?? null;
    const used = usedConfidences || new Set<number>();

    // Find next available confidence level
    if (currentConf === null) {
      // Try to set to 1, 2, or 3 (whichever is available first)
      if (!used.has(1)) {
        onConfidenceChange(1);
      } else if (!used.has(2)) {
        onConfidenceChange(2);
      } else if (!used.has(3)) {
        onConfidenceChange(3);
      } else {
        // All numbers are used, vibrate the button
        setIsVibrating(true);
        setTimeout(() => setIsVibrating(false), 300);
      }
    } else if (currentConf === 1) {
      if (!used.has(2)) {
        onConfidenceChange(2);
      } else if (!used.has(3)) {
        onConfidenceChange(3);
      } else {
        onConfidenceChange(null);
      }
    } else if (currentConf === 2) {
      if (!used.has(3)) {
        onConfidenceChange(3);
      } else {
        onConfidenceChange(null);
      }
    } else {
      // currentConf === 3
      onConfidenceChange(null);
    }
  };

  return (
    <div className="rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden" style={{ backgroundColor: 'transparent' }}>
      <div className="flex items-stretch relative w-full h-full min-h-[118px]">
        {/* LEFT */}
        <button
          disabled={locked}
          onClick={() => onSelect('A')}
          className="flex-1 p-2 sm:p-4 transition-all duration-200 relative"
          style={{
            boxSizing: 'border-box',
            backgroundColor: isSelectedA ? primaryA : 'white',
            borderLeft: `4px solid ${secondaryA}`,
            borderTop: `4px solid ${secondaryA}`,
            borderBottom: `4px solid ${secondaryA}`,
            borderRight: '2px solid #000000',
            borderTopLeftRadius: '0.5rem',
            borderBottomLeftRadius: '0.5rem',
            cursor: locked ? 'default' : 'pointer',
          }}
        >
          <div className="flex items-center h-full">
            <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2">
              {(() => {
                const IconComponent = getTeamIcon(bet.optionA.league);
                const iconSize = bet.optionA.league?.toUpperCase() === 'NHL' ? 'w-5 h-5 sm:w-7 sm:h-7' : 'w-6 h-6 sm:w-8 sm:h-8';
                return <IconComponent className={`${iconSize} flex-shrink-0`} style={{ color: isSelectedA ? secondaryA : primaryA }} />;
              })()}
            </div>
            <div className="flex-1 pl-8 sm:pl-11 min-w-0">
              <div className={`text-[10px] sm:text-xs font-semibold mb-0.5 truncate ${isSelectedA ? 'text-white text-opacity-80' : 'text-gray-500'}`}>
                {bet.optionA.market}
              </div>
              <div className={`font-bold text-sm sm:text-base mb-0.5 line-clamp-2 break-words ${isSelectedA ? 'text-white' : 'text-[#000814]'}`}>
                {bet.optionA.playerName}
              </div>
              {bet.optionA.teamAbbr && (
                <div className={`text-[10px] sm:text-xs font-medium truncate`} style={{ color: isSelectedA ? secondaryA : primaryA }}>
                  {bet.optionA.teamAbbr}
                </div>
              )}
              <div className={`text-[10px] sm:text-xs font-semibold mt-1 ${isSelectedA ? 'text-white text-opacity-90' : 'text-gray-600'}`}>
                {showActual ? 'Actual:' : 'Proj:'} {showActual && (bet.optionA.projectedValue === null || bet.optionA.projectedValue === undefined || bet.optionA.projectedValue === 'null' || bet.optionA.projectedValue === '') ? 'DNP' : bet.optionA.projectedValue}
              </div>
            </div>
          </div>
        </button>

        {/* RIGHT */}
        <button
          disabled={locked}
          onClick={() => onSelect('B')}
          className="flex-1 p-2 sm:p-4 transition-all duration-200 relative"
          style={{
            boxSizing: 'border-box',
            backgroundColor: isSelectedB ? primaryB : 'white',
            borderRight: `4px solid ${secondaryB}`,
            borderTop: `4px solid ${secondaryB}`,
            borderBottom: `4px solid ${secondaryB}`,
            borderLeft: '2px solid #000000',
            borderTopRightRadius: '0.5rem',
            borderBottomRightRadius: '0.5rem',
            cursor: locked ? 'default' : 'pointer',
          }}
        >
          <div className="flex items-center h-full">
            <div className="flex-1 pr-8 sm:pr-11 min-w-0">
              <div className={`text-[10px] sm:text-xs font-semibold mb-0.5 truncate ${isSelectedB ? 'text-white text-opacity-80' : 'text-gray-500'}`}>
                {bet.optionB.market}
              </div>
              <div className={`font-bold text-sm sm:text-base mb-0.5 line-clamp-2 break-words ${isSelectedB ? 'text-white' : 'text-[#000814]'}`}>
                {bet.optionB.playerName}
              </div>
              {bet.optionB.teamAbbr && (
                <div className={`text-[10px] sm:text-xs font-medium truncate`} style={{ color: isSelectedB ? secondaryB : primaryB }}>
                  {bet.optionB.teamAbbr}
                </div>
              )}
              <div className={`text-[10px] sm:text-xs font-semibold mt-1 ${isSelectedB ? 'text-white text-opacity-90' : 'text-gray-600'}`}>
                {showActual ? 'Actual:' : 'Proj:'} {showActual && (bet.optionB.projectedValue === null || bet.optionB.projectedValue === undefined || bet.optionB.projectedValue === 'null' || bet.optionB.projectedValue === '') ? 'DNP' : bet.optionB.projectedValue}
              </div>
            </div>
            <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2">
              {(() => {
                const IconComponent = getTeamIcon(bet.optionB.league);
                const iconSize = bet.optionB.league?.toUpperCase() === 'NHL' ? 'w-5 h-5 sm:w-7 sm:h-7' : 'w-6 h-6 sm:w-8 sm:h-8';
                return <IconComponent className={`${iconSize} flex-shrink-0`} style={{ color: isSelectedB ? secondaryB : primaryB }} />;
              })()}
            </div>
          </div>
        </button>

        {/* Middle divider */}
        <div className="absolute left-1/2 top-0 bottom-0 transform -translate-x-1/2 z-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 bg-black h-full" />
        </div>

        {/* Confidence button - appears on selected side */}
        {selection && selection !== 'T' && (!showConfidenceOnly || propConfidence) && (
          <button
            onClick={handleConfidenceClick}
            disabled={locked}
            className={`absolute z-30 w-5 h-5 rounded-full bg-white border-2 border-black flex items-center justify-center font-bold text-[10px] text-gray-900 hover:scale-110 transition-transform duration-200 disabled:cursor-not-allowed shadow-lg ${
              selection === 'A' ? 'left-2 top-2' : 'right-2 top-2'
            } ${isVibrating ? 'animate-[shake_0.3s_ease-in-out]' : ''}`}
          >
            {propConfidence ? propConfidence : <Hash className="w-4 h-4 text-gray-400" strokeWidth={2.5} />}
          </button>
        )}
      </div>
    </div>
  );
};

/* ---------------- Game Total Card ---------------- */
const GameTotalBetCard = ({ bet, selection, onSelect, locked, showActual, confidence: propConfidence, onConfidenceChange, usedConfidences, showConfidenceOnly }: BetCardProps) => {
  const [isVibrating, setIsVibrating] = useState(false);

  const primary1A = Array.isArray(bet.optionA.teamColor) ? bet.optionA.teamColor[0] : bet.optionA.teamColor;
  const primary2A = Array.isArray(bet.optionA.teamColor) && bet.optionA.teamColor[1] ? bet.optionA.teamColor[1] : primary1A;
  const secondary1A = Array.isArray(bet.optionA.teamColorSecondary)
    ? bet.optionA.teamColorSecondary[0]
    : bet.optionA.teamColorSecondary;
  const secondary2A =
    Array.isArray(bet.optionA.teamColorSecondary) && bet.optionA.teamColorSecondary[1]
      ? bet.optionA.teamColorSecondary[1]
      : secondary1A;

  const primary1B = Array.isArray(bet.optionB.teamColor) ? bet.optionB.teamColor[0] : bet.optionB.teamColor;
  const primary2B = Array.isArray(bet.optionB.teamColor) && bet.optionB.teamColor[1] ? bet.optionB.teamColor[1] : primary1B;
  const secondary1B = Array.isArray(bet.optionB.teamColorSecondary)
    ? bet.optionB.teamColorSecondary[0]
    : bet.optionB.teamColorSecondary;
  const secondary2B =
    Array.isArray(bet.optionB.teamColorSecondary) && bet.optionB.teamColorSecondary[1]
      ? bet.optionB.teamColorSecondary[1]
      : secondary1B;

  const isGameTotalMarket = (m: string) =>
    m?.toLowerCase().includes('total');

  const aIsGameTotal = isGameTotalMarket(bet.optionA.market);
  const bIsGameTotal = isGameTotalMarket(bet.optionB.market);

  const isDNP_A = showActual && (bet.optionA.projectedValue === null || bet.optionA.projectedValue === undefined || bet.optionA.projectedValue === 'null' || bet.optionA.projectedValue === '');
  const isDNP_B = showActual && (bet.optionB.projectedValue === null || bet.optionB.projectedValue === undefined || bet.optionB.projectedValue === 'null' || bet.optionB.projectedValue === '');
  const isTie = selection === 'T';

  // Always highlight user selection, even with DNP
  const selectedA = selection === 'A' || selection === 'T';
  const selectedB = selection === 'B' || selection === 'T';

  const handleConfidenceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (locked || !onConfidenceChange) return;

    const currentConf = propConfidence ?? null;
    const used = usedConfidences || new Set<number>();

    // Find next available confidence level
    if (currentConf === null) {
      // Try to set to 1, 2, or 3 (whichever is available first)
      if (!used.has(1)) {
        onConfidenceChange(1);
      } else if (!used.has(2)) {
        onConfidenceChange(2);
      } else if (!used.has(3)) {
        onConfidenceChange(3);
      } else {
        // All numbers are used, vibrate the button
        setIsVibrating(true);
        setTimeout(() => setIsVibrating(false), 300);
      }
    } else if (currentConf === 1) {
      if (!used.has(2)) {
        onConfidenceChange(2);
      } else if (!used.has(3)) {
        onConfidenceChange(3);
      } else {
        onConfidenceChange(null);
      }
    } else if (currentConf === 2) {
      if (!used.has(3)) {
        onConfidenceChange(3);
      } else {
        onConfidenceChange(null);
      }
    } else {
      // currentConf === 3
      onConfidenceChange(null);
    }
  };

  return (
    <div className="rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden" style={{ backgroundColor: 'transparent' }}>
      <div className="flex items-stretch relative w-full h-full min-h-[118px]">

        {/* LEFT SIDE */}
        {aIsGameTotal ? (
          <button
            disabled={locked}
            onClick={() => onSelect('A')}
            className="transition-all duration-200 relative rounded-l-lg overflow-hidden"
            style={{
              boxSizing: 'border-box',
              width: '50%',
              borderWidth: '4px 0 4px 4px',
              borderStyle: 'solid',
              borderColor: 'transparent',
              borderTopLeftRadius: '0.5rem',
              borderBottomLeftRadius: '0.5rem',
              background: `
                linear-gradient(white, white) padding-box,
                linear-gradient(90deg, ${secondary1A}, ${secondary2A}) border-box
              `,
              cursor: locked ? 'default' : 'pointer',
            }}
          >
            {/* Fade overlay */}
            <div
              className={`absolute inset-0 pointer-events-none transition-opacity duration-200 ${
                selectedA ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                background: Array.isArray(bet.optionA.teamColor)
                  ? `linear-gradient(90deg, ${primary1A}, ${primary2A})`
                  : primary1A,
                borderTopLeftRadius: 'calc(0.5rem - 4px)',
                borderBottomLeftRadius: 'calc(0.5rem - 4px)',
              }}
            />
            <div className="relative flex flex-col justify-center h-full px-2 py-2 sm:px-4 sm:py-4">
              {/* Top: Game Total Pts */}
              <div className={`text-[10px] sm:text-xs font-semibold text-center mb-0.5 ${selectedA ? 'text-white text-opacity-80' : 'text-gray-500'} transition-colors duration-200`}>
                {bet.optionA.market}
              </div>

              {/* Middle: Team matchup with icons - responsive layout */}
              <div className="flex items-center justify-between mb-0.5 gap-1">
                <div className="flex-shrink-0">
                  {(() => {
                    const IconComponent = getTeamIcon(bet.optionA.league);
                    const iconSize = bet.optionA.league?.toUpperCase() === 'NHL' ? 'w-5 h-5 sm:w-7 sm:h-7' : 'w-6 h-6 sm:w-8 sm:h-8';
                    return <IconComponent
                      className={`${iconSize} transition-colors duration-200`}
                      style={{ color: selectedA ? secondary1A : primary1A }}
                    />;
                  })()}
                </div>
                <div className="flex-1 text-center min-w-0">
                  {/* Mobile: 3 lines */}
                  <div className="md:hidden">
                    <div className={`font-bold text-xs sm:text-sm truncate ${selectedA ? 'text-white' : 'text-[#000814]'} transition-colors duration-200`}>
                      {bet.optionA.playerName.split(' vs ')[0]}
                    </div>
                    <div className={`font-bold text-[10px] sm:text-xs ${selectedA ? 'text-white' : 'text-[#000814]'} transition-colors duration-200`}>
                      vs
                    </div>
                    <div className={`font-bold text-xs sm:text-sm truncate ${selectedA ? 'text-white' : 'text-[#000814]'} transition-colors duration-200`}>
                      {bet.optionA.playerName.split(' vs ')[1]}
                    </div>
                  </div>
                  {/* Desktop: 1 line */}
                  <div className={`hidden md:block font-bold text-sm md:text-base ${selectedA ? 'text-white' : 'text-[#000814]'} transition-colors duration-200`}>
                    {bet.optionA.playerName.split(' vs ')[0]} <span className="text-xs md:text-sm">vs</span> {bet.optionA.playerName.split(' vs ')[1]}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {(() => {
                    const IconComponent = getTeamIcon(bet.optionA.league);
                    const iconSize = bet.optionA.league?.toUpperCase() === 'NHL' ? 'w-5 h-5 sm:w-7 sm:h-7' : 'w-6 h-6 sm:w-8 sm:h-8';
                    return <IconComponent
                      className={`${iconSize} transition-colors duration-200`}
                      style={{ color: selectedA ? secondary2A : primary2A }}
                    />;
                  })()}
                </div>
              </div>

              {/* Bottom: Proj value */}
              <div className={`text-[10px] sm:text-xs font-semibold text-center mt-1 ${selectedA ? 'text-white text-opacity-90' : 'text-gray-600'} transition-colors duration-200`}>
                {showActual ? 'Actual:' : 'Proj:'} {showActual && (bet.optionA.projectedValue === null || bet.optionA.projectedValue === undefined || bet.optionA.projectedValue === 'null' || bet.optionA.projectedValue === '') ? 'DNP' : bet.optionA.projectedValue}
              </div>
            </div>
          </button>
        ) : (
          <button
            disabled={locked}
            onClick={() => onSelect('A')}
            className="flex-1 p-2 sm:p-4 transition-all duration-200 relative"
            style={{
              boxSizing: 'border-box',
              backgroundColor: selectedA ? primary1A : 'white',
              borderLeft: `4px solid ${secondary1A}`,
              borderTop: `4px solid ${secondary1A}`,
              borderBottom: `4px solid ${secondary1A}`,
              borderRight: '2px solid #000000',
              borderTopLeftRadius: '0.5rem',
              borderBottomLeftRadius: '0.5rem',
              cursor: locked ? 'default' : 'pointer',
            }}
          >
            <div className="flex items-center h-full">
              <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2">
                {(() => {
                  const IconComponent = getTeamIcon(bet.optionA.league);
                  const iconSize = bet.optionA.league?.toUpperCase() === 'NHL' ? 'w-5 h-5 sm:w-7 sm:h-7' : 'w-6 h-6 sm:w-8 sm:h-8';
                  return <IconComponent className={`${iconSize} flex-shrink-0`} style={{ color: selectedA ? secondary1A : primary1A }} />;
                })()}
              </div>
              <div className="flex-1 pl-8 sm:pl-11 min-w-0">
                <div className={`text-[10px] sm:text-xs font-semibold mb-0.5 truncate ${selectedA ? 'text-white text-opacity-80' : 'text-gray-500'}`}>
                  {bet.optionA.market}
                </div>
                <div className={`font-bold text-sm sm:text-base mb-0.5 line-clamp-2 break-words ${selectedA ? 'text-white' : 'text-[#000814]'}`}>
                  {bet.optionA.playerName}
                </div>
                {bet.optionA.teamAbbr && (
                  <div className={`text-[10px] sm:text-xs font-medium truncate`} style={{ color: selectedA ? secondary1A : primary1A }}>
                    {bet.optionA.teamAbbr}
                  </div>
                )}
                <div className={`text-[10px] sm:text-xs font-semibold mt-1 ${selectedA ? 'text-white text-opacity-90' : 'text-gray-600'}`}>
                  {showActual ? 'Actual:' : 'Proj:'} {showActual && (bet.optionA.projectedValue === null || bet.optionA.projectedValue === undefined || bet.optionA.projectedValue === 'null' || bet.optionA.projectedValue === '') ? 'DNP' : bet.optionA.projectedValue}
                </div>
              </div>
            </div>
          </button>
        )}

        {/* RIGHT SIDE */}
        {bIsGameTotal ? (
          <button
            disabled={locked}
            onClick={() => onSelect('B')}
            className="transition-all duration-200 relative rounded-r-lg overflow-hidden"
            style={{
              boxSizing: 'border-box',
              width: '50%',
              borderWidth: '4px 4px 4px 0',
              borderStyle: 'solid',
              borderColor: 'transparent',
              borderTopRightRadius: '0.5rem',
              borderBottomRightRadius: '0.5rem',
              background: `
                linear-gradient(white, white) padding-box,
                linear-gradient(90deg, ${secondary1B}, ${secondary2B}) border-box
              `,
              cursor: locked ? 'default' : 'pointer',
            }}
          >
            <div
              className={`absolute inset-0 pointer-events-none transition-opacity duration-200 ${
                selectedB ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                background: Array.isArray(bet.optionB.teamColor)
                  ? `linear-gradient(90deg, ${primary1B}, ${primary2B})`
                  : primary1B,
                borderTopRightRadius: 'calc(0.5rem - 4px)',
                borderBottomRightRadius: 'calc(0.5rem - 4px)',
              }}
            />
            <div className="relative flex flex-col justify-center h-full px-2 py-2 sm:px-4 sm:py-4">
              {/* Top: Game Total Pts */}
              <div className={`text-[10px] sm:text-xs font-semibold text-center mb-0.5 ${selectedB ? 'text-white text-opacity-80' : 'text-gray-500'} transition-colors duration-200`}>
                {bet.optionB.market}
              </div>

              {/* Middle: Team matchup with icons - responsive layout */}
              <div className="flex items-center justify-between mb-0.5 gap-1">
                <div className="flex-shrink-0">
                  {(() => {
                    const IconComponent = getTeamIcon(bet.optionB.league);
                    const iconSize = bet.optionB.league?.toUpperCase() === 'NHL' ? 'w-5 h-5 sm:w-7 sm:h-7' : 'w-6 h-6 sm:w-8 sm:h-8';
                    return <IconComponent
                      className={`${iconSize} transition-colors duration-200`}
                      style={{ color: selectedB ? secondary1B : primary1B }}
                    />;
                  })()}
                </div>
                <div className="flex-1 text-center min-w-0">
                  {/* Mobile: 3 lines */}
                  <div className="md:hidden">
                    <div className={`font-bold text-xs sm:text-sm truncate ${selectedB ? 'text-white' : 'text-[#000814]'} transition-colors duration-200`}>
                      {bet.optionB.playerName.split(' vs ')[0]}
                    </div>
                    <div className={`font-bold text-[10px] sm:text-xs ${selectedB ? 'text-white' : 'text-[#000814]'} transition-colors duration-200`}>
                      vs
                    </div>
                    <div className={`font-bold text-xs sm:text-sm truncate ${selectedB ? 'text-white' : 'text-[#000814]'} transition-colors duration-200`}>
                      {bet.optionB.playerName.split(' vs ')[1]}
                    </div>
                  </div>
                  {/* Desktop: 1 line */}
                  <div className={`hidden md:block font-bold text-sm md:text-base ${selectedB ? 'text-white' : 'text-[#000814]'} transition-colors duration-200`}>
                    {bet.optionB.playerName.split(' vs ')[0]} <span className="text-xs md:text-sm">vs</span> {bet.optionB.playerName.split(' vs ')[1]}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {(() => {
                    const IconComponent = getTeamIcon(bet.optionB.league);
                    const iconSize = bet.optionB.league?.toUpperCase() === 'NHL' ? 'w-5 h-5 sm:w-7 sm:h-7' : 'w-6 h-6 sm:w-8 sm:h-8';
                    return <IconComponent
                      className={`${iconSize} transition-colors duration-200`}
                      style={{ color: selectedB ? secondary2B : primary2B }}
                    />;
                  })()}
                </div>
              </div>

              {/* Bottom: Proj value */}
              <div className={`text-[10px] sm:text-xs font-semibold text-center mt-1 ${selectedB ? 'text-white text-opacity-90' : 'text-gray-600'} transition-colors duration-200`}>
                {showActual ? 'Actual:' : 'Proj:'} {showActual && (bet.optionB.projectedValue === null || bet.optionB.projectedValue === undefined || bet.optionB.projectedValue === 'null' || bet.optionB.projectedValue === '') ? 'DNP' : bet.optionB.projectedValue}
              </div>
            </div>
          </button>
        ) : (
          <button
            disabled={locked}
            onClick={() => onSelect('B')}
            className="flex-1 p-2 sm:p-4 transition-all duration-200 relative"
            style={{
              boxSizing: 'border-box',
              backgroundColor: selectedB ? primary1B : 'white',
              borderRight: `4px solid ${secondary1B}`,
              borderTop: `4px solid ${secondary1B}`,
              borderBottom: `4px solid ${secondary1B}`,
              borderLeft: '2px solid #000000',
              borderTopRightRadius: '0.5rem',
              borderBottomRightRadius: '0.5rem',
              cursor: locked ? 'default' : 'pointer',
            }}
          >
            <div className="flex items-center h-full">
              <div className="flex-1 pr-8 sm:pr-11 min-w-0">
                <div className={`text-[10px] sm:text-xs font-semibold mb-0.5 truncate ${selectedB ? 'text-white text-opacity-80' : 'text-gray-500'}`}>
                  {bet.optionB.market}
                </div>
                <div className={`font-bold text-sm sm:text-base mb-0.5 line-clamp-2 break-words ${selectedB ? 'text-white' : 'text-[#000814]'}`}>
                  {bet.optionB.playerName}
                </div>
                {bet.optionB.teamAbbr && (
                  <div className={`text-[10px] sm:text-xs font-medium truncate`} style={{ color: selectedB ? secondary1B : primary1B }}>
                    {bet.optionB.teamAbbr}
                  </div>
                )}
                <div className={`text-[10px] sm:text-xs font-semibold mt-1 ${selectedB ? 'text-white text-opacity-90' : 'text-gray-600'}`}>
                  {showActual ? 'Actual:' : 'Proj:'} {showActual && (bet.optionB.projectedValue === null || bet.optionB.projectedValue === undefined || bet.optionB.projectedValue === 'null' || bet.optionB.projectedValue === '') ? 'DNP' : bet.optionB.projectedValue}
                </div>
              </div>
              <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2">
                {(() => {
                  const IconComponent = getTeamIcon(bet.optionB.league);
                  const iconSize = bet.optionB.league?.toUpperCase() === 'NHL' ? 'w-5 h-5 sm:w-7 sm:h-7' : 'w-6 h-6 sm:w-8 sm:h-8';
                  return <IconComponent className={`${iconSize} flex-shrink-0`} style={{ color: selectedB ? secondary1B : primary1B }} />;
                })()}
              </div>
            </div>
          </button>
        )}

        {/* Middle divider */}
        <div className="absolute left-1/2 top-0 bottom-0 transform -translate-x-1/2 z-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 bg-black h-full" />
        </div>

        {/* Confidence button - appears on selected side */}
        {selection && selection !== 'T' && (!showConfidenceOnly || propConfidence) && (
          <button
            onClick={handleConfidenceClick}
            disabled={locked}
            className={`absolute z-30 w-5 h-5 rounded-full bg-white border-2 border-black flex items-center justify-center font-bold text-[10px] text-gray-900 hover:scale-110 transition-transform duration-200 disabled:cursor-not-allowed shadow-lg ${
              selection === 'A' ? 'left-2 top-2' : 'right-2 top-2'
            } ${isVibrating ? 'animate-[shake_0.3s_ease-in-out]' : ''}`}
          >
            {propConfidence ? propConfidence : <Hash className="w-4 h-4 text-gray-400" strokeWidth={2.5} />}
          </button>
        )}
      </div>
    </div>
  );
};
