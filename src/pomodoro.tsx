import {
  ActionPanel,
  Action,
  List,
  Icon,
  Color,
  Toast,
  showToast,
} from "@raycast/api";
import { usePomodoro } from "./lib/usePomodoro";
import { formatRemaining } from "./lib/formatTime";

export default function PomodoroCommand() {
  const {
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
  } = usePomodoro();

  const remaining = getRemaining();
  const sessionLabel = getSessionLabel();
  const progress = Math.round(
    ((state.currentSessionDurationMs - remaining) /
      state.currentSessionDurationMs) *
      100,
  );

  // Determine icon and color based on session type
  const getSessionIcon = () => {
    switch (state.sessionType) {
      case "work":
        return { source: Icon.Stopwatch, tintColor: Color.Red };
      case "shortBreak":
        return { source: Icon.Clock, tintColor: Color.Green };
      case "longBreak":
        return { source: Icon.Moon, tintColor: Color.Blue };
    }
  };

  const getSessionColor = (): Color => {
    switch (state.sessionType) {
      case "work":
        return Color.Red;
      case "shortBreak":
        return Color.Green;
      case "longBreak":
        return Color.Blue;
    }
  };

  const handleStart = async () => {
    await startSession();
    if (!state.isRunning) {
      await showToast({
        style: Toast.Style.Success,
        title: isBreak ? "Break Started" : "Pomodoro Started",
        message: isBreak
          ? "Take a moment to relax!"
          : "Focus for 25 minutes!",
      });
    }
  };

  const handlePause = async () => {
    await pause();
    await showToast({
      style: Toast.Style.Success,
      title: "Paused",
      message: `${sessionLabel} paused`,
    });
  };

  const handleReset = async () => {
    await reset();
    await showToast({
      style: Toast.Style.Success,
      title: "Reset",
      message: "Pomodoro timer reset to start",
    });
  };

  const handleSkip = async () => {
    const wasWork = state.sessionType === "work";
    const nextSession = wasWork
      ? (state.completedPomodoros + 1) % 4 === 0
        ? "Long Break"
        : "Short Break"
      : "Work Session";

    await skip();
    await showToast({
      style: Toast.Style.Success,
      title: "Skipped",
      message: `Moved to ${nextSession}`,
    });
  };

  const handleStartFresh = async () => {
    await startWork();
    await showToast({
      style: Toast.Style.Success,
      title: "Fresh Start",
      message: "Reset progress and started new Pomodoro",
    });
  };

  // Empty state when no session has been started
  const isEmpty = state.startedAt === null && state.pausedElapsed === 0;

  return (
    <List
      isLoading={isLoading}
      navigationTitle="Pomodoro Timer"
    >
      {/* Main Timer Display */}
      <List.Section title={isEmpty ? "" : sessionLabel}>
        <List.Item
          title={formatRemaining(remaining)}
          subtitle={
            isEmpty
              ? "Click to start a Pomodoro"
              : state.isRunning
                ? `${state.sessionType === "work" ? "Focus time!" : "Relax..."}`
                : "Paused - Click to continue"
          }
          icon={getSessionIcon()}
          accessories={
            isEmpty
              ? []
              : [
                  {
                    tag: {
                      value: `${progress}%`,
                      color: getSessionColor(),
                    },
                  },
                  {
                    text: `Pomodoro ${state.completedPomodoros}/4`,
                  },
                ]
          }
          actions={
            <ActionPanel>
              {!state.isRunning ? (
                <Action
                  title={isEmpty ? "Start Pomodoro" : "Resume"}
                  icon={Icon.Play}
                  onAction={handleStart}
                />
              ) : (
                <Action
                  title="Pause"
                  icon={Icon.Pause}
                  onAction={handlePause}
                />
              )}

              <ActionPanel.Section>
                {isBreak && (
                  <Action
                    title="Skip Break"
                    icon={Icon.ArrowRight}
                    shortcut={{
                      Windows: { modifiers: ["ctrl"], key: "b" },
                      macOS: { modifiers: ["cmd"], key: "b" },
                    }}
                    onAction={async () => {
                      await skipBreak();
                      await showToast({
                        style: Toast.Style.Success,
                        title: "Break Skipped",
                        message: "Ready to work?",
                      });
                    }}
                  />
                )}
                <Action
                  title="Skip to Next"
                  icon={Icon.ArrowRight}
                  shortcut={{
                    Windows: { modifiers: ["ctrl"], key: "s" },
                    macOS: { modifiers: ["cmd"], key: "s" },
                  }}
                  onAction={handleSkip}
                />
              </ActionPanel.Section>

              <ActionPanel.Section>
                {!isEmpty && (
                  <Action
                    title="Reset to Start"
                    icon={Icon.ArrowCounterClockwise}
                    shortcut={{
                      Windows: { modifiers: ["ctrl", "shift"], key: "r" },
                      macOS: { modifiers: ["cmd", "shift"], key: "r" },
                    }}
                    style={Action.Style.Destructive}
                    onAction={handleReset}
                  />
                )}
                <Action
                  title="Fresh Start (Clear Progress)"
                  icon={Icon.Trash}
                  shortcut={{
                    Windows: { modifiers: ["ctrl", "shift"], key: "f" },
                    macOS: { modifiers: ["cmd", "shift"], key: "f" },
                  }}
                  style={Action.Style.Destructive}
                  onAction={handleStartFresh}
                />
              </ActionPanel.Section>
            </ActionPanel>
          }
        />
      </List.Section>

      {/* Session Progress Section */}
      {!isEmpty && (
        <List.Section title="Session Progress">
          {Array.from({ length: 4 }, (_, i) => {
            const isCompleted = i < state.completedPomodoros;
            const isCurrent = i === state.completedPomodoros && state.sessionType === "work";

            return (
              <List.Item
                key={i}
                title={`Pomodoro ${i + 1}`}
                subtitle={
                  isCompleted
                    ? "Completed ✓"
                    : isCurrent
                      ? "In progress"
                      : "Upcoming"
                }
                icon={{
                  source: isCompleted
                    ? Icon.CheckCircle
                    : isCurrent
                      ? Icon.CircleProgress
                      : Icon.Circle,
                  tintColor: isCompleted
                    ? Color.Green
                    : isCurrent
                      ? getSessionColor()
                      : Color.SecondaryText,
                }}
                accessories={[
                  {
                    text: isCompleted
                      ? "🍅 Done"
                      : isCurrent
                        ? `${Math.ceil(remaining / 60000)} min left`
                        : "—",
                  },
                ]}
              />
            );
          })}
        </List.Section>
      )}

      {/* Info Section */}
      <List.Section title="About Pomodoro">
        <List.Item
          title="Work Sessions"
          subtitle="25 minutes of focused work"
          icon={{ source: Icon.Stopwatch, tintColor: Color.Red }}
        />
        <List.Item
          title="Short Breaks"
          subtitle="5 minutes to recharge"
          icon={{ source: Icon.Clock, tintColor: Color.Green }}
        />
        <List.Item
          title="Long Breaks"
          subtitle="15 minutes after 4 pomodoros"
          icon={{ source: Icon.Moon, tintColor: Color.Blue }}
        />
      </List.Section>

      {/* Keyboard Shortcuts */}
      <List.Section title="Keyboard Shortcuts">
        <List.Item
          title="Skip to Next"
          subtitle="Skip current session"
          icon={Icon.Keyboard}
          accessories={[{ text: "Ctrl+S" }]}
        />
        {isBreak && (
          <List.Item
            title="Skip Break"
            subtitle="Jump directly to work"
            icon={Icon.Keyboard}
            accessories={[{ text: "Ctrl+B" }]}
          />
        )}
        <List.Item
          title="Reset to Start"
          subtitle="Keep progress, restart timer"
          icon={Icon.Keyboard}
          accessories={[{ text: "Ctrl+Shift+R" }]}
        />
        <List.Item
          title="Fresh Start"
          subtitle="Clear all progress"
          icon={Icon.Keyboard}
          accessories={[{ text: "Ctrl+Shift+F" }]}
        />
      </List.Section>
    </List>
  );
}
