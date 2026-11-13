import React from 'react';
import workoutsData from '../data/workouts.json';
import { Lock, Unlock, Play, X } from 'lucide-react';

interface PhaseSelectorModalProps {
  dayTag: string;
  unlockedPhases: string[];
  successfulAssessments: number;
  onSelectPhase: (phaseId: string) => void;
  onClose: () => void;
}

export const PhaseSelectorModal: React.FC<PhaseSelectorModalProps> = ({
  dayTag,
  unlockedPhases,
  successfulAssessments,
  onSelectPhase,
  onClose
}) => {
  const fullPhases = workoutsData.phases.filter((p) => p.id !== 'chill_flow');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/85 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl max-h-[90dvh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="inline-block bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase mb-2">
              {dayTag}
            </div>
            <h2 className="text-xl font-bold text-zinc-100">Select Dribbling Phase</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Choose your 20-minute Full Dribbling Phase to begin Stage 1.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phase 2 Unlock Progress */}
        {!unlockedPhases.includes('phase_2') && (
          <div className="mb-4 bg-zinc-950/70 border border-zinc-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-xs font-semibold text-zinc-300">Phase 2 Unlock Progress</h3>
              <span className="text-xs font-mono text-indigo-400">{successfulAssessments} / 5</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all"
                style={{ width: `${Math.min(100, (successfulAssessments / 5) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1.5">
              Log 5 certified Full Dribbling sessions to unlock Phase 2.
            </p>
          </div>
        )}

        {/* Phase Cards */}
        <div className="space-y-3">
          {fullPhases.map((phase) => {
            const isUnlocked = unlockedPhases.includes(phase.id);

            return (
              <div
                key={phase.id}
                className={`p-4 rounded-xl border transition-all ${
                  isUnlocked
                    ? 'bg-zinc-950/60 border-zinc-700 hover:border-indigo-500/60'
                    : 'bg-zinc-950/30 border-zinc-800/60 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-base font-bold text-zinc-100">{phase.name}</h3>
                  {isUnlocked ? (
                    <Unlock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <Lock className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                  )}
                </div>
                <p className="text-xs text-zinc-400 mb-3">
                  {phase.drills.length} drills • {Math.floor(phase.totalDurationSeconds / 60)} min
                </p>

                <button
                  disabled={!isUnlocked}
                  onClick={() => onSelectPhase(phase.id)}
                  className={`w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                    isUnlocked
                      ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  {isUnlocked ? (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Start {phase.name.split(':')[0]}
                    </>
                  ) : (
                    'Locked (5 Certified Sessions Needed)'
                  )}
                </button>
              </div>
            );
          })}

          {/* Phase 3 - Coming Soon */}
          <div className="p-4 rounded-xl border bg-zinc-950/30 border-zinc-800/50 opacity-50 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/40 backdrop-blur-[1px]">
              <span className="bg-zinc-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-zinc-300 border border-zinc-700">
                Coming Soon
              </span>
            </div>
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-base font-bold">Phase 3: Footwork</h3>
              <Lock className="w-4 h-4 text-zinc-700" />
            </div>
            <p className="text-xs text-zinc-500 mb-3">Integration & Micro-Counters</p>
            <div className="w-full py-2 rounded-lg font-semibold text-xs bg-zinc-800 text-zinc-600 text-center">
              Locked
            </div>
          </div>
        </div>

        <button
          className="mt-5 text-xs text-zinc-500 hover:text-zinc-300 w-full text-center"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
