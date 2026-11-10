import React from 'react';
import { Button } from './ui/Button';
import type { DaySchedule } from '../data/types';
import { CheckCircle2, Dumbbell, Flame } from 'lucide-react';

interface DailyForkModalProps {
  daySchedule: DaySchedule;
  onConfirmYes: () => void;
  onConfirmNo: () => void;
  onClose: () => void;
}

export const DailyForkModal: React.FC<DailyForkModalProps> = ({
  daySchedule,
  onConfirmYes,
  onConfirmNo,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/85 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-sm w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-3">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            {daySchedule.dayName} Check-In
          </div>
          <h2 className="text-xl font-bold text-zinc-100 mb-2">{daySchedule.popupQuestion}</h2>
          <p className="text-xs text-zinc-400">
            Answering Yes logs your streak immediately. Answering No starts your home fallback routine so you don't lose your streak!
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            variant="primary"
            className="w-full justify-between px-4 py-4 h-auto text-sm"
            onClick={onConfirmYes}
          >
            <span className="flex items-center gap-2 font-bold text-left">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              {daySchedule.yesButtonText || 'Yes (+1 Streak)'}
            </span>
          </Button>

          <Button
            size="lg"
            variant="secondary"
            className="w-full justify-between px-4 py-4 h-auto text-sm border border-zinc-700"
            onClick={onConfirmNo}
          >
            <span className="flex items-center gap-2 font-semibold text-left">
              <Dumbbell className="w-5 h-5 text-indigo-400 shrink-0" />
              {daySchedule.noButtonText || 'No, start Home Plan'}
            </span>
          </Button>
        </div>

        <button
          className="mt-5 text-xs text-zinc-500 hover:text-zinc-300 w-full text-center"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
