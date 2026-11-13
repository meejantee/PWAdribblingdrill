import { useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { ActiveWorkout } from './pages/ActiveWorkout';
import { PostWorkoutAssessment } from './pages/PostWorkoutAssessment';
import { useUserData } from './hooks/useUserData';
import { useWakeLock } from './hooks/useWakeLock';

type AppState = 'dashboard' | 'workout' | 'assessment';

export interface WorkoutSessionConfig {
  phaseId: string;
  exerciseIds: string[];
  isFullDribbling: boolean;
}

function App() {
  // Keep screen active whenever the app is open, even during untimed exercises
  useWakeLock(true);

  const [appState, setAppState] = useState<AppState>('dashboard');
  const [sessionConfig, setSessionConfig] = useState<WorkoutSessionConfig>({
    phaseId: 'phase_1',
    exerciseIds: [],
    isFullDribbling: true
  });
  const { logWorkout } = useUserData();

  const handleStartWorkout = (config: WorkoutSessionConfig) => {
    setSessionConfig(config);
    setAppState('workout');
  };

  const handleEndWorkout = (completed: boolean) => {
    if (completed) {
      setAppState('assessment');
    } else {
      // User aborted the workout early. Log it as an unsuccessful assessment so the session still counts towards streak and total sessions.
      logWorkout(false, 'Aborted Session');
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
          exerciseIds={sessionConfig.exerciseIds}
          onEndWorkout={handleEndWorkout} 
        />
      )}
      
      {appState === 'assessment' && (
        <PostWorkoutAssessment 
          isFullDribbling={sessionConfig.isFullDribbling}
          exerciseIds={sessionConfig.exerciseIds}
          onComplete={handleAssessmentComplete} 
        />
      )}
    </>
  );
}

export default App;
