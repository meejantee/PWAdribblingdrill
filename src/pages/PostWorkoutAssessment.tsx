import React, { useState } from 'react';
import { useUserData } from '../hooks/useUserData';
import { Button } from '../components/ui/Button';
import { CheckCircle2, Circle } from 'lucide-react';

interface PostWorkoutAssessmentProps {
  isFullDribbling: boolean;
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

export const PostWorkoutAssessment: React.FC<PostWorkoutAssessmentProps> = ({ isFullDribbling, onComplete }) => {
  const { userData, logWorkout } = useUserData();
  const [criteria1, setCriteria1] = useState(false);
  const [criteria2, setCriteria2] = useState(false);
  const [criteria3, setCriteria3] = useState(false);

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 flex flex-col max-w-md mx-auto">
      <div className="flex-1 mt-8">
        <div className="text-center mb-8">
          <div className="inline-block bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
            Daily Stack Complete 🔥
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            {isFullDribbling ? 'Mastery Check' : 'Recovery Session Logged'}
          </h1>
          <p className="text-zinc-400 text-sm">
            {isFullDribbling
              ? 'Check the boxes if you met the criteria during your Full Dribbling Drill Mode.'
              : 'Your chill flow and spine/wrist prehab are complete. Claim your daily streak below!'}
          </p>
        </div>

        {isFullDribbling && (
          <div className="space-y-4 mb-8">
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
      </div>

      <div className="sticky bottom-0 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent pt-4 pb-8">
        <Button 
          size="lg" 
          className="w-full"
          onClick={handleSubmit}
        >
          Save Streak & Return
        </Button>
      </div>
    </div>
  );
};
