import React, { useState, useEffect, useRef } from 'react';
import workoutsData from '../data/workouts.json';
import { playCountdown, playTransition, unlockAudio } from '../utils/audio';
import { Play, Pause, SkipForward, SkipBack, X, CheckCircle, Info } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface ActiveWorkoutProps {
  phaseId: string;
  mode: 'standing' | 'seated';
  onEndWorkout: (completed: boolean) => void;
}

export const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({ phaseId, mode, onEndWorkout }) => {
  const phase = workoutsData.phases.find(p => p.id === phaseId)!;
  
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  // Time remaining in current drill (seconds)
  const [timeLeft, setTimeLeft] = useState(phase.drills[0].durationSeconds);
  
  // For drift-free calculation
  const endTimeRef = useRef<number | null>(null);
  const requestRef = useRef<number>(0);
  
  // Wake lock reference
  const wakeLockRef = useRef<any>(null);

  const currentDrill = phase.drills[currentDrillIndex];
  const nextDrill = phase.drills[currentDrillIndex + 1];

  const postureCues = workoutsData.postureCues[mode];

  // Wake lock management
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        console.warn('Wake Lock error:', err);
      }
    };

    if (isPlaying) {
      requestWakeLock();
    } else if (wakeLockRef.current) {
      wakeLockRef.current.release().then(() => {
        wakeLockRef.current = null;
      });
    }

    return () => {
      if (wakeLockRef.current) wakeLockRef.current.release();
    };
  }, [isPlaying]);

  // Audio unlock on mount
  useEffect(() => {
    unlockAudio();
  }, []);

  const handleDrillComplete = React.useCallback(() => {
    setIsPlaying(false); // Pause when completing a drill
    setCurrentDrillIndex(prev => {
      if (prev < phase.drills.length - 1) {
        setTimeLeft(phase.drills[prev + 1].durationSeconds);
        endTimeRef.current = null; // Reset for next drill
        return prev + 1;
      }
      onEndWorkout(true);
      return prev;
    });
  }, [phase.drills, onEndWorkout]);

  // Timer logic
  useEffect(() => {
    if (!isPlaying) {
      endTimeRef.current = null;
      cancelAnimationFrame(requestRef.current);
      return;
    }

    if (endTimeRef.current === null) {
      endTimeRef.current = Date.now() + timeLeft * 1000;
    }

    const tick = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endTimeRef.current! - now) / 1000));

      if (remaining !== timeLeft) {
        setTimeLeft(remaining);
        
        // Audio cues
        if (remaining > 0 && remaining <= 3) {
          playCountdown();
        } else if (remaining === 0) {
          playTransition();
        }
      }

      if (remaining > 0) {
        requestRef.current = requestAnimationFrame(tick);
      } else {
        handleDrillComplete();
      }
    };

    requestRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, timeLeft, handleDrillComplete]);


  const skipDrill = () => {
    handleDrillComplete();
  };

  const skipBackward = () => {
    if (currentDrillIndex > 0) {
      setIsPlaying(false);
      setCurrentDrillIndex(prev => {
        const newIdx = prev - 1;
        setTimeLeft(phase.drills[newIdx].durationSeconds);
        endTimeRef.current = null;
        return newIdx;
      });
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate overall progress
  const totalDuration = phase.totalDurationSeconds;
  const elapsedInPrevious = phase.drills.slice(0, currentDrillIndex).reduce((sum, d) => sum + d.durationSeconds, 0);
  const totalElapsed = elapsedInPrevious + (currentDrill.durationSeconds - timeLeft);
  const progressPercent = (totalElapsed / totalDuration) * 100;

  return (
    <div className="min-h-[100dvh] max-h-[100dvh] bg-transparent text-zinc-100 flex flex-col max-w-md mx-auto overflow-hidden relative">
      {/* Top Bar */}
      <div className="p-4 flex items-center justify-between border-b border-zinc-900 bg-zinc-800/80 z-10 shrink-0">
        <div className="flex flex-col">
          <div className="text-sm font-semibold text-zinc-400 truncate pr-4">{phase.name}</div>
          <div className="text-xs text-zinc-500">Drill {currentDrillIndex + 1} of {phase.drills.length}</div>
        </div>
        <div className="flex items-center gap-3">
          {mode === 'standing' ? (
            <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-emerald-500/20 text-emerald-400 hidden sm:inline-block">
              Standing
            </span>
          ) : (
            <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-blue-500/20 text-blue-400 hidden sm:inline-block">
              Seated
            </span>
          )}
          <button onClick={() => onEndWorkout(false)} className="text-zinc-400 hover:text-zinc-100 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden">
        
        {/* Progress Bar */}
        <div className="w-full h-1 bg-zinc-800 rounded-full mb-4 shrink-0 overflow-hidden">
          <div className="h-full bg-indigo-500 transition-all duration-1000 ease-linear" style={{ width: `${progressPercent}%` }} />
        </div>

        {/* Focus Mode Indicator */}
        <div className="flex justify-center mb-4 shrink-0">
          <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
            currentDrill.focusMode === 'FULL_FOCUS' 
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
              : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
          }`}>
            {currentDrill.focusMode === 'FULL_FOCUS' ? 'Full Visual Focus' : 'iPad / Media Permitted'}
          </div>
        </div>

        {/* Timer */}
        <div className="flex flex-col items-center justify-center flex-1 min-h-[150px] mb-4">
          <div className="text-[5rem] sm:text-[6rem] font-black tracking-tighter leading-none tabular-nums text-white">
            {formatTime(timeLeft)}
          </div>
          <div className="text-lg sm:text-xl text-zinc-400 mt-2 font-medium text-center flex items-center justify-center gap-2">
            {currentDrill.name}
            <button
              onClick={() => setShowInfoModal(true)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cues */}
        <div className="bg-zinc-900 rounded-2xl p-4 mb-4 border border-zinc-800 shadow-xl shrink-0">
          <h3 className="text-[10px] sm:text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2">Posture & Cues</h3>
          <ul className="space-y-2 text-xs sm:text-sm text-zinc-300">
            <li className="flex gap-2">
              <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{postureCues.general}</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{postureCues.ballContact}</span>
            </li>
          </ul>
        </div>

        {/* Next Drill */}
        <div className="text-center text-zinc-500 text-xs sm:text-sm mb-2 font-medium h-5 shrink-0">
          {nextDrill ? `Next: ${nextDrill.name} (${formatTime(nextDrill.durationSeconds)})` : 'Final Drill'}
        </div>
      </div>

      {/* Controls - Fixed at Bottom */}
      <div className="p-4 pb-6 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent shrink-0">
        <div className="flex items-center justify-center gap-4">
          <Button 
            variant="ghost" 
            size="lg"
            className="w-16 h-16 rounded-full border border-zinc-800 text-zinc-400 disabled:opacity-30 disabled:border-zinc-800/50"
            onClick={skipBackward}
            disabled={currentDrillIndex === 0}
          >
            <SkipBack className="w-6 h-6" fill="currentColor" />
          </Button>

          <Button 
            variant="primary" 
            size="lg"
            className="w-20 h-20 rounded-full text-zinc-950 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
            onClick={() => {
              unlockAudio();
              setIsPlaying(!isPlaying);
            }}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" fill="currentColor" />
            ) : (
              <Play className="w-8 h-8 ml-1" fill="currentColor" />
            )}
          </Button>

          <Button 
            variant="ghost" 
            size="lg"
            className="w-16 h-16 rounded-full border border-zinc-800 text-zinc-400 disabled:opacity-30 disabled:border-zinc-800/50"
            onClick={skipDrill}
            disabled={currentDrillIndex >= phase.drills.length - 1}
          >
            <SkipForward className="w-6 h-6" fill="currentColor" />
          </Button>
        </div>
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-sm w-full shadow-2xl flex flex-col max-h-[90vh]">
            <h3 className="text-xl font-bold text-white mb-2 shrink-0">{currentDrill.name}</h3>
            <div className="overflow-y-auto pr-2 mb-6 text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
              {(currentDrill as any).description || "No description provided for this drill."}
            </div>
            <Button
              className="w-full"
              variant="primary"
              onClick={() => setShowInfoModal(false)}
            >
              Got it
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
