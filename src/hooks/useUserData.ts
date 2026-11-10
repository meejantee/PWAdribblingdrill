import { useLocalStorage } from './useLocalStorage';
import type { UserData } from '../data/types';
import { INITIAL_USER_DATA } from '../data/types';

export function useUserData() {
  const [userData, setUserData] = useLocalStorage<UserData>('foam-ball-trainer-user-data', INITIAL_USER_DATA);

  const calculateNextStreak = (lastWorkoutDate: string | null, currentStreak: number, now: Date): number => {
    const lastDate = lastWorkoutDate ? new Date(lastWorkoutDate) : null;
    let newStreak = currentStreak;
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
    return newStreak;
  };

  const isCompletedToday = (() => {
    if (!userData.lastWorkoutDate) return false;
    const now = new Date();
    const lastDate = new Date(userData.lastWorkoutDate);
    const diffTime = Math.abs(now.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 1;
  })();

  const logWorkout = (isAssessmentSuccessful: boolean, activityLabel = 'Full Home Routine') => {
    setUserData((prev) => {
      const now = new Date();
      const newStreak = calculateNextStreak(prev.lastWorkoutDate, prev.currentStreak, now);

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
        lastActivityLabel: activityLabel,
        successfulAssessments: newAssessmentsCount,
        unlockedPhases: newUnlockedPhases
      };
    });
  };

  const logExternalActivity = (activityLabel: string) => {
    setUserData((prev) => {
      const now = new Date();
      const newStreak = calculateNextStreak(prev.lastWorkoutDate, prev.currentStreak, now);
      return {
        ...prev,
        completedSessions: prev.completedSessions + 1,
        currentStreak: newStreak,
        lastWorkoutDate: now.toISOString(),
        lastActivityLabel: activityLabel
      };
    });
  };

  return { userData, isCompletedToday, logWorkout, logExternalActivity };
}
