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
        setIsPlaying(false); // Pause automatically before next drill starts
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


  const skipDrillForward = () => {
    handleDrillComplete();
  };

  const skipDrillBackward = () => {
    if (currentDrillIndex > 0) {
      setCurrentDrillIndex(prev => {
        setTimeLeft(phase.drills[prev - 1].durationSeconds);
        endTimeRef.current = null;
        setIsPlaying(false);
        return prev - 1;
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
    <div className="h-[100dvh] bg-zinc-950 text-zinc-100 flex flex-col max-w-md mx-auto overflow-hidden">
      {/* Top Bar */}
      <div className="p-4 flex items-center justify-between border-b border-zinc-900 bg-zinc-950/80 z-10 shrink-0">
        <div className="text-sm font-semibold text-zinc-400 truncate pr-4">{phase.name}</div>
        <div className="flex items-center gap-3">
          {mode === 'standing' ? (
            <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-emerald-500/20 text-emerald-400">
              Standing
            </span>
          ) : (
            <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-blue-500/20 text-blue-400">
              Seated
            </span>
          )}
          <button onClick={() => onEndWorkout(false)} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-zinc-800 shrink-0">
        <div className="h-full bg-indigo-500 transition-all duration-1000 ease-linear" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        
        {/* Drill Counter & Focus Mode */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
            Drill {currentDrillIndex + 1} of {phase.drills.length}
          </div>
          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            currentDrill.focusMode === 'FULL_FOCUS' 
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
              : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
          }`}>
            {currentDrill.focusMode === 'FULL_FOCUS' ? 'Full Focus' : 'Media OK'}
          </div>
        </div>

        {/* Timer section */}
        <div className="flex flex-col items-center justify-center flex-1 min-h-0">
          <div className="text-[5.5rem] font-black tracking-tighter leading-none tabular-nums text-white my-2">
            {formatTime(timeLeft)}
          </div>
          
          <div className="flex items-center justify-center gap-3 mt-4 w-full">
            <h2 className="text-2xl text-zinc-200 font-bold text-center truncate px-2">
              {currentDrill.name}
            </h2>
            <button 
              onClick={() => setShowInfoModal(true)}
              className="text-zinc-500 hover:text-indigo-400 transition-colors shrink-0 p-1"
            >
              <Info className="w-6 h-6" />
            </button>
          </div>
          
          {/* Status badge when paused */}
          {!isPlaying && timeLeft === currentDrill.durationSeconds && (
            <div className="mt-4 px-4 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-full text-sm font-semibold animate-pulse">
              Press Play to Start
            </div>
          )}
        </div>
      </div>

      {/* Controls - Fixed at Bottom */}
      <div className="p-6 pb-8 shrink-0 border-t border-zinc-900 bg-zinc-950">
        <div className="flex items-center justify-center gap-6">
          <Button 
            variant="ghost" 
            size="lg"
            className="w-14 h-14 rounded-full bg-zinc-800 text-zinc-100 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-600 border border-zinc-700 disabled:border-zinc-800 transition-colors"
            onClick={skipDrillBackward}
            disabled={currentDrillIndex === 0}
          >
            <SkipBack className="w-6 h-6" />
          </Button>

          <Button 
            variant="primary" 
            size="lg"
            className="w-20 h-20 rounded-full text-zinc-950 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:scale-105 transition-transform"
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
            className="w-14 h-14 rounded-full bg-zinc-800 text-zinc-100 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-600 border border-zinc-700 disabled:border-zinc-800 transition-colors"
            onClick={skipDrillForward}
            disabled={currentDrillIndex >= phase.drills.length - 1}
          >
            <SkipForward className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-zinc-100">{currentDrill.name}</h3>
              <button onClick={() => setShowInfoModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-xs uppercase tracking-widest text-indigo-400 font-bold mb-2">Drill Cues</h4>
                <ul className="space-y-2 text-sm text-zinc-300">
                  {currentDrill.cues?.map((cue, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-indigo-500 shrink-0">•</span>
                      <span>{cue}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-2">Posture Context</h4>
                <ul className="space-y-2 text-sm text-zinc-300">
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500/70 shrink-0 mt-0.5" />
                    <span>{postureCues.general}</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500/70 shrink-0 mt-0.5" />
                    <span>{postureCues.ballContact}</span>
                  </li>
                </ul>
              </div>
            </div>

            <Button 
              className="w-full mt-8" 
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
