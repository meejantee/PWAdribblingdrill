import { useLocalStorage } from './useLocalStorage';
import type { UserData } from '../data/types';
import { INITIAL_USER_DATA } from '../data/types';

export function useUserData() {
  const [userData, setUserData] = useLocalStorage<UserData>('foam-ball-trainer-user-data', INITIAL_USER_DATA);

  const getDisplayedStreak = (data: UserData = userData) => {
    if (!data.lastWorkoutDate) return 0;
    const now = new Date();
    const lastDate = new Date(data.lastWorkoutDate);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (
      lastDate.toDateString() !== now.toDateString() &&
      lastDate.toDateString() !== yesterday.toDateString()
    ) {
      return 0; // Streak broken
    }
    return data.currentStreak;
  };

  const undoTodaysSession = () => {
    setUserData((prev) => {
      if (!prev.previousStateSnapshot) return prev;
      const todayStr = new Date().toDateString();
      const lastDate = prev.lastWorkoutDate ? new Date(prev.lastWorkoutDate).toDateString() : null;
      if (lastDate === todayStr) {
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

      // If it's a completely new day (not today and not yesterday) and we set it to 1,
      // the above logic already handles it. But we should ensure we don't accidentally
      // zero out a streak of 1 if getDisplayedStreak() returns 0 for a broken streak right before this log.
      const displayed = getDisplayedStreak(prev);
      if (newStreak === prev.currentStreak && displayed === 0 && prev.currentStreak > 0) {
         // This means the user had a streak, broke it, and is now logging a workout on the same day they opened the app.
         // Since they logged a workout today, their new streak should be 1.
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

  return { userData, logWorkout, getDisplayedStreak, undoTodaysSession };
}

