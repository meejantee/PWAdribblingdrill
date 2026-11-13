import React, { useState, useMemo } from 'react';
import { useUserData } from '../hooks/useUserData';
import workoutsData from '../data/workouts.json';
import { DailyForkModal } from '../components/DailyForkModal';
import { PhaseSelectorModal } from '../components/PhaseSelectorModal';
import { ExerciseAnimation } from '../components/ExerciseAnimation';
import type { DayPlanConfig, DaySchedule, StrengthExercise } from '../data/types';
import type { WorkoutSessionConfig } from '../App';
import { Zap, Activity, Trophy, RotateCcw, Calendar, Play, Lock, Eye, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { getTrainingDayOfWeek } from '../utils/dateUtils';

interface DashboardProps {
  onStartWorkout: (config: WorkoutSessionConfig) => void;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const Dashboard: React.FC<DashboardProps> = ({ onStartWorkout }) => {
  const { userData, isCompletedToday, getDisplayedStreak, undoTodaysSession, logExternalActivity } = useUserData();
  const displayedStreak = getDisplayedStreak();

  const todayName = useMemo(() => getTrainingDayOfWeek(new Date()), []);
  const [activeDayName, setActiveDayName] = useState<string>(todayName);

  const [showForkModal, setShowForkModal] = useState(false);
  const [showPhaseSelectorModal, setShowPhaseSelectorModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<DayPlanConfig | null>(null);
  const [externalLoggedMessage, setExternalLoggedMessage] = useState<string | null>(null);

  // Strict check: only allow starting workouts, fork modals, or undoing on the current training day
  const isViewingToday = activeDayName === todayName;

  const currentDaySchedule = (workoutsData.weeklySchedule as Record<string, DaySchedule>)[activeDayName];
  const previewPlan = currentDaySchedule.hasPopup ? currentDaySchedule.onNo : currentDaySchedule.defaultPlan;

  const scheduledExercises: StrengthExercise[] = useMemo(() => {
    if (!previewPlan) return [];
    return previewPlan.exercises
      .map((id) => (workoutsData.exerciseLibrary as Record<string, StrengthExercise>)[id])
      .filter(Boolean);
  }, [previewPlan]);

  const handleLaunchTodayRoutine = () => {
    // Strictly block any action if not viewing today or if already completed today
    if (!isViewingToday || isCompletedToday) return;

    if (currentDaySchedule.hasPopup) {
      setShowForkModal(true);
    } else if (currentDaySchedule.defaultPlan) {
      initiatePlanExecution(currentDaySchedule.defaultPlan);
    }
  };

  const initiatePlanExecution = (plan: DayPlanConfig) => {
    if (!isViewingToday) return;

    if (plan.dribblingMode === 'CHILL_DRIBBLING_DRILL') {
      // Chill 9-minute standing flow starts immediately
      onStartWorkout({
        phaseId: 'chill_flow',
        exerciseIds: plan.exercises,
        isFullDribbling: false
      });
    } else {
      // Full Dribbling Drill Mode shows Phase 1 / 2 / 3 selector modal right before starting
      setPendingPlan(plan);
      setShowPhaseSelectorModal(true);
    }
  };

  const handleForkYes = () => {
    if (!isViewingToday) return;
    setShowForkModal(false);
    if (currentDaySchedule.onYes) {
      logExternalActivity(currentDaySchedule.onYes.activityLabel);
      setExternalLoggedMessage(currentDaySchedule.onYes.message);
    }
  };

  const handleForkNo = () => {
    if (!isViewingToday) return;
    setShowForkModal(false);
    if (currentDaySchedule.onNo) {
      initiatePlanExecution(currentDaySchedule.onNo);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-zinc-100 p-6 flex flex-col max-w-md mx-auto">
      {/* Header: Streak, Best Streak & Total Sessions */}
      <header className="mb-4 mt-2">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-extrabold tracking-tight">Foam Ball Trainer</h1>
          {isCompletedToday && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" /> Streak Safe
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
          <div className="flex items-center gap-1 font-semibold text-zinc-200">
            <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" /> {displayedStreak} day streak
          </div>
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4 text-amber-500" /> {userData.highestStreak} best
          </div>
          <div className="flex items-center gap-1">
            <Activity className="w-4 h-4 text-blue-400" /> {userData.completedSessions} sessions
          </div>
        </div>
      </header>

      {/* Day of the Week Tabs directly below Streak Counter */}
      <div className="grid grid-cols-7 gap-1.5 mb-5">
        {DAYS_OF_WEEK.map((day) => {
          const isSelected = day === activeDayName;
          const isToday = day === todayName;
          return (
            <button
              key={day}
              onClick={() => setActiveDayName(day)}
              className={`py-2 rounded-lg text-xs font-bold transition-colors border flex flex-col items-center justify-center ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : isToday
                  ? 'bg-zinc-900 text-indigo-400 border-indigo-500/50'
                  : 'bg-zinc-900/70 text-zinc-400 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <span>{day.slice(0, 3)}</span>
              {isToday && (
                <span className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-indigo-400'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Today's completion & Undo banner — ONLY shown and interactive when viewing Today */}
      {isViewingToday && isCompletedToday && (
        <div className="mb-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <h3 className="text-emerald-400 font-bold text-sm mb-0.5">Session complete!</h3>
            <p className="text-emerald-500/80 text-xs">
              {userData.lastActivityLabel ? `Logged: ${userData.lastActivityLabel}` : 'Great job training today.'}
            </p>
          </div>
          {userData.previousStateSnapshot && (
            <button
              onClick={() => {
                undoTodaysSession();
                setExternalLoggedMessage(null);
              }}
              className="flex items-center gap-1 text-xs bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 px-3 py-2 rounded-lg transition-colors border border-zinc-800 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Undo
            </button>
          )}
        </div>
      )}

      {/* Primary Daily Blueprint Card */}
      <div className="mb-6 bg-gradient-to-br from-zinc-900 via-zinc-900 to-indigo-950/30 border border-indigo-500/30 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> {activeDayName} Blueprint
          </span>
          {!isViewingToday ? (
            <span className="inline-flex items-center gap-1 text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-semibold border border-zinc-700">
              <Eye className="w-3 h-3" /> Preview Only
            </span>
          ) : currentDaySchedule.hasPopup ? (
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-semibold">
              Fork Day
            </span>
          ) : null}
        </div>

        <h2 className="text-xl font-bold text-white mb-3">{currentDaySchedule.tag}</h2>

        {currentDaySchedule.hasPopup && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90">
            <strong>Check-In Fork:</strong> {currentDaySchedule.popupQuestion}
          </div>
        )}

        {isViewingToday && externalLoggedMessage && isCompletedToday && (
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 mb-4">
            <p className="text-sm text-emerald-300 font-medium mb-3">{externalLoggedMessage}</p>
            {currentDaySchedule.onYes?.optionalDribblingMode && (
              <Button
                size="sm"
                variant="secondary"
                className="w-full text-xs"
                onClick={() =>
                  onStartWorkout({
                    phaseId: 'chill_flow',
                    exerciseIds: [],
                    isFullDribbling: false
                  })
                }
              >
                Optional: Run 9-Min Chill Dribbling
              </Button>
            )}
          </div>
        )}

        {previewPlan && (
          <div className="space-y-2.5 mb-5 text-xs text-zinc-300 bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/80">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Stage 1 (Dribbling):</span>
              <span className="font-bold text-indigo-300">
                {previewPlan.dribblingMode === 'FULL_DRIBBLING_DRILL'
                  ? 'Full Dribbling Drill (20m)'
                  : 'Chill Flow Dribbling (9m)'}
              </span>
            </div>
            <div className="flex items-start justify-between gap-2 pt-2 border-t border-zinc-800/80">
              <span className="text-zinc-400 shrink-0">Stage 2 (Conditioning):</span>
              <span className="font-semibold text-right text-emerald-300">
                {scheduledExercises.map((ex) => ex.name).join(' + ')}
              </span>
            </div>
          </div>
        )}

        {/* Action Button — Disabled on any non-current day or if already completed today */}
        <Button
          size="lg"
          variant={isViewingToday && !isCompletedToday ? 'primary' : 'secondary'}
          disabled={!isViewingToday || isCompletedToday}
          className="w-full font-bold gap-2"
          onClick={handleLaunchTodayRoutine}
        >
          {!isViewingToday ? (
            <>
              <Lock className="w-4 h-4" />
              Locked — Available on {activeDayName}
            </>
          ) : isCompletedToday ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Finished Today
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              {currentDaySchedule.hasPopup
                ? `Check-In & Start ${activeDayName}`
                : `Start ${activeDayName} Stack`}
            </>
          )}
        </Button>
      </div>

      {/* Scheduled Exercises Breakdown (Read-Only View for Selected Day) */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          {activeDayName} Conditioning Breakdown ({scheduledExercises.length})
        </h3>
      </div>

      <div className="space-y-4 flex-1">
        {scheduledExercises.map((ex, index) => (
          <div
            key={ex.id}
            className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/90 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">
                  Exercise {index + 1} • {ex.category}
                </span>
                <h4 className="text-sm font-bold text-zinc-100">{ex.name}</h4>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-indigo-300 shrink-0">
                {ex.sets} sets × {ex.reps}
              </span>
            </div>

            <ExerciseAnimation exerciseId={ex.id} gifUrl={ex.gifUrl} />

            <ul className="space-y-1 text-xs text-zinc-400">
              {ex.cues.map((cue, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="text-emerald-500 shrink-0">•</span>
                  <span>{cue}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Daily Fork Modal (only reachable on today) */}
      {isViewingToday && showForkModal && (
        <DailyForkModal
          daySchedule={currentDaySchedule}
          onConfirmYes={handleForkYes}
          onConfirmNo={handleForkNo}
          onClose={() => setShowForkModal(false)}
        />
      )}

      {/* Pre-Dribbling Phase 1 / 2 / 3 Selector Modal (only shown before starting FULL_DRIBBLING_DRILL) */}
      {isViewingToday && showPhaseSelectorModal && pendingPlan && (
        <PhaseSelectorModal
          dayTag={currentDaySchedule.tag}
          unlockedPhases={userData.unlockedPhases}
          successfulAssessments={userData.successfulAssessments}
          onSelectPhase={(phaseId) => {
            setShowPhaseSelectorModal(false);
            onStartWorkout({
              phaseId,
              exerciseIds: pendingPlan.exercises,
              isFullDribbling: true
            });
          }}
          onClose={() => setShowPhaseSelectorModal(false)}
        />
      )}
    </div>
  );
};
