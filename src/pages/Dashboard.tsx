import React, { useState, useMemo } from 'react';
import { useUserData } from '../hooks/useUserData';
import workoutsData from '../data/workouts.json';
import { ReadinessModal } from '../components/ReadinessModal';
import { DailyForkModal } from '../components/DailyForkModal';
import type { DayPlanConfig, DaySchedule } from '../data/types';
import type { WorkoutSessionConfig } from '../App';
import { Lock, Unlock, Zap, Activity, CheckCircle2, Calendar, Dumbbell, Play, Trophy, RotateCcw } from 'lucide-react';
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

  // Default to highest unlocked FULL_DRIBBLING_DRILL phase
  const defaultFullPhase = userData.unlockedPhases.includes('phase_2') ? 'phase_2' : 'phase_1';
  const [selectedFullPhase, setSelectedFullPhase] = useState<string>(defaultFullPhase);

  const [showForkModal, setShowForkModal] = useState(false);
  const [showReadinessModal, setShowReadinessModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<DayPlanConfig | null>(null);
  const [externalLoggedMessage, setExternalLoggedMessage] = useState<string | null>(null);

  const currentDaySchedule = (workoutsData.weeklySchedule as Record<string, DaySchedule>)[activeDayName];

  const resolvePhaseId = (dribblingMode: string) => {
    return dribblingMode === 'CHILL_DRIBBLING_DRILL' ? 'chill_flow' : selectedFullPhase;
  };

  const handleLaunchTodayRoutine = () => {
    if (currentDaySchedule.hasPopup) {
      setShowForkModal(true);
    } else if (currentDaySchedule.defaultPlan) {
      initiatePlanExecution(currentDaySchedule.defaultPlan);
    }
  };

  const initiatePlanExecution = (plan: DayPlanConfig) => {
    if (plan.dribblingMode === 'CHILL_DRIBBLING_DRILL') {
      // Chill mode automatically runs seated lumbar-deload
      onStartWorkout({
        phaseId: 'chill_flow',
        mode: 'seated',
        exerciseIds: plan.exercises,
        isFullDribbling: false
      });
    } else {
      // Full Dribbling Drill Mode asks standing vs seated readiness
      setPendingPlan(plan);
      setShowReadinessModal(true);
    }
  };

  const handleForkYes = () => {
    setShowForkModal(false);
    if (currentDaySchedule.onYes) {
      logExternalActivity(currentDaySchedule.onYes.activityLabel);
      setExternalLoggedMessage(currentDaySchedule.onYes.message);
    }
  };

  const handleForkNo = () => {
    setShowForkModal(false);
    if (currentDaySchedule.onNo) {
      initiatePlanExecution(currentDaySchedule.onNo);
    }
  };

  const previewPlan = currentDaySchedule.hasPopup ? currentDaySchedule.onNo : currentDaySchedule.defaultPlan;

  return (
    <div className="min-h-screen bg-transparent text-zinc-100 p-6 flex flex-col max-w-md mx-auto">
      {/* Header */}
      <header className="mb-6 mt-2">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-extrabold tracking-tight">Athletic Habit Pulse</h1>
          {isCompletedToday && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" /> Streak Safe
              </span>
              <button
                onClick={undoTodaysSession}
                title="Undo today's session"
                className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
          <div className="flex items-center gap-1 font-semibold text-zinc-200">
            <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" /> {displayedStreak} day streak
          </div>
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4 text-amber-500" /> {userData.highestStreak ?? 0} best
          </div>
          <div className="flex items-center gap-1">
            <Activity className="w-4 h-4 text-blue-400" /> {userData.completedSessions} sessions
          </div>
        </div>
      </header>

      {/* Day Selector Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {DAYS_OF_WEEK.map((day) => {
          const isSelected = day === activeDayName;
          const isToday = day === todayName;
          return (
            <button
              key={day}
              onClick={() => {
                setActiveDayName(day);
                setExternalLoggedMessage(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : isToday
                  ? 'bg-zinc-900 text-indigo-400 border-indigo-500/40'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {day.slice(0, 3)} {isToday && '•'}
            </button>
          );
        })}
      </div>

      {/* Primary Daily Routine Card */}
      <div className="mb-6 bg-gradient-to-br from-zinc-900 via-zinc-900 to-indigo-950/30 border border-indigo-500/30 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> {activeDayName} Blueprint
          </span>
          {currentDaySchedule.hasPopup && (
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-semibold">
              Fork Day
            </span>
          )}
        </div>

        <h2 className="text-xl font-bold text-white mb-3">{currentDaySchedule.tag}</h2>

        {externalLoggedMessage ? (
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 mb-3">
            <p className="text-sm text-emerald-300 font-medium mb-3">{externalLoggedMessage}</p>
            {currentDaySchedule.onYes?.optionalDribblingMode && (
              <Button
                size="sm"
                variant="secondary"
                className="w-full text-xs"
                onClick={() =>
                  onStartWorkout({
                    phaseId: 'chill_flow',
                    mode: 'seated',
                    exerciseIds: [],
                    isFullDribbling: false
                  })
                }
              >
                Optional: Run 9-Min Chill Seated Dribbling
              </Button>
            )}
          </div>
        ) : (
          <>
            {previewPlan && (
              <div className="space-y-2 mb-5 text-xs text-zinc-300 bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">1. Dribbling Block:</span>
                  <span className="font-bold text-indigo-300">
                    {previewPlan.dribblingMode === 'FULL_DRIBBLING_DRILL'
                      ? 'Full Dribbling Drill (20m)'
                      : 'Chill Seated Flow (9m)'}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-2 pt-1 border-t border-zinc-800/80">
                  <span className="text-zinc-400 shrink-0">2. Strength/Spine:</span>
                  <span className="font-semibold text-right text-emerald-300">
                    {previewPlan.exercises
                      .map((id) => (workoutsData.exerciseLibrary as any)[id]?.name)
                      .join(' + ')}
                  </span>
                </div>
              </div>
            )}

            <Button
              size="lg"
              variant="primary"
              className="w-full font-bold gap-2"
              onClick={handleLaunchTodayRoutine}
            >
              <Play className="w-5 h-5 fill-current" />
              {currentDaySchedule.hasPopup ? `Check-In & Start ${activeDayName}` : `Start ${activeDayName} Stack`}
            </Button>
          </>
        )}
      </div>

      {/* Phase 2 Unlock Progress */}
      {!userData.unlockedPhases.includes('phase_2') && (
        <div className="mb-6 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-zinc-300">Phase 2 Unlock Progress</h3>
            <span className="text-xs font-mono text-zinc-500">{userData.successfulAssessments} / 5</span>
          </div>
          <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all"
              style={{ width: `${(userData.successfulAssessments / 5) * 100}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500 mt-2">Log 5 certified Full Dribbling sessions to unlock Phase 2.</p>
        </div>
      )}

      {/* Full Dribbling Drill Mode Selector */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
          <Dumbbell className="w-3.5 h-3.5" /> Active Full Dribbling Drill Mode
        </h3>
      </div>

      <div className="space-y-3 flex-1">
        {workoutsData.phases
          .filter((p) => p.id !== 'chill_flow')
          .map((phase) => {
            const isUnlocked = userData.unlockedPhases.includes(phase.id);
            const isSelected = selectedFullPhase === phase.id;

            return (
              <div 
                key={phase.id} 
                onClick={() => isUnlocked && setSelectedFullPhase(phase.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-900 border-indigo-500 ring-1 ring-indigo-500/40'
                    : isUnlocked 
                    ? 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700' 
                    : 'bg-zinc-900/30 border-zinc-800/50 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h2 className="text-base font-bold">{phase.name}</h2>
                  {isUnlocked ? (
                    <Unlock className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-zinc-500'}`} />
                  ) : (
                    <Lock className="w-4 h-4 text-zinc-600" />
                  )}
                </div>
                <p className="text-xs text-zinc-400">
                  {phase.drills.length} drills • {Math.floor(phase.totalDurationSeconds / 60)} min
                </p>
              </div>
            );
          })}
      </div>

      {showForkModal && (
        <DailyForkModal
          daySchedule={currentDaySchedule}
          onConfirmYes={handleForkYes}
          onConfirmNo={handleForkNo}
          onClose={() => setShowForkModal(false)}
        />
      )}

      {showReadinessModal && pendingPlan && (
        <ReadinessModal 
          dayContext={currentDaySchedule.tag} 
          onSelectMode={(mode) => {
            setShowReadinessModal(false);
            onStartWorkout({
              phaseId: resolvePhaseId(pendingPlan.dribblingMode),
              mode,
              exerciseIds: pendingPlan.exercises,
              isFullDribbling: pendingPlan.dribblingMode === 'FULL_DRIBBLING_DRILL'
            });
          }}
          onClose={() => setShowReadinessModal(false)}
        />
      )}
    </div>
  );
};
