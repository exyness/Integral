# Pomodoro Timer - Design

## Overview

The Pomodoro Timer feature provides comprehensive focus management with customizable work/break intervals, session tracking with pause functionality, task association, session history, and statistics. The design emphasizes productivity tracking, interruption handling, and seamless integration with the existing task management system.

**Key Design Decisions:**

1. **Optimistic Updates**: All mutations update the UI immediately before server confirmation to provide instant feedback, with automatic rollback on failure
2. **URL State Synchronization**: Mode selection is reflected in the URL, enabling bookmarking, browser navigation, and deep linking
3. **Pause Time Tracking**: Separate tracking of pause duration ensures accurate time reporting and session analytics
4. **Session Creation on Start**: Sessions are created when the timer starts (not when it completes) to enable pause/resume functionality
5. **Auto-start with User Override**: Automatic session transitions with countdown and cancel option for user control

## Architecture

### Timer State Machine

```
IDLE → START → RUNNING → PAUSE → RUNNING → COMPLETE → IDLE
                   ↓
                 STOP → IDLE
```

### Data Flow

```
User Starts → Create Session → Timer Countdown → Complete → Save Session
                                      ↓
                                   Pause/Resume
                                      ↓
                                Track Pause Time
```

## Database Schema

### pomodoro_sessions table

```sql
CREATE TABLE pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  task_id UUID REFERENCES tasks,
  session_type TEXT CHECK (session_type IN ('work', 'short_break', 'long_break')) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  is_paused BOOLEAN DEFAULT false,
  paused_at TIMESTAMPTZ,
  total_paused_seconds INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pomodoro_sessions_user_id ON pomodoro_sessions(user_id);
CREATE INDEX idx_pomodoro_sessions_task_id ON pomodoro_sessions(task_id);
CREATE INDEX idx_pomodoro_sessions_started_at ON pomodoro_sessions(started_at DESC);
```

### pomodoro_settings table

```sql
CREATE TABLE pomodoro_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users UNIQUE NOT NULL,
  work_duration INTEGER DEFAULT 25,
  short_break_duration INTEGER DEFAULT 5,
  long_break_duration INTEGER DEFAULT 15,
  sessions_until_long_break INTEGER DEFAULT 4,
  auto_start_breaks BOOLEAN DEFAULT false,
  auto_start_work BOOLEAN DEFAULT false,
  sound_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pomodoro_settings_user_id ON pomodoro_settings(user_id);
```

## Type Definitions

```typescript
type PomodoroMode = "work" | "short_break" | "long_break";

interface PomodoroSession {
  id: string;
  user_id: string;
  task_id: string | null;
  session_type: PomodoroMode;
  duration_minutes: number;
  completed: boolean;
  started_at: string;
  completed_at: string | null;
  is_paused: boolean;
  paused_at: string | null;
  total_paused_seconds: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface PomodoroSettings {
  work_duration: number;
  short_break_duration: number;
  long_break_duration: number;
  sessions_until_long_break: number;
  auto_start_breaks: boolean;
  auto_start_work: boolean;
  sound_enabled: boolean;
}

interface TimerState {
  mode: PomodoroMode;
  timeLeft: number; // seconds
  isRunning: boolean;
  isPaused: boolean;
  currentSession: PomodoroSession | null;
  selectedTaskId: string | null;
}
```

**Rationale**: Explicit types for session modes improve type safety. Nullable fields allow optional features. Separate pause tracking enables accurate time reporting.

## Component Structure

### Pages

- **Pomodoro.tsx**: Main Pomodoro page with mode navigation, URL state management, and view switching

### Components

#### Timer Components

- **PomodoroTimer**: Main timer display with circular progress, controls, and task association
- **AnimatedNumbers**: Smooth number transitions for time display using Framer Motion

#### Statistics Components

- **PomodoroStats**: Statistics cards showing total sessions, completed sessions, work time, completion rate

#### History Components

- **PomodoroHistory**: Virtualized list of session history with pagination

#### Settings Components

- **PomodoroSettingsModal**: Settings form with all configuration options

### Hooks

- **usePomodoro**: Centralized timer logic, session management, settings, and statistics

## State Management

### TanStack Query Configuration

```typescript
// Query Keys
const pomodoroKeys = {
  settings: (userId: string) => ["pomodoro-settings", userId] as const,
  sessions: (userId: string, limit: number) =>
    ["pomodoro-sessions", userId, limit] as const,
  stats: (userId: string) => ["pomodoro-stats", userId] as const,
};

// Query Options
const queryConfig = {
  settings: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  },
  sessions: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },
  stats: {
    staleTime: 5 * 60 * 1000, // 5 minutes
  },
};
```

### Optimistic Update Pattern

```typescript
// Session Creation
onMutate: async (newSession) => {
  await queryClient.cancelQueries({ queryKey: pomodoroKeys.sessions(userId, limit) });
  const previousSessions = queryClient.getQueryData(pomodoroKeys.sessions(userId, limit));

  // Session is added to cache immediately
  return { previousSessions };
},
onSuccess: (data) => {
  queryClient.setQueryData(pomodoroKeys.sessions(userId, limit), (old) => [data, ...(old || [])]);
},
onError: (err, variables, context) => {
  queryClient.setQueryData(pomodoroKeys.sessions(userId, limit), context.previousSessions);
  toast.error("Failed to create session");
},
```

**Rationale**: Optimistic updates provide instant feedback. Sessions are added to the beginning of the array (most recent first). Rollback on error maintains data consistency.

### URL State Management

```typescript
// Mode State
const [searchParams, setSearchParams] = useSearchParams();
const modeFromUrl =
  (searchParams.get("mode") as PomodoroMode | "history") || "work";
const [currentMode, setCurrentMode] = useState<PomodoroMode | "history">(
  modeFromUrl
);

const handleModeChange = (mode: PomodoroMode | "history") => {
  setCurrentMode(mode);
  setSearchParams({ mode }, { replace: true });
};
```

**Rationale**: URL state enables bookmarking specific modes and browser back/forward navigation. Replace mode prevents cluttering history.

## Timer Logic

### Countdown Implementation

```typescript
useEffect(() => {
  if (!isRunning || isPaused) return;

  const interval = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        handleComplete();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(interval);
}, [isRunning, isPaused]);
```

**Rationale**: setInterval with 1-second intervals provides accurate countdown. Cleanup on unmount prevents memory leaks. Completion triggered at 0.

### Pause Time Tracking

```typescript
const handlePause = async () => {
  if (!currentSession) return;

  setPausedAt(new Date());
  setIsPaused(true);

  await pauseSession(currentSession.id);
};

const handleResume = async () => {
  if (!currentSession || !pausedAt) return;

  const pauseDuration = Math.floor((Date.now() - pausedAt.getTime()) / 1000);
  setTotalPausedSeconds((prev) => prev + pauseDuration);
  setIsPaused(false);

  await resumeSession(currentSession.id);
};
```

**Rationale**: Pause time tracked separately from session duration. Database stores cumulative pause time for accurate reporting.

### Session Lifecycle

1. **Start**: Create session record, set isRunning: true, start countdown
2. **Pause**: Record pause time, set isPaused: true, stop countdown
3. **Resume**: Calculate pause duration, add to total, set isPaused: false, continue countdown
4. **Stop**: Reset timer state, do not mark as completed
5. **Complete**: Mark session as completed, play sound, show notification, suggest next session

## UI Design

### Mode Navigation

Four modes with color coding:

1. **Work**: Red (#EF4444) - Focus session
2. **Short Break**: Green (#10B981) - Brief rest
3. **Long Break**: Blue (#3B82F6) - Extended rest
4. **History**: Purple (#8B5CF6) - Session list

**URL Pattern**: `/pomodoro?mode=work` or `/pomodoro?mode=history`

**Rationale**: Color coding provides visual distinction. URL state enables bookmarking specific modes.

### Timer Display

- Large circular progress ring (SVG)
- Progress percentage: (timeLeft / totalTime) × 100
- Time display in MM:SS format with AnimatedNumbers
- Session type label
- Task name (if associated)
- Mode-specific colors for progress ring

### Timer Controls

State-based button visibility:

- **Idle**: Show "Start" button
- **Running**: Show "Pause" and "Stop" buttons
- **Paused**: Show "Resume" and "Stop" buttons

**Rationale**: State-based UI prevents invalid actions. Clear visual feedback for current state.

### Statistics Cards

Four statistics displayed in glass cards:

```typescript
// Total Sessions
const totalSessions = sessions.length;

// Completed Sessions
const completedSessions = sessions.filter(s => s.completed).length;

// Total Work Time
const totalWorkMinutes = sessions
  .filter(s => s.completed && s.session_type === 'work')
  .reduce((sum, s) => sum + s.duration_minutes, 0);

// Completion Rate
const completionRate = totalSessions > 0
  ? (completedSessions / totalSessions) × 100
  : 0;
```

**Icons**:

- Total Sessions: Timer
- Completed Sessions: CheckCircle
- Total Work Time: Clock
- Completion Rate: TrendingUp

**Color Coding**:

- Halloween mode: Teal (#60c9b6)
- Normal mode: Mode-specific colors

### Session History

- Virtualized list using Virtuoso for performance
- Pagination with "Load More" (50 sessions per page)
- Session cards showing: type, duration, date/time, completion status, task, notes
- Inline notes editing
- Delete with confirmation
- Empty state with encouragement

### Settings Modal

Form fields:

- Work duration: Number input (1-60 minutes)
- Short break duration: Number input (1-30 minutes)
- Long break duration: Number input (1-60 minutes)
- Sessions until long break: Number input (1-10)
- Auto-start breaks: Toggle
- Auto-start work: Toggle
- Sound enabled: Toggle

Validation:

- Work duration: 1-60
- Short break duration: 1-30
- Long break duration: 1-60
- Sessions until long break: 1-10

**Default Settings**:

```typescript
{
  work_duration: 25,
  short_break_duration: 5,
  long_break_duration: 15,
  sessions_until_long_break: 4,
  auto_start_breaks: false,
  auto_start_work: false,
  sound_enabled: true,
}
```

## Auto-start Logic

### After Work Session

```typescript
if (settings.auto_start_breaks && sessionType === "work") {
  const workSessionsCompleted = getCompletedWorkSessionsCount();
  const nextBreakType =
    workSessionsCompleted % settings.sessions_until_long_break === 0
      ? "long_break"
      : "short_break";

  showCountdownToast(nextBreakType, 5); // 5 second countdown

  if (!userCancelled) {
    startSession(nextBreakType);
  }
}
```

### After Break Session

```typescript
if (
  settings.auto_start_work &&
  (sessionType === "short_break" || sessionType === "long_break")
) {
  showCountdownToast("work", 5); // 5 second countdown

  if (!userCancelled) {
    startSession("work");
  }
}
```

**Rationale**: Auto-start maintains flow. Countdown with cancel option gives user control. Long break timing based on session count.

## Task Association

- Optional task selector dropdown before starting session
- Fetches all user tasks from tasks table
- Stores task_id in session record
- Displays task name during session
- Sessions can exist without task association

**Rationale**: Optional association provides flexibility. Integration with task management enables time tracking per task.

## Sound Notifications

- Completion sound plays when session reaches zero
- Respects sound_enabled setting
- Uses Web Audio API or HTML5 audio element
- Handles playback errors gracefully

**Rationale**: Audio feedback reinforces completion. User control via settings.

## Error Handling

### Validation Errors

- Settings: Validate duration ranges, display inline errors
- Prevent form submission until valid
- Highlight invalid fields with red border

### Network Errors

- Display toast notification with error message
- Rollback optimistic updates
- Provide retry option for failed operations
- Log errors to console for debugging

### Timer Errors

- Handle interval cleanup on unmount
- Prevent multiple timers running simultaneously
- Validate session exists before pause/resume
- Handle missing settings gracefully (use defaults)

## Correctness Properties

### CP1: Timer Accuracy

**Property**: For any running session, the timer counts down exactly 1 second per second.

```typescript
setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
```

**Property**: For any paused session, the pause duration is tracked separately and added to total_paused_seconds.

```typescript
pauseDuration = currentTime - pausedAt;
totalPausedSeconds += pauseDuration;
```

**Property**: For any completed session, the actual work time equals duration_minutes minus total_paused_seconds.

```typescript
actualWorkTime = duration_minutes * 60 - total_paused_seconds;
```

**Validates**: Requirements 1.4, 2.2, 2.5, 2.7

### CP2: Session Lifecycle

**Property**: For any session creation, the session is added to the cache immediately and persists to database.

```typescript
createSession(data) → sessions.includes(newSession) === true (before server response)
```

**Property**: For any session pause, is_paused is set to true and paused_at is recorded.

```typescript
pauseSession(id) → session.is_paused === true && session.paused_at !== null
```

**Property**: For any session resume, is_paused is set to false and total_paused_seconds is updated.

```typescript
resumeSession(id) → session.is_paused === false && session.total_paused_seconds > 0
```

**Property**: For any session completion, completed is set to true and completed_at is recorded.

```typescript
completeSession(id) → session.completed === true && session.completed_at !== null
```

**Validates**: Requirements 2.1, 2.3, 2.4, 4.1, 4.6, 4.7, 10.2, 10.3, 10.4, 10.5

### CP3: Settings Persistence

**Property**: For any settings update, the changes are saved to database and applied immediately.

```typescript
updateSettings(newSettings) → settings === newSettings (immediately)
```

**Property**: For any user without settings, default settings are used.

```typescript
!userSettings → settings === DEFAULT_SETTINGS
```

**Property**: For any settings change, the timer uses the new durations for subsequent sessions.

```typescript
updateSettings({ work_duration: 30 }) → nextSession.duration_minutes === 30
```

**Validates**: Requirements 3.9, 3.10, 3.11

### CP4: Auto-start Logic

**Property**: For any completed work session with auto_start_breaks enabled, a break session starts automatically after countdown.

```typescript
completeSession(workSession) && settings.auto_start_breaks === true → startSession(breakType)
```

**Property**: For any completed break session with auto_start_work enabled, a work session starts automatically after countdown.

```typescript
completeSession(breakSession) && settings.auto_start_work === true → startSession('work')
```

**Property**: For any auto-start countdown, the user can cancel to prevent automatic start.

```typescript
showCountdown() && userClicksCancel() → !startSession()
```

**Property**: For any session count equal to sessions_until_long_break, the next break is a long break.

```typescript
workSessionsCompleted % settings.sessions_until_long_break === 0 → nextBreak === 'long_break'
```

**Validates**: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8

### CP5: Statistics Accuracy

**Property**: For any statistics calculation, total sessions equals the count of all sessions.

```typescript
stats.total === sessions.length;
```

**Property**: For any statistics calculation, completed sessions equals the count of sessions with completed: true.

```typescript
stats.completed === sessions.filter((s) => s.completed).length;
```

**Property**: For any statistics calculation, total work time equals the sum of completed work session durations.

```typescript
stats.totalMinutes ===
  sessions
    .filter((s) => s.completed && s.session_type === "work")
    .reduce((sum, s) => sum + s.duration_minutes, 0);
```

**Property**: For any statistics calculation, completion rate equals (completed / total) × 100.

```typescript
stats.completionRate === (stats.completed / stats.total) * 100;
```

**Validates**: Requirements 6.1, 6.2, 6.3, 6.4, 6.8

### CP6: URL State Synchronization

**Property**: For any mode selection, the URL contains the mode query parameter with the selected mode.

```typescript
setCurrentMode(mode) → window.location.search.includes(`mode=${mode}`)
```

**Property**: For any URL with mode parameter, loading the page restores the corresponding mode.

```typescript
window.location.search.includes("mode=work") → currentMode === "work"
```

**Property**: For any browser back/forward navigation, the application state matches the URL parameters.

```typescript
browserBack() → applicationState === stateFromURL(window.location.search)
```

**Validates**: Requirements 11.1, 11.2, 11.4, 11.5
