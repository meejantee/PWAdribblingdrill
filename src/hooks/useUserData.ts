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

    // If last workout was on the same training day or consecutive training day, streak is active
    if (
      isSameTrainingDay(data.lastWorkoutDate, now) ||
      isConsecutiveTrainingDay(data.lastWorkoutDate, now)
    ) {
      return data.currentStreak;
    }

    return 0; // Streak broken
  };

  const isCompletedToday = (() => {
    if (!userData.lastWorkoutDate) return false;
    return isSameTrainingDay(userData.lastWorkoutDate, new Date());
  })();

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

  const calculateNextStreak = (lastWorkoutDate: string | null, currentStreak: number, now: Date): number => {
    if (!lastWorkoutDate) return 1;
    if (isSameTrainingDay(lastWorkoutDate, now)) {
      return Math.max(1, currentStreak);
    }
    if (isConsecutiveTrainingDay(lastWorkoutDate, now)) {
      return currentStreak + 1;
    }
    return 1; // Streak broken
  };

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

      const snapshot: Omit<UserData, 'previousStateSnapshot'> = {
        successfulAssessments: prev.successfulAssessments,
        unlockedPhases: prev.unlockedPhases,
        completedSessions: prev.completedSessions,
        currentStreak: prev.currentStreak,
        highestStreak: prev.highestStreak ?? 0,
        lastWorkoutDate: prev.lastWorkoutDate,
        lastActivityLabel: prev.lastActivityLabel
      };

      return {
        ...prev,
        completedSessions: prev.completedSessions + 1,
        currentStreak: newStreak,
        highestStreak: Math.max(prev.highestStreak ?? 0, newStreak),
        lastWorkoutDate: now.toISOString(),
        lastActivityLabel: activityLabel,
        successfulAssessments: newAssessmentsCount,
        unlockedPhases: newUnlockedPhases,
        previousStateSnapshot: snapshot
      };
    });
  };

  const logExternalActivity = (activityLabel: string) => {
    setUserData((prev) => {
      const now = new Date();
      const newStreak = calculateNextStreak(prev.lastWorkoutDate, prev.currentStreak, now);

      const snapshot: Omit<UserData, 'previousStateSnapshot'> = {
        successfulAssessments: prev.successfulAssessments,
        unlockedPhases: prev.unlockedPhases,
        completedSessions: prev.completedSessions,
        currentStreak: prev.currentStreak,
        highestStreak: prev.highestStreak ?? 0,
        lastWorkoutDate: prev.lastWorkoutDate,
        lastActivityLabel: prev.lastActivityLabel
      };

      return {
        ...prev,
        completedSessions: prev.completedSessions + 1,
        currentStreak: newStreak,
        highestStreak: Math.max(prev.highestStreak ?? 0, newStreak),
        lastWorkoutDate: now.toISOString(),
        lastActivityLabel: activityLabel,
        previousStateSnapshot: snapshot
      };
    });
  };

  return {
    userData,
    setUserData,
    isCompletedToday,
    getDisplayedStreak,
    undoTodaysSession,
    logWorkout,
    logExternalActivity
  };
}
