import React from 'react';

interface ExerciseAnimationProps {
  exerciseId: string;
  gifUrl?: string;
  isComplete?: boolean;
}

/**
 * Self-contained looping GIF-style movement visualizer for all 9 multi-sport exercises.
 * Works 100% offline in the PWA and also supports an external/local gifUrl if provided.
 */
export const ExerciseAnimation: React.FC<ExerciseAnimationProps> = ({
  exerciseId,
  gifUrl,
  isComplete = false
}) => {
  if (gifUrl) {
    return (
      <div className="relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center h-44 w-full">
        <img
          src={gifUrl}
          alt={exerciseId}
          className="h-full w-full object-contain"
        />
        <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-zinc-950/80 text-[10px] font-mono uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
          {isComplete ? 'Set Logged ✓' : 'Live Demo GIF'}
        </span>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 flex flex-col items-center justify-center h-44 w-full p-3">
      <style>{`
        @keyframes squatDownUp {
          0%, 100% { transform: translateY(0px); }
          45%, 65% { transform: translateY(18px); }
        }
        @keyframes stepUpLift {
          0%, 100% { transform: translateY(14px); }
          45%, 65% { transform: translateY(-16px); }
        }
        @keyframes birdDogExtend {
          0%, 100% { transform: scaleX(0.4); opacity: 0.5; }
          40%, 75% { transform: scaleX(1); opacity: 1; }
        }
        @keyframes pullUpBody {
          0%, 100% { transform: translateY(14px); }
          45%, 60% { transform: translateY(-14px); }
        }
        @keyframes wristRotate {
          0%, 100% { transform: rotate(-32deg); }
          50% { transform: rotate(32deg); }
        }
        @keyframes cossackShift {
          0%, 100% { transform: translate(-18px, 12px); }
          50% { transform: translate(18px, 12px); }
        }
        @keyframes pallofPress {
          0%, 100% { transform: translateX(0px); }
          45%, 70% { transform: translateX(22px); }
        }
        @keyframes hangPulse {
          0%, 100% { stroke-opacity: 0.5; transform: scale(0.98); }
          50% { stroke-opacity: 1; transform: scale(1.03); }
        }
      `}</style>

      <span className="absolute top-2 left-2.5 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
        Movement Guide
      </span>
      <span className="absolute top-2 right-2.5 px-2 py-0.5 rounded bg-indigo-500/15 text-[10px] font-bold uppercase tracking-wider text-indigo-300 border border-indigo-500/30">
        {isComplete ? 'Great Rep Form 🔥' : 'Looping Demo'}
      </span>

      <svg
        viewBox="0 0 200 120"
        className="w-full h-32 max-w-[240px]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Floor Line */}
        <line x1="20" y1="106" x2="180" y2="106" stroke="#3f3f46" strokeWidth="3" strokeLinecap="round" />

        {exerciseId === 'bulgarian_split_squat' && (
          <>
            {/* Bench / Couch */}
            <rect x="135" y="76" width="32" height="30" rx="4" fill="#27272a" stroke="#52525b" strokeWidth="2" />
            {/* Animated Athlete */}
            <g style={{ animation: 'squatDownUp 2.8s ease-in-out infinite' }}>
              <circle cx="88" cy="28" r="9" fill="#818cf8" />
              {/* Slight forward torso lean */}
              <line x1="88" y1="37" x2="94" y2="68" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" />
              {/* Lead Leg */}
              <polyline points="94,68 74,84 74,104" stroke="#34d399" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
              {/* Rear Elevated Leg */}
              <polyline points="94,68 116,86 142,76" stroke="#a1a1aa" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <text x="26" y="42" fill="#34d399" fontSize="9" fontWeight="bold">2s Bottom Hold</text>
          </>
        )}

        {exerciseId === 'high_box_step_up' && (
          <>
            {/* High Box */}
            <rect x="102" y="72" width="44" height="34" rx="4" fill="#27272a" stroke="#6366f1" strokeWidth="2" />
            <g style={{ animation: 'stepUpLift 2.6s ease-in-out infinite' }}>
              <circle cx="112" cy="34" r="9" fill="#818cf8" />
              <line x1="112" y1="43" x2="112" y2="68" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" />
              {/* Lead Leg on Box */}
              <line x1="112" y1="68" x2="118" y2="72" stroke="#34d399" strokeWidth="4.5" strokeLinecap="round" />
              {/* Trailing Leg */}
              <line x1="112" y1="68" x2="92" y2="92" stroke="#a1a1aa" strokeWidth="4" strokeLinecap="round" />
            </g>
            <text x="24" y="42" fill="#818cf8" fontSize="9" fontWeight="bold">Drive Lead Heel</text>
          </>
        )}

        {(exerciseId === 'mcgill_bird_dog' || exerciseId === 'mcgill_big_3') && (
          <>
            {/* Quadruped Core Base */}
            <circle cx="62" cy="58" r="8" fill="#818cf8" />
            {/* Neutral Locked Spine */}
            <line x1="70" y1="62" x2="122" y2="62" stroke="#34d399" strokeWidth="5" strokeLinecap="round" />
            {/* Support Arm & Knee */}
            <line x1="76" y1="62" x2="76" y2="105" stroke="#a1a1aa" strokeWidth="4" strokeLinecap="round" />
            <polyline points="118,62 118,105 132,105" stroke="#a1a1aa" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            {/* Extending Arm */}
            <g style={{ transformOrigin: '72px 62px', animation: 'birdDogExtend 3.2s ease-in-out infinite' }}>
              <line x1="72" y1="60" x2="32" y2="56" stroke="#34d399" strokeWidth="4" strokeLinecap="round" />
            </g>
            {/* Extending Opposite Heel */}
            <g style={{ transformOrigin: '122px 62px', animation: 'birdDogExtend 3.2s ease-in-out infinite' }}>
              <line x1="122" y1="62" x2="168" y2="60" stroke="#34d399" strokeWidth="4.5" strokeLinecap="round" />
            </g>
            <text x="64" y="34" fill="#34d399" fontSize="9" fontWeight="bold">Neutral Spine Lock</text>
          </>
        )}

        {exerciseId === 'home_pull_dip' && (
          <>
            {/* Pull-up Stand Frame */}
            <line x1="55" y1="18" x2="55" y2="105" stroke="#52525b" strokeWidth="3" />
            <line x1="145" y1="18" x2="145" y2="105" stroke="#52525b" strokeWidth="3" />
            <line x1="50" y1="20" x2="150" y2="20" stroke="#818cf8" strokeWidth="4" strokeLinecap="round" />
            {/* Pulling Body */}
            <g style={{ animation: 'pullUpBody 2.5s ease-in-out infinite' }}>
              <circle cx="100" cy="36" r="8" fill="#34d399" />
              <line x1="100" y1="44" x2="100" y2="76" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" />
              <line x1="100" y1="76" x2="95" y2="100" stroke="#a1a1aa" strokeWidth="4" strokeLinecap="round" />
              <line x1="100" y1="76" x2="105" y2="100" stroke="#a1a1aa" strokeWidth="4" strokeLinecap="round" />
              {/* Arms to Bar */}
              <polyline points="82,20 86,44 100,48" stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" />
              <polyline points="118,20 114,44 100,48" stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          </>
        )}

        {exerciseId === 'beastmaker_arc_block' && (
          <>
            {/* Beastmaker Board */}
            <rect x="65" y="14" width="70" height="16" rx="4" fill="#4f46e5" stroke="#818cf8" strokeWidth="2" />
            {/* Yoga Blocks under feet */}
            <rect x="82" y="92" width="36" height="14" rx="2" fill="#6366f1" />
            <g style={{ transformOrigin: '100px 55px', animation: 'hangPulse 2s ease-in-out infinite' }}>
              <circle cx="100" cy="46" r="8" fill="#34d399" />
              <line x1="100" y1="54" x2="100" y2="76" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" />
              <line x1="100" y1="56" x2="84" y2="28" stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="100" y1="56" x2="116" y2="28" stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="100" y1="76" x2="94" y2="92" stroke="#a1a1aa" strokeWidth="4" strokeLinecap="round" />
              <line x1="100" y1="76" x2="106" y2="92" stroke="#a1a1aa" strokeWidth="4" strokeLinecap="round" />
            </g>
            <text x="18" y="62" fill="#a5b4fc" fontSize="8.5" fontWeight="bold">75% Weight on Blocks</text>
          </>
        )}

        {exerciseId === 'wrist_armor_circuit' && (
          <>
            {/* Forearm on bench/thigh */}
            <rect x="48" y="68" width="55" height="10" rx="5" fill="#71717a" />
            {/* Rotating Lever / Hammer */}
            <g style={{ transformOrigin: '105px 72px', animation: 'wristRotate 2.4s ease-in-out infinite' }}>
              <circle cx="105" cy="72" r="7" fill="#818cf8" />
              <line x1="105" y1="72" x2="105" y2="28" stroke="#e4e4e7" strokeWidth="4" strokeLinecap="round" />
              <rect x="93" y="20" width="24" height="10" rx="3" fill="#34d399" />
            </g>
            <text x="45" y="42" fill="#34d399" fontSize="9" fontWeight="bold">Controlled Pronation</text>
          </>
        )}

        {exerciseId === 'cossack_squat' && (
          <>
            <g style={{ animation: 'cossackShift 3s ease-in-out infinite' }}>
              <circle cx="100" cy="36" r="8" fill="#818cf8" />
              <line x1="100" y1="44" x2="100" y2="72" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" />
              <line x1="100" y1="72" x2="72" y2="94" stroke="#34d399" strokeWidth="4.5" strokeLinecap="round" />
              <line x1="100" y1="72" x2="136" y2="94" stroke="#34d399" strokeWidth="4.5" strokeLinecap="round" />
            </g>
            <text x="58" y="24" fill="#34d399" fontSize="9" fontWeight="bold">Deep Lateral Hip Shift</text>
          </>
        )}

        {exerciseId === 'band_pallof_press' && (
          <>
            {/* Anchor Post */}
            <line x1="30" y1="22" x2="30" y2="105" stroke="#52525b" strokeWidth="4" />
            {/* Snowboard Stance Athlete */}
            <circle cx="96" cy="36" r="8" fill="#818cf8" />
            <line x1="96" y1="44" x2="96" y2="74" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" />
            <line x1="96" y1="74" x2="82" y2="105" stroke="#a1a1aa" strokeWidth="4" strokeLinecap="round" />
            <line x1="96" y1="74" x2="112" y2="105" stroke="#a1a1aa" strokeWidth="4" strokeLinecap="round" />
            {/* Band & Pressing Hands */}
            <g style={{ animation: 'pallofPress 2.6s ease-in-out infinite' }}>
              <line x1="30" y1="56" x2="112" y2="56" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="4 2" />
              <circle cx="114" cy="56" r="5" fill="#34d399" />
            </g>
            <text x="80" y="24" fill="#f59e0b" fontSize="9" fontWeight="bold">Anti-Rotation Lock</text>
          </>
        )}
      </svg>
    </div>
  );
};
