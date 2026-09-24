import React from 'react';
import { Button } from './ui/Button';

interface ReadinessModalProps {
  dayContext: string;
  onSelectMode: (mode: 'standing' | 'seated') => void;
  onClose: () => void;
}

export const ReadinessModal: React.FC<ReadinessModalProps> = ({ dayContext, onSelectMode, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-sm w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-block bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
            {dayContext}
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-2">Readiness Check</h2>
          <p className="text-zinc-400">Are you up for full dribbling drills?</p>
        </div>
        
        <div className="flex flex-col gap-3">
          <Button 
            size="lg" 
            variant="primary" 
            className="w-full justify-between"
            onClick={() => onSelectMode('standing')}
          >
            <span>Yes, bring it on</span>
            <span className="text-xs opacity-70">Standing Mode</span>
          </Button>
          
          <Button 
            size="lg" 
            variant="secondary" 
            className="w-full justify-between"
            onClick={() => onSelectMode('seated')}
          >
            <span>No, recovery drill today</span>
            <span className="text-xs opacity-70">Seated Mode</span>
          </Button>
        </div>
        
        <button 
          className="mt-6 text-sm text-zinc-500 hover:text-zinc-300 w-full text-center"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
