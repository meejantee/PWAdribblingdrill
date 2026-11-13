import React, { useState, useEffect, useRef } from 'react';
import workoutsData from '../data/workouts.json';
import type { StrengthExercise } from '../data/types';
import { playCountdown, playTransition, unlockAudio } from '../utils/audio';
import { useWakeLock } from '../hooks/useWakeLock';
import { ExerciseAnimation } from '../components/ExerciseAnimation';
import { Play, Pause, SkipForward, SkipBack, X, CheckCircle, Info, Dumbbell, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface ActiveWorkoutProps {
  phaseId: string;
  exerciseIds: string[];
  onEndWorkout: (completed: boolean) => void;
}

export const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({
  phaseId,
  exerciseIds,
  onEndWorkout
}) => {
  // Always keep screen active while workout page is open, even during untimed sets
  useWakeLock(true);

  const phase = workoutsData.phases.find(p => p.id === phaseId) || workoutsData.phases[0];
  const exercises: StrengthExercise[] = exerciseIds
    .map(id => (workoutsData.exerciseLibrary as Record<string, StrengthExercise>)[id])
    .filter(Boolean);

  // Stage: 'dribbling' -> 'strength'
  const [stage, setStage] = useState<'dribbling' | 'strength'>('dribbling');

  // --- STAGE 1: DRIBBLING STATE ---
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(phase.drills[0].durationSeconds);

  // --- STAGE 2: STRENGTH STACK STATE ---
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);

  const endTimeRef = useRef<number | null>(null);
  const requestRef = useRef<number>(0);

  const currentDrill = phase.drills[currentDrillIndex];
  const nextDrill = phase.drills[currentDrillIndex + 1];
  const currentExercise = exercises[currentExIndex];
  const standingCues = workoutsData.postureCues.standing;

  // Audio unlock on mount
  useEffect(() => {
    unlockAudio();
  }, []);

  const handleDrillComplete = React.useCallback(() => {
    setIsPlaying(false);
    setCurrentDrillIndex(prev => {
      if (prev < phase.drills.length - 1) {
        setTimeLeft(phase.drills[prev + 1].durationSeconds);
        endTimeRef.current = null;
        return prev + 1;
      }
      // All dribbling drills finished! Transition to Stage 2 if strength exercises exist
      if (exercises.length > 0) {
        playTransition();
        setStage('strength');
      } else {
        onEndWorkout(true);
      }
      return prev;
    });
  }, [phase.drills, exercises.length, onEndWorkout]);

  // Stage 1 Dribbling Timer
  useEffect(() => {
    if (stage !== 'dribbling' || !isPlaying) {
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
  }, [stage, isPlaying, timeLeft, handleDrillComplete]);

  // Stage 2 Strength Rest Timer
  useEffect(() => {
    if (stage !== 'strength' || !isResting) return;

    const interval = setInterval(() => {
      setRestTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          playTransition();
          setIsResting(false);
          return 0;
        }
        if (prev <= 4) {
          playCountdown();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stage, isResting]);

  const handleCompleteSet = () => {
    unlockAudio();
    if (currentSet < currentExercise.sets) {
      setCurrentSet(prev => prev + 1);
      setRestTimeLeft(currentExercise.restSeconds);
      setIsResting(true);
    } else if (currentExIndex < exercises.length - 1) {
      setCurrentExIndex(prev => prev + 1);
      setCurrentSet(1);
      setRestTimeLeft(currentExercise.restSeconds);
      setIsResting(true);
    } else {
      playTransition();
      onEndWorkout(true);
    }
  };

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

  // --- RENDER STAGE 2: STRENGTH & SPINE STACK ---
  if (stage === 'strength' && currentExercise) {
    const progressPercent = ((currentExIndex + (currentSet - 1) / currentExercise.sets) / exercises.length) * 100;

    return (
      <div className="min-h-[100dvh] max-h-[100dvh] bg-transparent text-zinc-100 flex flex-col max-w-md mx-auto overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-zinc-900 bg-zinc-800/80 shrink-0">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
            <Dumbbell className="w-4 h-4" />
            <span>Stage 2: Strength & Spine Stack</span>
          </div>
          <button onClick={() => onEndWorkout(false)} className="text-zinc-400 hover:text-zinc-100 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-full h-1 bg-zinc-800 shrink-0">
          <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>

        <div className="flex-1 flex flex-col p-5 justify-between overflow-y-auto">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                Exercise {currentExIndex + 1} of {exercises.length}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {currentExercise.category}
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <h2 className="text-xl font-extrabold text-white">{currentExercise.name}</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs font-semibold text-indigo-300">
                Target: {currentExercise.reps}
              </div>
            </div>

            {/* Looping Movement Demonstration GIF / Visual */}
            <ExerciseAnimation
              exerciseId={currentExercise.id}
              gifUrl={currentExercise.gifUrl}
              isComplete={isResting}
            />

            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 space-y-2">
              <h4 className="text-[11px] uppercase tracking-widest text-zinc-400 font-bold">Form & Spine Safety Cues</h4>
              {currentExercise.cues.map((cue, idx) => (
                <div key={idx} className="flex gap-2 text-xs text-zinc-200 leading-snug">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{cue}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="my-4 text-center">
            {isResting ? (
              <div className="bg-indigo-950/40 border border-indigo-500/40 rounded-2xl p-4">
                <div className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-1">
                  Rest Before Next Set
                </div>
                <div className="text-5xl font-black tabular-nums text-white my-1">
                  {formatTime(restTimeLeft)}
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-1"
                  onClick={() => setIsResting(false)}
                >
                  Skip Rest
                </Button>
              </div>
            ) : (
              <div className="py-2">
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-0.5">
                  Current Set
                </div>
                <div className="text-4xl font-black text-white">
                  Set {currentSet} <span className="text-zinc-600 text-2xl">/ {currentExercise.sets}</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-1 shrink-0">
            <Button
              size="lg"
              variant="primary"
              disabled={isResting}
              className="w-full font-bold gap-2 h-14 text-base"
              onClick={handleCompleteSet}
            >
              <Check className="w-5 h-5" />
              {currentSet < currentExercise.sets
                ? `Complete Set ${currentSet} (Start ${currentExercise.restSeconds}s Rest)`
                : currentExIndex < exercises.length - 1
                ? 'Finish Exercise & Next'
                : 'Finish Workout & Claim Streak 🔥'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER STAGE 1: DRIBBLING TIMER ---
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
        <button onClick={() => onEndWorkout(false)} className="text-zinc-400 hover:text-zinc-100 p-1">
          <X className="w-5 h-5" />
        </button>
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
            {currentDrill.focusMode === 'FULL_FOCUS' ? 'Full Focus' : 'Media OK'}
          </div>
        </div>

        {/* Timer */}
        <div className="flex flex-col items-center justify-center flex-1 min-h-[200px] mb-4">
          <div className="text-[5rem] sm:text-[7rem] font-black tracking-tighter leading-none tabular-nums text-white">
            {formatTime(timeLeft)}
          </div>
          <div className="text-xl sm:text-2xl text-zinc-300 mt-4 font-medium text-center">
            {currentDrill.name}
          </div>
          
          {!isPlaying && timeLeft === currentDrill.durationSeconds && (
            <div className="mt-4 px-4 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-full text-sm font-semibold animate-pulse">
              Press Play to Start
            </div>
          )}

          {exercises.length > 0 && (
            <div className="mt-4 text-xs text-zinc-500">
              Up Next: {exercises.length} Strength & Spine exercises
            </div>
          )}
        </div>

        {/* Info Button */}
        <div className="flex justify-center mb-8 shrink-0">
          <Button
            variant="secondary"
            className="flex items-center gap-2 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300"
            onClick={() => setShowInfoModal(true)}
          >
            <Info className="w-5 h-5" />
            <span>How to do this drill</span>
          </Button>
        </div>

        {/* Next Drill */}
        <div className="text-center text-zinc-500 text-xs sm:text-sm mb-2 font-medium h-5 shrink-0">
          {nextDrill
            ? `Next: ${nextDrill.name} (${formatTime(nextDrill.durationSeconds)})`
            : exercises.length > 0
            ? 'Final Drill → Stage 2 Strength Stack'
            : 'Final Drill'}
        </div>
      </div>

      {/* Controls - Fixed at Bottom */}
      <div className="p-4 pb-6 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent shrink-0">
        <div className="flex items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-1">
            <button
              className="w-14 h-14 rounded-full bg-zinc-800/80 border border-zinc-700 text-zinc-200 hover:bg-zinc-700 disabled:opacity-30 disabled:bg-zinc-900 flex items-center justify-center transition-colors"
              onClick={skipBackward}
              disabled={currentDrillIndex === 0}
            >
              <SkipBack className="w-6 h-6" />
            </button>
            <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Prev</span>
          </div>

          <button
            className="w-20 h-20 rounded-full bg-zinc-100 text-zinc-900 shadow-[0_0_40px_rgba(255,255,255,0.1)] mb-4 flex items-center justify-center hover:bg-white transition-colors"
            onClick={() => {
              unlockAudio();
              setIsPlaying(!isPlaying);
            }}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-zinc-900 fill-zinc-900" />
            ) : (
              <Play className="w-8 h-8 ml-1 text-zinc-900 fill-zinc-900" />
            )}
          </button>

          <div className="flex flex-col items-center gap-1">
            <button
              className="w-14 h-14 rounded-full bg-zinc-800/80 border border-zinc-700 text-zinc-200 hover:bg-zinc-700 disabled:opacity-30 disabled:bg-zinc-900 flex items-center justify-center transition-colors"
              onClick={skipDrill}
            >
              <SkipForward className="w-6 h-6" />
            </button>
            <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Next</span>
          </div>
        </div>
      </div>

      {/* Info Modal (Standing Athletic Stance Only) */}
      {showInfoModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-sm w-full shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 rounded-lg mb-4 shrink-0 bg-emerald-500/10 border border-emerald-500/20">
              <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-2">
                {standingCues.title}
              </h4>
              <p className="text-xs text-zinc-300 mb-1"><strong>Posture:</strong> {standingCues.general}</p>
              <p className="text-xs text-zinc-300"><strong>Action:</strong> {standingCues.ballContact}</p>
            </div>

            <div className="flex items-center gap-2 mb-3 shrink-0 flex-wrap">
              <h3 className="text-xl font-bold text-white">{currentDrill.name}</h3>

              {/* Hand Assignment Badge */}
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${
                (currentDrill as any).handAssignment === 'LEFT_ONLY' ? 'bg-purple-500/20 text-purple-400' :
                (currentDrill as any).handAssignment === 'RIGHT_ONLY' ? 'bg-emerald-500/20 text-emerald-400' :
                (currentDrill as any).handAssignment === 'SPLIT_HALFWAY' ? 'bg-amber-500/20 text-amber-400' :
                'bg-slate-500/20 text-slate-400'
              }`}>
                {(currentDrill as any).handAssignment === 'LEFT_ONLY' ? 'Left Hand Only' :
                 (currentDrill as any).handAssignment === 'RIGHT_ONLY' ? 'Right Hand Only' :
                 (currentDrill as any).handAssignment === 'SPLIT_HALFWAY' ? 'Switch Hand at 50%' :
                 'Both Hands'}
              </span>
            </div>

            <div className="overflow-y-auto pr-2 mb-6 text-zinc-300 text-sm leading-relaxed">
              <ul className="list-disc list-outside ml-4 space-y-1">
                {((currentDrill as any).cues || []).map((cue: string, idx: number) => (
                  <li key={idx}>{cue}</li>
                ))}
              </ul>
            </div>

            <Button
              className="w-full shrink-0"
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
