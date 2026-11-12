import {
  getTrainingDateString,
  isSameTrainingDay,
  isConsecutiveTrainingDay
} from './dateUtils';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

function runTests() {
  console.log('Running dateUtils tests...');

  // Nov 15 2024 at 00:09:00 -> training date should be Nov 14 2024
  const d1 = new Date('2024-11-15T00:09:00');
  assert(
    getTrainingDateString(d1) === new Date('2024-11-14T12:00:00').toDateString(),
    '12:09 AM should belong to previous calendar day training date'
  );

  // Nov 15 2024 at 03:59:59 -> training date should be Nov 14 2024
  const d2 = new Date('2024-11-15T03:59:59');
  assert(
    getTrainingDateString(d2) === new Date('2024-11-14T12:00:00').toDateString(),
    '3:59 AM should belong to previous calendar day training date'
  );

  // Nov 15 2024 at 04:00:00 -> training date should be Nov 15 2024
  const d3 = new Date('2024-11-15T04:00:00');
  assert(
    getTrainingDateString(d3) === new Date('2024-11-15T12:00:00').toDateString(),
    '4:00 AM should belong to current calendar day training date'
  );

  // 11:59 PM and 12:09 AM same night -> same training day
  const night1159 = new Date('2024-11-14T23:59:00');
  const night1209 = new Date('2024-11-15T00:09:00');
  assert(
    isSameTrainingDay(night1159, night1209),
    '11:59 PM and 12:09 AM should be same training day'
  );

  // Consecutive training days across 4 AM reset threshold
  const day1 = new Date('2024-11-14T22:00:00'); // Training day Nov 14
  const day2 = new Date('2024-11-16T01:00:00'); // Calendar Nov 16 1:00 AM -> Training day Nov 15
  assert(
    isConsecutiveTrainingDay(day1, day2),
    'Nov 14 night and Nov 16 1:00 AM should be consecutive training days'
  );

  console.log('All dateUtils tests passed successfully!');
}

runTests();
