import { LocalStorage } from "@raycast/api";
import type {
  StopwatchState,
  Timer,
  RecentDuration,
  WorldClockZone,
  PomodoroState,
} from "./types";

// ── Storage Keys ─────────────────────────────────────────────

const KEYS = {
  STOPWATCH: "stopwatch-state",
  TIMERS: "timers",
  RECENT_DURATIONS: "recent-durations",
  WORLD_CLOCK_ZONES: "world-clock-zones",
  POMODORO: "pomodoro-state",
} as const;

// ── Generic helpers ──────────────────────────────────────────

async function getJSON<T>(key: string): Promise<T | null> {
  const raw = await LocalStorage.getItem<string>(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function setJSON<T>(key: string, value: T): Promise<void> {
  await LocalStorage.setItem(key, JSON.stringify(value));
}

// ── Stopwatch ────────────────────────────────────────────────

const DEFAULT_STOPWATCH: StopwatchState = {
  isRunning: false,
  startedAt: null,
  pausedElapsed: 0,
  laps: [],
};

export async function getStopwatch(): Promise<StopwatchState> {
  return (
    (await getJSON<StopwatchState>(KEYS.STOPWATCH)) ?? { ...DEFAULT_STOPWATCH }
  );
}

export async function setStopwatch(state: StopwatchState): Promise<void> {
  await setJSON(KEYS.STOPWATCH, state);
}

// ── Timers ───────────────────────────────────────────────────

export async function getTimers(): Promise<Timer[]> {
  return (await getJSON<Timer[]>(KEYS.TIMERS)) ?? [];
}

export async function setTimers(timers: Timer[]): Promise<void> {
  await setJSON(KEYS.TIMERS, timers);
}

// ── Recent Durations ─────────────────────────────────────────

const MAX_RECENTS = 5;

export async function getRecentDurations(): Promise<RecentDuration[]> {
  return (await getJSON<RecentDuration[]>(KEYS.RECENT_DURATIONS)) ?? [];
}

export async function addRecentDuration(
  duration: RecentDuration,
): Promise<void> {
  const recents = await getRecentDurations();

  // Remove existing entry with same duration
  const filtered = recents.filter((r) => r.durationMs !== duration.durationMs);

  // Add new entry at the front
  filtered.unshift(duration);

  // Keep only the most recent N
  await setJSON(KEYS.RECENT_DURATIONS, filtered.slice(0, MAX_RECENTS));
}

// ── World Clock ──────────────────────────────────────────────

const DEFAULT_ZONES: WorldClockZone[] = [
  { label: "UTC", timezone: "UTC" },
  { label: "New York", timezone: "America/New_York" },
  { label: "London", timezone: "Europe/London" },
  { label: "Tokyo", timezone: "Asia/Tokyo" },
];

export async function getWorldClockZones(): Promise<WorldClockZone[]> {
  const zones = await getJSON<WorldClockZone[]>(KEYS.WORLD_CLOCK_ZONES);
  if (!zones || zones.length === 0) {
    // Initialize with defaults on first use
    await setJSON(KEYS.WORLD_CLOCK_ZONES, DEFAULT_ZONES);
    return [...DEFAULT_ZONES];
  }
  return zones;
}

export async function setWorldClockZones(
  zones: WorldClockZone[],
): Promise<void> {
  await setJSON(KEYS.WORLD_CLOCK_ZONES, zones);
}

// ── Pomodoro ─────────────────────────────────────────────────

// Default Pomodoro durations (in milliseconds)
export const POMODORO_DURATIONS = {
  work: 25 * 60 * 1000, // 25 minutes
  shortBreak: 5 * 60 * 1000, // 5 minutes
  longBreak: 15 * 60 * 1000, // 15 minutes
} as const;

// Number of work sessions before a long break
export const POMODOROS_BEFORE_LONG_BREAK = 4;

const DEFAULT_POMODORO: PomodoroState = {
  sessionType: "work",
  completedPomodoros: 0,
  startedAt: null,
  pausedElapsed: 0,
  isRunning: false,
  currentSessionDurationMs: POMODORO_DURATIONS.work,
  lastSessionChange: Date.now(),
};

export async function getPomodoro(): Promise<PomodoroState> {
  const stored = await getJSON<PomodoroState>(KEYS.POMODORO);
  if (!stored) {
    return { ...DEFAULT_POMODORO };
  }
  // Merge with defaults to handle any future field additions
  return {
    sessionType: stored.sessionType ?? DEFAULT_POMODORO.sessionType,
    completedPomodoros:
      stored.completedPomodoros ?? DEFAULT_POMODORO.completedPomodoros,
    startedAt: stored.startedAt ?? DEFAULT_POMODORO.startedAt,
    pausedElapsed: stored.pausedElapsed ?? DEFAULT_POMODORO.pausedElapsed,
    isRunning: stored.isRunning ?? DEFAULT_POMODORO.isRunning,
    currentSessionDurationMs:
      stored.currentSessionDurationMs ??
      DEFAULT_POMODORO.currentSessionDurationMs,
    lastSessionChange:
      stored.lastSessionChange ?? DEFAULT_POMODORO.lastSessionChange,
  };
}

export async function setPomodoro(state: PomodoroState): Promise<void> {
  await setJSON(KEYS.POMODORO, state);
}
