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
        const diffTime = Math.abs(now.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
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

