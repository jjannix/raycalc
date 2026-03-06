import { LocalStorage } from "@raycast/api";
import type {
  StopwatchState,
  Timer,
  RecentDuration,
  WorldClockZone,
} from "./types";

// ── Storage Keys ─────────────────────────────────────────────

const KEYS = {
  STOPWATCH: "stopwatch-state",
  TIMERS: "timers",
  RECENT_DURATIONS: "recent-durations",
  WORLD_CLOCK_ZONES: "world-clock-zones",
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
