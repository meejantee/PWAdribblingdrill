import React, { useState, useMemo } from 'react';
import { useUserData } from '../hooks/useUserData';
import workoutsData from '../data/workouts.json';
import { ReadinessModal } from '../components/ReadinessModal';
import { Lock, Unlock, Zap, Activity, Trophy, RotateCcw } from 'lucide-react';
import { isSameTrainingDay, getTrainingDayOfWeek } from '../utils/dateUtils';

interface DashboardProps {
  onStartWorkout: (phaseId: string, mode: 'standing' | 'seated') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onStartWorkout }) => {
  const { userData, getDisplayedStreak, undoTodaysSession } = useUserData();
  const [selectedPhase, setSelectedPhase] = useState<string>('phase_1');
  const [showReadinessModal, setShowReadinessModal] = useState(false);
  const displayedStreak = getDisplayedStreak();

  const isCompletedToday = Boolean(
    userData.lastWorkoutDate && isSameTrainingDay(userData.lastWorkoutDate, new Date())
  );

  const currentDay = useMemo(() => {
    return getTrainingDayOfWeek(new Date());
  }, []);

  const dayContextTag = (workoutsData.scheduleContext as any)[currentDay] || 'Standard Training Day';

  const handleStartClick = (phaseId: string) => {
    if (isCompletedToday) return; // Prevent start if already completed
    setSelectedPhase(phaseId);
    setShowReadinessModal(true);
  };

  return (
    <div className="min-h-screen bg-transparent text-zinc-100 p-6 flex flex-col max-w-md mx-auto">
      {/* Header */}
      <header className="mb-6 mt-4">
        <h1 className="text-3xl font-extrabold tracking-tight mb-3">Foam Ball Trainer</h1>
        <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-yellow-500" /> {displayedStreak} day streak
          </div>
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4 text-amber-500" /> {userData.highestStreak} best
          </div>
          <div className="flex items-center gap-1">
            <Activity className="w-4 h-4 text-blue-400" /> {userData.completedSessions} sessions
          </div>
        </div>
      </header>

      {/* Today's completion banner */}
      {isCompletedToday && (
        <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <h3 className="text-emerald-400 font-bold text-sm mb-1">Session complete!</h3>
            <p className="text-emerald-500/70 text-xs">Great job training today.</p>
          </div>
          {userData.previousStateSnapshot && (
            <button
              onClick={undoTodaysSession}
              className="flex items-center gap-1 text-xs bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 px-3 py-2 rounded-lg transition-colors border border-zinc-800"
            >
              <RotateCcw className="w-3 h-3" /> Undo
            </button>
          )}
        </div>
      )}

      {/* Progress to next phase if in Phase 1 */}
      {!userData.unlockedPhases.includes('phase_2') && (
        <div className="mb-8 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
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
          <p className="text-xs text-zinc-500 mt-2">Log 5 certified sessions to unlock Phase 2.</p>
        </div>
      )}

      {/* Phase List */}
      <div className="space-y-4 flex-1">
        {workoutsData.phases.map((phase) => {
          const isUnlocked = userData.unlockedPhases.includes(phase.id);
          
          return (
            <div 
              key={phase.id} 
              className={`p-5 rounded-xl border transition-all ${
                isUnlocked && !isCompletedToday
                  ? 'bg-zinc-900 border-zinc-700 hover:border-zinc-500' 
                  : 'bg-zinc-900/50 border-zinc-800 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-lg font-bold">{phase.name}</h2>
                {isUnlocked ? (
                  <Unlock className="w-5 h-5 text-zinc-400" />
                ) : (
                  <Lock className="w-5 h-5 text-zinc-600" />
                )}
              </div>
              <p className="text-sm text-zinc-400 mb-5">
                {phase.drills.length} drills • {Math.floor(phase.totalDurationSeconds / 60)} min
              </p>
              
              <button
                disabled={!isUnlocked || isCompletedToday}
                onClick={() => handleStartClick(phase.id)}
                className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors ${
                  isUnlocked && !isCompletedToday
                    ? 'bg-zinc-100 text-zinc-900 hover:bg-zinc-300' 
                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                }`}
              >
                {isCompletedToday ? 'Finished Today' : isUnlocked ? 'Select Phase' : 'Locked'}
              </button>
            </div>
          );
        })}

        {/* Phase 3 - Coming Soon */}
        <div className="p-5 rounded-xl border bg-zinc-900/30 border-zinc-800/50 opacity-50 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/40 backdrop-blur-[2px]">
            <span className="bg-zinc-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-zinc-300">Coming Soon</span>
          </div>
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-lg font-bold">Phase 3: Footwork</h2>
            <Lock className="w-5 h-5 text-zinc-700" />
          </div>
          <p className="text-sm text-zinc-500 mb-5">Integration & Micro-Counters</p>
          <div className="w-full py-3 rounded-lg font-semibold text-sm bg-zinc-800 text-zinc-600 text-center">
            Locked
          </div>
        </div>
      </div>

      {showReadinessModal && (
        <ReadinessModal 
          dayContext={dayContextTag} 
          onSelectMode={(mode) => {
            setShowReadinessModal(false);
            onStartWorkout(selectedPhase, mode);
          }}
          onClose={() => setShowReadinessModal(false)}
        />
      )}
    </div>
  );
};
