import { useLocalStorage } from './useLocalStorage';
import type { UserData } from '../data/types';
import { INITIAL_USER_DATA } from '../data/types';

export function useUserData() {
  const [userData, setUserData] = useLocalStorage<UserData>('foam-ball-trainer-user-data', INITIAL_USER_DATA);

  const logWorkout = (isAssessmentSuccessful: boolean) => {
    setUserData((prev) => {
      const now = new Date();
      const lastDate = prev.lastWorkoutDate ? new Date(prev.lastWorkoutDate) : null;
      
      let newStreak = prev.currentStreak;
      if (lastDate) {
        const todayStr = now.toDateString();
        const lastDateStr = lastDate.toDateString();

        if (todayStr !== lastDateStr) {
          // It's a new day, let's see if it's consecutive
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);

          if (lastDateStr === yesterday.toDateString()) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
        }
        // If it's the same day (todayStr === lastDateStr), streak stays the same
      } else {
        newStreak = 1;
      }

      const newAssessmentsCount = isAssessmentSuccessful 
        ? prev.successfulAssessments + 1 
        : prev.successfulAssessments;

      const newUnlockedPhases = [...prev.unlockedPhases];
      if (newAssessmentsCount >= 5 && !newUnlockedPhases.includes('phase_2')) {
        newUnlockedPhases.push('phase_2');
      }

      return {
        ...prev,
        completedSessions: prev.completedSessions + 1,
        currentStreak: newStreak,
        lastWorkoutDate: now.toISOString(),
        successfulAssessments: newAssessmentsCount,
        unlockedPhases: newUnlockedPhases
      };
    });
  };

  return { userData, logWorkout };
}

