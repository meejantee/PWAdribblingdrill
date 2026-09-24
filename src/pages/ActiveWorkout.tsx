import React, { useState, useEffect, useRef } from 'react';
import workoutsData from '../data/workouts.json';
import { playCountdown, playTransition, unlockAudio } from '../utils/audio';
import { Play, Pause, SkipForward, Square, CheckCircle } from 'lucide-react';
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
    setCurrentDrillIndex(prev => {
      if (prev < phase.drills.length - 1) {
        setTimeLeft(phase.drills[prev + 1].durationSeconds);
        endTimeRef.current = null; // Reset for next drill
        return prev + 1;
      }
      setIsPlaying(false);
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
    <div className="min-h-screen bg-transparent text-zinc-100 flex flex-col max-w-md mx-auto">
      {/* Top Bar */}
      <div className="p-4 flex items-center justify-between border-b border-zinc-900 bg-zinc-800/80 sticky top-0 backdrop-blur-md z-10">
        <div className="text-sm font-semibold text-zinc-400 truncate pr-4">{phase.name}</div>
        <div className="flex items-center gap-2">
          {mode === 'standing' ? (
            <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-emerald-500/20 text-emerald-400">
              Standing Mode
            </span>
          ) : (
            <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-blue-500/20 text-blue-400">
              Seated Mode
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        
        {/* Progress Bar */}
        <div className="w-full h-1 bg-zinc-800 rounded-full mb-8 overflow-hidden">
          <div className="h-full bg-indigo-500 transition-all duration-1000 ease-linear" style={{ width: `${progressPercent}%` }} />
        </div>

        {/* Focus Mode Indicator */}
        <div className="flex justify-center mb-6">
          <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
            currentDrill.focusMode === 'FULL_FOCUS' 
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
              : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
          }`}>
            {currentDrill.focusMode === 'FULL_FOCUS' ? 'Full Visual Focus' : 'iPad / Media Permitted'}
          </div>
        </div>

        {/* Timer */}
        <div className="flex flex-col items-center justify-center flex-1 min-h-[200px] mb-8">
          <div className="text-[6rem] font-black tracking-tighter leading-none tabular-nums text-white">
            {formatTime(timeLeft)}
          </div>
          <div className="text-xl text-zinc-400 mt-2 font-medium text-center">
            {currentDrill.name}
          </div>
        </div>

        {/* Cues */}
        <div className="bg-zinc-900 rounded-2xl p-5 mb-8 border border-zinc-800 shadow-xl">
          <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-3">Posture & Cues</h3>
          <ul className="space-y-3 text-sm text-zinc-300">
            <li className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-indigo-400 shrink-0" />
              <span>{postureCues.general}</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-indigo-400 shrink-0" />
              <span>{postureCues.ballContact}</span>
            </li>
          </ul>
        </div>

        {/* Next Drill */}
        {nextDrill && (
          <div className="text-center text-zinc-500 text-sm mb-6 font-medium">
            Next: {nextDrill.name} ({formatTime(nextDrill.durationSeconds)})
          </div>
        )}
      </div>

      {/* Controls - Fixed at Bottom */}
      <div className="p-6 pb-8 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent sticky bottom-0">
        <div className="flex items-center justify-center gap-4">
          <Button 
            variant="ghost" 
            size="lg"
            className="w-16 h-16 rounded-full border border-zinc-800 text-zinc-400"
            onClick={() => onEndWorkout(false)}
          >
            <Square className="w-6 h-6" fill="currentColor" />
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
            className="w-16 h-16 rounded-full border border-zinc-800 text-zinc-400"
            onClick={skipDrill}
            disabled={currentDrillIndex >= phase.drills.length - 1}
          >
            <SkipForward className="w-6 h-6" fill="currentColor" />
          </Button>
        </div>
      </div>
    </div>
  );
};
