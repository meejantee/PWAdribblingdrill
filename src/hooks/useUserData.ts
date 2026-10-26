import { useLocalStorage } from './useLocalStorage';
import type { UserData } from '../data/types';
import { INITIAL_USER_DATA } from '../data/types';
import {
  isSameTrainingDay,
  isConsecutiveTrainingDay
} from '../utils/dateUtils';

export function useUserData() {
  const [userData, setUserData] = useLocalStorage<UserData>('foam-ball-trainer-user-data', INITIAL_USER_DATA);

  const getDisplayedStreak = (data: UserData = userData) => {
    if (!data.lastWorkoutDate) return 0;
    const now = new Date();

    // If last workout was on the same training day or consecutive training day (yesterday's training day), streak is active
    if (
      isSameTrainingDay(data.lastWorkoutDate, now) ||
      isConsecutiveTrainingDay(data.lastWorkoutDate, now)
    ) {
      return data.currentStreak;
    }

    return 0; // Streak broken
  };

  const undoTodaysSession = () => {
    setUserData((prev) => {
      if (!prev.previousStateSnapshot) return prev;
      const now = new Date();
      if (prev.lastWorkoutDate && isSameTrainingDay(prev.lastWorkoutDate, now)) {
        return {
          ...prev.previousStateSnapshot,
          previousStateSnapshot: null
        };
      }
      return prev;
    });
  };

  const logWorkout = (isAssessmentSuccessful: boolean) => {
    setUserData((prev) => {
      const now = new Date();
      const lastDate = prev.lastWorkoutDate ? new Date(prev.lastWorkoutDate) : null;
      
      let newStreak = prev.currentStreak;
      if (lastDate) {
        if (!isSameTrainingDay(lastDate, now)) {
          if (isConsecutiveTrainingDay(lastDate, now)) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
        }
        // If same training day, streak stays the same
      } else {
        newStreak = 1;
      }

      const displayed = getDisplayedStreak(prev);
      if (newStreak === prev.currentStreak && displayed === 0 && prev.currentStreak > 0) {
         newStreak = 1;
      }

      const newAssessmentsCount = isAssessmentSuccessful 
        ? prev.successfulAssessments + 1 
        : prev.successfulAssessments;

      const newUnlockedPhases = [...prev.unlockedPhases];
      if (newAssessmentsCount >= 5 && !newUnlockedPhases.includes('phase_2')) {
        newUnlockedPhases.push('phase_2');
      }

      const snapshot: Omit<UserData, 'previousStateSnapshot'> = {
        successfulAssessments: prev.successfulAssessments,
        unlockedPhases: prev.unlockedPhases,
        completedSessions: prev.completedSessions,
        currentStreak: prev.currentStreak,
        highestStreak: prev.highestStreak,
        lastWorkoutDate: prev.lastWorkoutDate
      };

      return {
        ...prev,
        completedSessions: prev.completedSessions + 1,
        currentStreak: newStreak,
        highestStreak: Math.max(prev.highestStreak || 0, newStreak),
        lastWorkoutDate: now.toISOString(),
        successfulAssessments: newAssessmentsCount,
        unlockedPhases: newUnlockedPhases,
        previousStateSnapshot: snapshot
      };
    });
  };

  return { userData, setUserData, logWorkout, getDisplayedStreak, undoTodaysSession };
}
