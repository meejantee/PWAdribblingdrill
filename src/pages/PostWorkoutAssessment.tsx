import React, { useState } from 'react';
import { useUserData } from '../hooks/useUserData';
import workoutsData from '../data/workouts.json';
import type { StrengthExercise } from '../data/types';
import { ExerciseAnimation } from '../components/ExerciseAnimation';
import { Button } from '../components/ui/Button';
import { CheckCircle2, Circle } from 'lucide-react';

interface PostWorkoutAssessmentProps {
  isFullDribbling: boolean;
  exerciseIds: string[];
  onComplete: () => void;
}

const CheckboxRow = ({ checked, onChange, text }: { checked: boolean, onChange: () => void, text: string }) => (
  <div 
    className={`flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${
      checked ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-zinc-900 border-zinc-800'
    }`}
    onClick={onChange}
  >
    <div className="mt-0.5 shrink-0">
      {checked ? (
        <CheckCircle2 className="w-6 h-6 text-indigo-400" />
      ) : (
        <Circle className="w-6 h-6 text-zinc-600" />
      )}
    </div>
    <p className={`text-sm leading-snug ${checked ? 'text-zinc-200' : 'text-zinc-400'}`}>
      {text}
    </p>
  </div>
);

export const PostWorkoutAssessment: React.FC<PostWorkoutAssessmentProps> = ({
  isFullDribbling,
  exerciseIds,
  onComplete
}) => {
  const { userData, logWorkout } = useUserData();
  const [criteria1, setCriteria1] = useState(false);
  const [criteria2, setCriteria2] = useState(false);
  const [criteria3, setCriteria3] = useState(false);

  const completedExercises: StrengthExercise[] = exerciseIds
    .map(id => (workoutsData.exerciseLibrary as Record<string, StrengthExercise>)[id])
    .filter(Boolean);

  const handleSubmit = () => {
    const isSuccessful = isFullDribbling && criteria1 && criteria2 && criteria3;
    const wasPhase2Locked = !userData.unlockedPhases.includes('phase_2');
    
    logWorkout(isSuccessful, isFullDribbling ? 'Full Dribbling + Strength Stack' : 'Chill Flow + Prehab');
    
    if (wasPhase2Locked && isSuccessful && userData.successfulAssessments + 1 >= 5) {
      alert("🎉 Congratulations! You have unlocked Phase 2: Flow & Distraction!");
    }
    
    onComplete();
  };

  return (
    <div className="min-h-screen bg-transparent text-zinc-100 p-6 flex flex-col max-w-md mx-auto">
      <div className="flex-1 mt-6">
        <div className="text-center mb-6">
          <div className="inline-block bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-3">
            Daily Stack Complete 🔥
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            {isFullDribbling ? 'Mastery Check' : 'Recovery Session Logged'}
          </h1>
          <p className="text-zinc-400 text-sm">
            {isFullDribbling
              ? 'Check the boxes if you met the criteria during this session. You need 5 certified sessions to unlock Phase 2.'
              : 'Your chill flow and conditioning stack are complete. Claim your daily streak below!'}
          </p>
        </div>

        {isFullDribbling && (
          <div className="space-y-3 mb-6">
            <CheckboxRow 
              checked={criteria1} 
              onChange={() => setCriteria1(!criteria1)}
              text="120s continuous left-hand ankle-height pound sustained without losing the ball > 2 times."
            />
            <CheckboxRow 
              checked={criteria2} 
              onChange={() => setCriteria2(!criteria2)}
              text="Zero lower-back ache or pain reported post-workout."
            />
            <CheckboxRow 
              checked={criteria3} 
              onChange={() => setCriteria3(!criteria3)}
              text="Crossover path strictly stayed below knee level for 2 full minutes."
            />
          </div>
        )}

        {completedExercises.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
              Completed Conditioning Exercises
            </h3>
            <div className="space-y-3">
              {completedExercises.map((ex) => (
                <div key={ex.id} className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-emerald-300">{ex.name}</span>
                    <span className="text-xs font-mono text-zinc-400">{ex.sets} × {ex.reps}</span>
                  </div>
                  <ExerciseAnimation exerciseId={ex.id} gifUrl={ex.gifUrl} isComplete={true} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent pt-4 pb-8">
        <Button 
          size="lg" 
          className="w-full"
          onClick={handleSubmit}
        >
          Save Assessment & Return
        </Button>
      </div>
    </div>
  );
};
