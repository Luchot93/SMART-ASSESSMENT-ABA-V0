import { useEffect, useLayoutEffect, useRef, useState } from 'react';

interface AutoSaveResult {
  isSaving: boolean;
  lastSavedAt: string | null;
}

/**
 * Debounces `saveFn(value)` by `delay` ms on every `value` change.
 * Skips the initial render — only fires after the first change.
 * Returns live `isSaving` and `lastSavedAt` for status indicators.
 */
export function useAutoSave(
  value: string,
  saveFn: (v: string) => void,
  delay = 800,
): AutoSaveResult {
  const [isSaving, setIsSaving]       = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRun = useRef(true);
  const saveFnRef  = useRef(saveFn);

  // Keep ref current after every render (avoids stale closure in the timeout)
  useLayoutEffect(() => { saveFnRef.current = saveFn; });

  useEffect(() => {
    // Skip initial mount
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    setIsSaving(true);
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      saveFnRef.current(value);
      setIsSaving(false);
      setLastSavedAt(new Date().toISOString());
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, delay]);

  return { isSaving, lastSavedAt };
}
