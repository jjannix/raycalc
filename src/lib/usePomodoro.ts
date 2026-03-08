import { showToast, Toast } from "@raycast/api";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PomodoroSessionType, PomodoroState } from "./types";
import { playSound } from "./sounds";
import {
  getPomodoro,
  setPomodoro,
  POMODORO_DURATIONS,
  POMODOROS_BEFORE_LONG_BREAK,
} from "./storage";

const UPDATE_INTERVAL = 1000; // 1 second for countdown display

function playTimerSound() {
  playSound("chime");
}

interface UsePomodoroReturn {
  /** Current Pomodoro state */
  state: PomodoroState;
  /** Whether the initial state is still loading */
  isLoading: boolean;
  /** Start a new Pomodoro work session */
  startWork: () => Promise<void>;
  /** Start the current session (resume if paused, or start fresh) */
  startSession: () => Promise<void>;
  /** Pause the current session */
  pause: () => Promise<void>;
  /** Reset to initial work session */
  reset: () => Promise<void>;
  /** Skip to next session */
  skip: () => Promise<void>;
  /** Skip the current break and go to work */
  skipBreak: () => Promise<void>;
  /** Get the remaining time in ms for the current session */
  getRemaining: () => number;
  /** Get the session label for display */
  getSessionLabel: () => string;
  /** Whether the current session is a break */
  isBreak: boolean;
  /** Current tick timestamp -- changes every second to trigger re-renders */
  tick: number;
}

/**
 * React hook that manages a Pomodoro timer with auto-progression between
 * work and break sessions.
 *
 * The Pomodoro technique alternates between:
 * - 25-minute work sessions
 * - 5-minute short breaks (after each work session)
 * - 15-minute long breaks (after 4 work sessions)
 */
export function usePomodoro(): UsePomodoroReturn {
  const [state, setState] = useState<PomodoroState>({
    sessionType: "work",
    completedPomodoros: 0,
    startedAt: null,
    pausedElapsed: 0,
    isRunning: false,
    currentSessionDurationMs: POMODORO_DURATIONS.work,
    lastSessionChange: Date.now(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [tick, setTick] = useState(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completionHandledRef = useRef(false);

  // Persist and update state
  const persist = useCallback(async (newState: PomodoroState) => {
    setState(newState);
    await setPomodoro(newState);
  }, []);

  // Load initial state and handle app restart scenario
  useEffect(() => {
    (async () => {
      const stored = await getPomodoro();

      // Handle app restart with a running session
      if (stored.isRunning && stored.startedAt) {
        const now = Date.now();
        const elapsedWhileClosed = now - stored.startedAt;
        const totalElapsed = stored.pausedElapsed + elapsedWhileClosed;
        const remaining = stored.currentSessionDurationMs - totalElapsed;

        if (remaining <= 0) {
          // Session completed while app was closed
          const nextSession = getNextSession(
            stored.sessionType,
            stored.completedPomodoros,
          );
          const nextDuration = getDurationForSession(nextSession);
          let newCompletedCount = stored.completedPomodoros;
          if (stored.sessionType === "work") {
            newCompletedCount += 1;
          }

          // Start the next session but paused
          const recoveredState: PomodoroState = {
            sessionType: nextSession,
            completedPomodoros: newCompletedCount,
            startedAt: null,
            pausedElapsed: 0,
            isRunning: false,
            currentSessionDurationMs: nextDuration,
            lastSessionChange: now,
          };
          setState(recoveredState);

          // Show notification about what happened
          const sessionLabel =
            stored.sessionType === "work"
              ? "Work Session Complete!"
              : `${stored.sessionType === "shortBreak" ? "Short" : "Long"} Break Over!`;
          showToast({
            style: Toast.Style.Success,
            title: sessionLabel,
            message: `${getSessionLabelForType(nextSession)} is ready to start.`,
          });
        } else {
          // Session still running - adjust for elapsed time and start paused
          setState({
            ...stored,
            pausedElapsed: totalElapsed,
            startedAt: null,
            isRunning: false, // Start paused so user can resume
          });
        }
      } else {
        setState(stored);
      }
      setIsLoading(false);
    })();
  }, []);

  // Helper functions (outside of useCallbacks to avoid dependency issues)
  const getNextSession = (
    currentType: PomodoroSessionType,
    completedCount: number,
  ): PomodoroSessionType => {
    if (currentType === "work") {
      if ((completedCount + 1) % POMODOROS_BEFORE_LONG_BREAK === 0) {
        return "longBreak";
      }
      return "shortBreak";
    }
    return "work";
  };

  const getDurationForSession = (sessionType: PomodoroSessionType): number => {
    switch (sessionType) {
      case "work":
        return POMODORO_DURATIONS.work;
      case "shortBreak":
        return POMODORO_DURATIONS.shortBreak;
      case "longBreak":
        return POMODORO_DURATIONS.longBreak;
    }
  };

  const getSessionLabelForType = (sessionType: PomodoroSessionType): string => {
    switch (sessionType) {
      case "work":
        return "Work Session";
      case "shortBreak":
        return "Short Break";
      case "longBreak":
        return "Long Break";
    }
  };

  // Get remaining time in ms
  const getRemaining = useCallback((): number => {
    if (!state.isRunning || state.startedAt === null) {
      return state.currentSessionDurationMs - state.pausedElapsed;
    }
    const elapsed = state.pausedElapsed + (Date.now() - state.startedAt);
    return Math.max(0, state.currentSessionDurationMs - elapsed);
  }, [state]);

  // Get session label for display
  const getSessionLabel = useCallback((): string => {
    return getSessionLabelForType(state.sessionType);
  }, [state.sessionType]);

  // Is current session a break?
  const isBreak = state.sessionType === "shortBreak" || state.sessionType === "longBreak";

  // Start a completely fresh work session (resets progress)
  const startWork = useCallback(async () => {
    const newState: PomodoroState = {
      sessionType: "work",
      completedPomodoros: 0,
      startedAt: Date.now(),
      pausedElapsed: 0,
      isRunning: true,
      currentSessionDurationMs: POMODORO_DURATIONS.work,
      lastSessionChange: Date.now(),
    };
    completionHandledRef.current = false;
    await persist(newState);
  }, [persist]);

  // Start or resume the current session
  const startSession = useCallback(async () => {
    if (state.startedAt === null) {
      // Fresh start of current session type
      completionHandledRef.current = false;
      await persist({
        ...state,
        startedAt: Date.now(),
        isRunning: true,
        pausedElapsed: 0,
      });
    } else {
      // Resume paused session
      await persist({
        ...state,
        startedAt: Date.now(),
        isRunning: true,
      });
    }
  }, [state, persist]);

  // Pause the current session
  const pause = useCallback(async () => {
    if (!state.isRunning || state.startedAt === null) return;

    const now = Date.now();
    const elapsed = state.pausedElapsed + (now - state.startedAt);

    await persist({
      ...state,
      isRunning: false,
      pausedElapsed: elapsed,
      startedAt: null, // Clear to indicate fresh pause
    });
  }, [state, persist]);

  // Reset to initial state
  const reset = useCallback(async () => {
    completionHandledRef.current = false;
    const newState: PomodoroState = {
      sessionType: "work",
      completedPomodoros: 0,
      startedAt: null,
      pausedElapsed: 0,
      isRunning: false,
      currentSessionDurationMs: POMODORO_DURATIONS.work,
      lastSessionChange: Date.now(),
    };
    await persist(newState);
  }, [persist]);

  // Skip to next session
  const skip = useCallback(async () => {
    const nextSession = getNextSession(state.sessionType, state.completedPomodoros);
    const nextDuration = getDurationForSession(nextSession);

    let newCompletedCount = state.completedPomodoros;
    if (state.sessionType === "work") {
      newCompletedCount += 1;
    }

    completionHandledRef.current = false;
    const newState: PomodoroState = {
      sessionType: nextSession,
      completedPomodoros: newCompletedCount,
      startedAt: null,
      pausedElapsed: 0,
      isRunning: false, // Start paused for next session
      currentSessionDurationMs: nextDuration,
      lastSessionChange: Date.now(),
    };
    await persist(newState);
  }, [state, persist]);

  // Skip break and go directly to work
  const skipBreak = useCallback(async () => {
    if (!isBreak) return; // Only works during breaks

    completionHandledRef.current = false;
    const newState: PomodoroState = {
      sessionType: "work",
      completedPomodoros: state.completedPomodoros,
      startedAt: null,
      pausedElapsed: 0,
      isRunning: false,
      currentSessionDurationMs: POMODORO_DURATIONS.work,
      lastSessionChange: Date.now(),
    };
    await persist(newState);
  }, [state, persist, isBreak]);

  // Handle session completion
  const handleSessionComplete = useCallback(() => {
    if (completionHandledRef.current) return;
    completionHandledRef.current = true;

    const nextSession = getNextSession(state.sessionType, state.completedPomodoros);
    const nextDuration = getDurationForSession(nextSession);

    let newCompletedCount = state.completedPomodoros;
    if (state.sessionType === "work") {
      newCompletedCount += 1;
    }

    const newState: PomodoroState = {
      sessionType: nextSession,
      completedPomodoros: newCompletedCount,
      startedAt: null,
      pausedElapsed: 0,
      isRunning: false, // Start paused - user chooses when to start next session
      currentSessionDurationMs: nextDuration,
      lastSessionChange: Date.now(),
    };

    // Update state
    setState(newState);
    setPomodoro(newState); // fire-and-forget persist

    // Play sound and show notification
    playTimerSound();

    const sessionLabel =
      state.sessionType === "work"
        ? "Work Session Complete! 🍅"
        : `${state.sessionType === "shortBreak" ? "Short" : "Long"} Break Over!`;
    const nextLabel =
      nextSession === "work"
        ? "Ready to focus?"
        : `Time for a ${nextSession === "shortBreak" ? "short" : "long"} break.`;

    showToast({
      style: Toast.Style.Success,
      title: sessionLabel,
      message: nextLabel,
    });
  }, [state, getNextSession, getDurationForSession]);

  // Interval for live updates + session completion detection
  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = setInterval(() => {
        setTick(Date.now());

        // Check for session completion
        if (getRemaining() <= 0) {
          handleSessionComplete();
        }
      }, UPDATE_INTERVAL);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.isRunning, getRemaining, handleSessionComplete]);

  return {
    state,
    isLoading,
    startWork,
    startSession,
    pause,
    reset,
    skip,
    skipBreak,
    getRemaining,
    getSessionLabel,
    isBreak,
    tick,
  };
}
