const DAY_RESET_OFFSET_HOURS = 4;

/**
 * Returns a Date object shifted back by offsetHours (default 4 hours)
 * so that times between 00:00 and 03:59 belong to the previous calendar day's training day.
 */
export function getTrainingDate(date: Date | string | number = new Date(), offsetHours = DAY_RESET_OFFSET_HOURS): Date {
  const d = new Date(date);
  return new Date(d.getTime() - offsetHours * 60 * 60 * 1000);
}

/**
 * Returns the calendar date string (e.g. "Thu Nov 14 2024") for the training day.
 */
export function getTrainingDateString(date: Date | string | number = new Date(), offsetHours = DAY_RESET_OFFSET_HOURS): string {
  return getTrainingDate(date, offsetHours).toDateString();
}

/**
 * Returns day of week name (e.g. 'Monday', 'Tuesday') for the training day.
 */
export function getTrainingDayOfWeek(date: Date | string | number = new Date(), offsetHours = DAY_RESET_OFFSET_HOURS): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[getTrainingDate(date, offsetHours).getDay()];
}

/**
 * Checks whether two dates fall on the same training day.
 */
export function isSameTrainingDay(
  date1: Date | string | number,
  date2: Date | string | number,
  offsetHours = DAY_RESET_OFFSET_HOURS
): boolean {
  return getTrainingDateString(date1, offsetHours) === getTrainingDateString(date2, offsetHours);
}

/**
 * Checks whether laterDate's training day is the day immediately following earlierDate's training day.
 */
export function isConsecutiveTrainingDay(
  earlierDate: Date | string | number,
  laterDate: Date | string | number,
  offsetHours = DAY_RESET_OFFSET_HOURS
): boolean {
  const t1 = getTrainingDate(earlierDate, offsetHours);
  const t2 = getTrainingDate(laterDate, offsetHours);

  // Normalize hours to midnight to compare date diff in days accurately
  const d1 = new Date(t1.getFullYear(), t1.getMonth(), t1.getDate());
  const d2 = new Date(t2.getFullYear(), t2.getMonth(), t2.getDate());

  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  return diffDays === 1;
}
