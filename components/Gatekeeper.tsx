
import React, { useState, useEffect, useCallback, useRef } from 'react';
// Fixed: Removed non-existent export GATEKEEPER_GAME_TYPE
import { GATEKEEPER_DURATION } from '../constants';
import { GatekeeperGameType } from '../types';

interface GatekeeperProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const Gatekeeper: React.FC<GatekeeperProps> = ({ onSuccess, onCancel }) => {
  const [gameType, setGameType] = useState<GatekeeperGameType | null>(null);
  const [timeLeft, setTimeLeft] = useState(GATEKEEPER_DURATION);
  const [isFailed, setIsFailed] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);

  // N-Back State
  const [nBackSequence, setNBackSequence] = useState<string[]>([]);
  const [nBackCurrent, setNBackCurrent] = useState<string | null>(null);
  const [nBackScore, setNBackScore] = useState({ hits: 0, misses: 0, falseAlarms: 0 });
  
  // Reaction State
  const [reactionState, setReactionState] = useState<'WAITING' | 'READY' | 'CLICKED'>('WAITING');
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const reactionTimerRef = useRef<number>(0);

  useEffect(() => {
    if (isGameStarted) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            checkFinalScore();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isGameStarted]);

  const checkFinalScore = () => {
    if (gameType === 'N_BACK') {
      const totalOpportunities = nBackSequence.length - 2; // for 2-back
      const accuracy = (nBackScore.hits / Math.max(1, totalOpportunities)) * 100;
      if (accuracy >= 70) onSuccess();
      else setIsFailed(true);
    } else if (gameType === 'REACTION') {
      const avgReaction = reactionTimes.length > 0 ? reactionTimes.reduce((a, b) => a + b) / reactionTimes.length : 1000;
      if (avgReaction <= 250 && reactionTimes.length >= 3) onSuccess();
      else setIsFailed(true);
    }
  };

  // --- N-BACK LOGIC ---
  useEffect(() => {
    if (gameType === 'N_BACK' && isGameStarted && timeLeft > 0) {
      const letters = "ABCDEFGH";
      const interval = setInterval(() => {
        const nextChar = letters[Math.floor(Math.random() * letters.length)];
        setNBackSequence(prev => [...prev, nextChar]);
        setNBackCurrent(nextChar);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [gameType, isGameStarted, timeLeft]);

  const handleNBackClick = () => {
    if (nBackSequence.length < 3) return;
    const current = nBackSequence[nBackSequence.length - 1];
    const target = nBackSequence[nBackSequence.length - 3]; // 2-back
    if (current === target) {
      setNBackScore(prev => ({ ...prev, hits: prev.hits + 1 }));
    } else {
      setNBackScore(prev => ({ ...prev, falseAlarms: prev.falseAlarms + 1 }));
    }
  };

  // --- REACTION LOGIC ---
  const startReactionRound = useCallback(() => {
    setReactionState('WAITING');
    const delay = 1000 + Math.random() * 3000;
    setTimeout(() => {
      setReactionState('READY');
      reactionTimerRef.current = performance.now();
    }, delay);
  }, []);

  useEffect(() => {
    if (gameType === 'REACTION' && isGameStarted) {
      startReactionRound();
    }
  }, [gameType, isGameStarted, startReactionRound]);

  const handleReactionClick = () => {
    if (reactionState === 'READY') {
      const delta = performance.now() - reactionTimerRef.current;
      setReactionTimes(prev => [...prev, delta]);
      setReactionState('CLICKED');
      setTimeout(startReactionRound, 1000);
    } else if (reactionState === 'WAITING') {
      alert("TOO EARLY! Wait for GREEN.");
      startReactionRound();
    }
  };

  if (!gameType) {
    return (
      <div className="fixed inset-0 bg-black/98 z-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-4xl font-black mb-12 tracking-tighter uppercase italic text-cyan-500">Select Calibration Protocol</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
          <button 
            onClick={() => { setGameType('N_BACK'); setIsGameStarted(true); }}
            className="group p-8 border border-zinc-800 bg-zinc-900/50 hover:border-cyan-500 transition-all text-left"
          >
            <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400">N-Back Memory</h3>
            <p className="text-xs text-zinc-500 uppercase tracking-widest leading-relaxed">
              Match current stimuli with stimuli 2 steps back. 
              Threshold: 70% Accuracy.
            </p>
          </button>
          <button 
            onClick={() => { setGameType('REACTION'); setIsGameStarted(true); }}
            className="group p-8 border border-zinc-800 bg-zinc-900/50 hover:border-emerald-500 transition-all text-left"
          >
            <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-400">Neural Response</h3>
            <p className="text-xs text-zinc-500 uppercase tracking-widest leading-relaxed">
              Click instantly upon visual signal.
              Threshold: &lt; 250ms Average.
            </p>
          </button>
        </div>
        <button onClick={onCancel} className="mt-12 text-zinc-600 hover:text-white uppercase text-[10px] mono tracking-widest">[ ESC ] CANCEL UPLINK</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex justify-between items-end border-b border-zinc-800 pb-4">
          <div className="text-left">
            <h2 className="text-xl font-black uppercase text-cyan-500">{gameType.replace('_', ' ')}</h2>
            <div className="text-[10px] mono text-zinc-500">PROTOCOL: ACTIVE_CALIBRATION</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black mono text-zinc-300">{timeLeft}s</div>
            <div className="text-[10px] mono text-zinc-500 uppercase">Neural Lock</div>
          </div>
        </div>

        {isFailed ? (
          <div className="py-12 animate-in fade-in zoom-in">
            <h2 className="text-3xl font-bold text-red-500 mb-4">CALIBRATION FAILED</h2>
            <p className="text-zinc-400 mb-8 text-sm">Focus levels insufficient for deep work sequence.</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 border border-zinc-700 hover:border-white uppercase text-xs mono">RETRY_SESSION</button>
          </div>
        ) : (
          <div className="min-h-[300px] flex items-center justify-center">
            {gameType === 'N_BACK' && (
              <div className="w-full">
                <div className="text-8xl font-black mb-12 text-white animate-in zoom-in duration-300">{nBackCurrent}</div>
                <button 
                  onMouseDown={handleNBackClick}
                  className="w-full py-6 border-2 border-cyan-500 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-bold uppercase tracking-widest active:scale-95 transition-all"
                >
                  MATCH (2-BACK)
                </button>
                <div className="mt-8 text-[10px] mono text-zinc-500 uppercase flex justify-center gap-6">
                  <span>HITS: {nBackScore.hits}</span>
                  <span>FA: {nBackScore.falseAlarms}</span>
                </div>
              </div>
            )}

            {gameType === 'REACTION' && (
              <div 
                onClick={handleReactionClick}
                className={`w-full aspect-square flex items-center justify-center cursor-pointer transition-colors duration-100 rounded-lg border-2
                  ${reactionState === 'WAITING' ? 'bg-zinc-900 border-zinc-800 text-zinc-500' : ''}
                  ${reactionState === 'READY' ? 'bg-emerald-500 border-emerald-400 text-black shadow-[0_0_50px_rgba(16,185,129,0.3)]' : ''}
                  ${reactionState === 'CLICKED' ? 'bg-zinc-800 border-zinc-700 text-white' : ''}
                `}
              >
                <span className="font-bold text-xl uppercase tracking-widest">
                  {reactionState === 'WAITING' ? 'WAIT FOR GREEN' : ''}
                  {reactionState === 'READY' ? 'CLICK NOW!!' : ''}
                  {reactionState === 'CLICKED' ? (reactionTimes[reactionTimes.length - 1]?.toFixed(0) + 'ms') : ''}
                </span>
              </div>
            )}
          </div>
        )}

        <p className="mt-12 text-[10px] text-zinc-600 uppercase tracking-widest leading-relaxed px-4">
          Biological confirmation required. Maintain cognitive state above threshold for {GATEKEEPER_DURATION} seconds.
        </p>
      </div>
    </div>
  );
};

export default Gatekeeper;
