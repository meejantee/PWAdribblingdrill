export interface UserData {
  successfulAssessments: number; // 5 needed to unlock phase 2
  unlockedPhases: string[];      // e.g. ["phase_1"] initially
  completedSessions: number;     // Total workouts finished
  currentStreak: number;         // Current daily streak
  highestStreak: number;         // Max daily streak achieved
  lastWorkoutDate: string | null;// ISO string
  lastActivityLabel?: string;    // Tracks what secured today's streak
  previousStateSnapshot: Omit<UserData, 'previousStateSnapshot'> | null; // For undo
}

export const INITIAL_USER_DATA: UserData = {
  successfulAssessments: 0,
  unlockedPhases: ['phase_1'],
  completedSessions: 0,
  currentStreak: 0,
  highestStreak: 0,
  lastWorkoutDate: null,
  lastActivityLabel: '',
  previousStateSnapshot: null
};

export type DribblingModeId = 'FULL_DRIBBLING_DRILL' | 'CHILL_DRIBBLING_DRILL' | 'NONE';

export interface StrengthExercise {
  id: string;
  name: string;
  category: string;
  sets: number;
  reps: string;
  restSeconds: number;
  cues: string[];
}

export interface DayPlanConfig {
  dribblingMode: DribblingModeId;
  defaultPosture: 'standing' | 'seated';
  exercises: string[];
}

export interface DaySchedule {
  dayName: string;
  tag: string;
  hasPopup: boolean;
  popupQuestion?: string;
  yesButtonText?: string;
  noButtonText?: string;
  onYes?: {
    awardStreakImmediately: boolean;
    activityLabel: string;
    message: string;
    optionalDribblingMode?: DribblingModeId;
  };
  onNo?: DayPlanConfig;
  defaultPlan?: DayPlanConfig;
}
