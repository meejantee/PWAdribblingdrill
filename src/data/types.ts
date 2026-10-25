export interface UserData {
  successfulAssessments: number; // 5 needed to unlock phase 2
  unlockedPhases: string[];      // e.g. ["phase_1"] initially
  completedSessions: number;     // Total workouts finished
  currentStreak: number;         // Current daily streak
  highestStreak: number;         // Max daily streak achieved
  lastWorkoutDate: string | null;// ISO string
  previousStateSnapshot: Omit<UserData, 'previousStateSnapshot'> | null; // For undo
}

export const INITIAL_USER_DATA: UserData = {
  successfulAssessments: 0,
  unlockedPhases: ['phase_1'],
  completedSessions: 7,
  currentStreak: 7,
  highestStreak: 7,
  lastWorkoutDate: new Date().toISOString(),
  previousStateSnapshot: null
};
