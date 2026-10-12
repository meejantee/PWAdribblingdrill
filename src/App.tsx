import { useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { ActiveWorkout } from './pages/ActiveWorkout';
import { PostWorkoutAssessment } from './pages/PostWorkoutAssessment';
import { useUserData } from './hooks/useUserData';

type AppState = 'dashboard' | 'workout' | 'assessment';

function App() {
  const [appState, setAppState] = useState<AppState>('dashboard');
  const [activePhase, setActivePhase] = useState<string>('');
  const [activeMode, setActiveMode] = useState<'standing' | 'seated'>('standing');
  const { logWorkout } = useUserData();

  const handleStartWorkout = (phaseId: string, mode: 'standing' | 'seated') => {
    setActivePhase(phaseId);
    setActiveMode(mode);
    setAppState('workout');
  };

  const handleEndWorkout = (completed: boolean) => {
    if (completed) {
      setAppState('assessment');
    } else {
      // User aborted the workout early. Log it as an unsuccessful assessment so the session still counts towards streak and total sessions.
      logWorkout(false);
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
          phaseId={activePhase} 
          mode={activeMode} 
          onEndWorkout={handleEndWorkout} 
        />
      )}
      
      {appState === 'assessment' && (
        <PostWorkoutAssessment onComplete={handleAssessmentComplete} />
      )}
    </>
  );
}

export default App;
