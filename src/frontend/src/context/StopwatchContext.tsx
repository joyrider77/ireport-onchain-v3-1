import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StopwatchState {
  isRunning: boolean;
  elapsedMs: number;
  startTimestamp: number | null; // Date.now() when started, accounting for already-elapsed time
}

interface StopwatchContextValue extends StopwatchState {
  start: () => void;
  stop: () => void;
  reset: () => void;
  /** Returns elapsed time as hh:mm string (rounded to full minutes) */
  getHHMM: () => string;
}

// ─── Persistence ──────────────────────────────────────────────────────────────

const LS_KEY = "ireport_stopwatch_state";

interface PersistedState {
  isRunning: boolean;
  startTimestamp: number | null;
  pausedElapsedMs: number;
}

function readPersistedState(): PersistedState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw)
      return { isRunning: false, startTimestamp: null, pausedElapsedMs: 0 };
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      isRunning: parsed.isRunning ?? false,
      startTimestamp: parsed.startTimestamp ?? null,
      pausedElapsedMs: parsed.pausedElapsedMs ?? 0,
    };
  } catch {
    return { isRunning: false, startTimestamp: null, pausedElapsedMs: 0 };
  }
}

function writePersistedState(state: PersistedState) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function clearPersistedState() {
  try {
    localStorage.removeItem(LS_KEY);
  } catch {
    /* ignore */
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

const StopwatchContext = createContext<StopwatchContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function StopwatchProvider({ children }: { children: React.ReactNode }) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Derive initial state from localStorage
  const [isRunning, setIsRunning] = useState<boolean>(() => {
    const p = readPersistedState();
    return p.isRunning && p.startTimestamp !== null;
  });

  const [elapsedMs, setElapsedMs] = useState<number>(() => {
    const p = readPersistedState();
    if (p.isRunning && p.startTimestamp !== null) {
      return Date.now() - p.startTimestamp + p.pausedElapsedMs;
    }
    return p.pausedElapsedMs;
  });

  // Track the effective start anchor: Date.now() - alreadyElapsedMs when started
  // Stored as a ref so interval always reads the latest value without re-creating
  const startAnchorRef = useRef<number | null>(null);

  // On mount: if the stopwatch was running, restore and resume interval
  useEffect(() => {
    const p = readPersistedState();
    if (p.isRunning && p.startTimestamp !== null) {
      // startTimestamp stored is already the anchor (Date.now() - pausedElapsedMs at start time)
      startAnchorRef.current = p.startTimestamp;
      const anchor = p.startTimestamp;
      intervalRef.current = setInterval(() => {
        setElapsedMs(Date.now() - anchor);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = useCallback(() => {
    setIsRunning((running) => {
      if (running) return running;

      setElapsedMs((prev) => {
        // anchor = now - already elapsed
        const anchor = Date.now() - prev;
        startAnchorRef.current = anchor;

        // Persist: running=true, startTimestamp=anchor, pausedElapsedMs=0 (anchor absorbs it)
        writePersistedState({
          isRunning: true,
          startTimestamp: anchor,
          pausedElapsedMs: 0,
        });

        intervalRef.current = setInterval(() => {
          setElapsedMs(Date.now() - anchor);
        }, 1000);

        return prev; // don't change elapsed here, interval will update it
      });

      return true;
    });
  }, []);

  const stop = useCallback(() => {
    setIsRunning((running) => {
      if (!running) return running;

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      setElapsedMs((current) => {
        // Persist stopped state with final elapsed
        writePersistedState({
          isRunning: false,
          startTimestamp: null,
          pausedElapsedMs: current,
        });
        return current;
      });

      startAnchorRef.current = null;
      return false;
    });
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setElapsedMs(0);
    startAnchorRef.current = null;
    clearPersistedState();
  }, []);

  const getHHMM = useCallback((): string => {
    const totalMinutes = Math.round(elapsedMs / 60000);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }, [elapsedMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <StopwatchContext.Provider
      value={{
        isRunning,
        elapsedMs,
        startTimestamp: startAnchorRef.current,
        start,
        stop,
        reset,
        getHHMM,
      }}
    >
      {children}
    </StopwatchContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStopwatch(): StopwatchContextValue {
  const ctx = useContext(StopwatchContext);
  if (!ctx)
    throw new Error("useStopwatch must be used within StopwatchProvider");
  return ctx;
}
