import { useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { ActiveWorkout } from './pages/ActiveWorkout';
import { PostWorkoutAssessment } from './pages/PostWorkoutAssessment';

type AppState = 'dashboard' | 'workout' | 'assessment';

export interface WorkoutSessionConfig {
  phaseId: string;
  mode: 'standing' | 'seated';
  exerciseIds: string[];
  isFullDribbling: boolean;
}

function App() {
  const [appState, setAppState] = useState<AppState>('dashboard');
  const [sessionConfig, setSessionConfig] = useState<WorkoutSessionConfig>({
    phaseId: 'phase_1',
    mode: 'standing',
    exerciseIds: [],
    isFullDribbling: true
  });

  const handleStartWorkout = (config: WorkoutSessionConfig) => {
    setSessionConfig(config);
    setAppState('workout');
  };

  const handleEndWorkout = (completed: boolean) => {
    if (completed) {
      setAppState('assessment');
    } else {
      setAppState('dashboard');
    }
  };

  const handleAssessmentComplete = () => {
    setAppState('dashboard');
  };

  return (
    <>
      {appState === 'dashboard' && (
        <Dashboard onStartWorkout={handleStartWorkout} />
      )}
      
      {appState === 'workout' && (
        <ActiveWorkout 
          phaseId={sessionConfig.phaseId} 
          mode={sessionConfig.mode} 
          exerciseIds={sessionConfig.exerciseIds}
          onEndWorkout={handleEndWorkout} 
        />
      )}
      
      {appState === 'assessment' && (
        <PostWorkoutAssessment 
          isFullDribbling={sessionConfig.isFullDribbling}
          onComplete={handleAssessmentComplete} 
        />
      )}
    </>
  );
}

export default App;
