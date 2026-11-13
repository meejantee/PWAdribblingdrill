import { useEffect, useRef } from 'react';

/**
 * Keeps the device screen awake continuously while the component is mounted,
 * even during untimed strength exercises or paused timers. Automatically
 * re-acquires the wake lock when the app returns to the foreground.
 */
export function useWakeLock(enabled = true) {
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled) return;

    let isCancelled = false;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && document.visibilityState === 'visible') {
          if (wakeLockRef.current) {
            try {
              await wakeLockRef.current.release();
            } catch {
              // ignore release errors
            }
          }
          const lock = await (navigator as any).wakeLock.request('screen');
          if (!isCancelled) {
            wakeLockRef.current = lock;
          } else {
            await lock.release();
          }
        }
      } catch (err) {
        console.warn('Wake Lock error:', err);
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isCancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [enabled]);
}
