// ── Stopwatch ────────────────────────────────────────────────

export interface Lap {
  /** Lap number (1-indexed) */
  number: number;
  /** Split time in ms (time since previous lap or start) */
  splitMs: number;
  /** Cumulative time in ms (time since stopwatch start) */
  cumulativeMs: number;
}

export interface StopwatchState {
  /** Whether the stopwatch is currently running */
  isRunning: boolean;
  /** Unix timestamp (ms) when the stopwatch was last started/resumed */
  startedAt: number | null;
  /** Accumulated elapsed time (ms) from previous run segments (before current start) */
  pausedElapsed: number;
  /** Recorded laps */
  laps: Lap[];
}

// ── Timers ───────────────────────────────────────────────────

export interface Timer {
  /** Unique identifier */
  id: string;
  /** User-provided label (optional) */
  name: string;
  /** Original duration in ms */
  durationMs: number;
  /** Unix timestamp (ms) when the timer was started */
  startedAt: number;
  /** Accumulated elapsed time (ms) from segments before the latest resume */
  pausedElapsed: number;
  /** Whether the timer is currently counting down */
  isRunning: boolean;
  /** Whether the timer has completed */
  isCompleted: boolean;
  /** Unix timestamp (ms) when the timer completed (null if still active) */
  completedAt: number | null;
}

export interface RecentDuration {
  /** Duration in ms */
  durationMs: number;
  /** Human-readable label, e.g. "5m", "1h 30m" */
  label: string;
  /** Unix timestamp of last use */
  lastUsedAt: number;
}

// ── World Clock ──────────────────────────────────────────────

export interface WorldClockZone {
  /** Display name, e.g. "New York" */
  label: string;
  /** IANA timezone identifier, e.g. "America/New_York" */
  timezone: string;
}

// ── Pomodoro ─────────────────────────────────────────────────

export type PomodoroSessionType = "work" | "shortBreak" | "longBreak";

export interface PomodoroState {
  /** Current session type */
  sessionType: PomodoroSessionType;
  /** Number of completed work sessions in current cycle */
  completedPomodoros: number;
  /** Unix timestamp (ms) when the current session was started */
  startedAt: number | null;
  /** Accumulated elapsed time (ms) from segments before the latest resume */
  pausedElapsed: number;
  /** Whether the timer is currently counting down */
  isRunning: boolean;
  /** Original duration of current session in ms (set on session start) */
  currentSessionDurationMs: number;
  /** Unix timestamp (ms) when the last session change happened (for tracking) */
  lastSessionChange: number;
}
