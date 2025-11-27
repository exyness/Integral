# Time Tracking - Design

## Overview

The Time Tracking feature provides comprehensive time tracking with start/stop timers, manual time entry, task association, filtering, statistics, and a persistent floating timer widget. The design emphasizes accurate time tracking, real-time feedback, and seamless integration with the existing task management system.

**Key Design Decisions:**

1. **Single Active Timer**: Only one timer can run at a time to prevent overlapping time entries and ensure accurate tracking
2. **Optimistic Updates**: All mutations update the UI immediately before server confirmation to provide instant feedback, with automatic rollback on failure
3. **Real-time Updates**: Running timers update every second using setInterval for accurate elapsed time display
4. **Floating Widget**: Persistent draggable widget displays active timer across all pages with position saved in localStorage
5. **Automatic Duration Calculation**: Duration is calculated automatically from start_time and end_time, with manual override option in edit modal
6. **URL State Synchronization**: Tab selection is reflected in the URL, enabling bookmarking and browser navigation

## Architecture

### Data Flow

```
User Starts Timer → Stop Active Timer → Create Entry → Update Every Second → Stop Timer → Calculate Duration
                                                                                    ↓
                                                                          Update Task Total Time
```

## Database Schema

### time_entries table

```sql
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  task_id UUID REFERENCES tasks NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration INTEGER, -- minutes
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX idx_time_entries_start_time ON time_entries(start_time DESC);
CREATE INDEX idx_time_entries_user_task ON time_entries(user_id, task_id);
```

**Rationale**:

- `duration` stored in minutes for consistency with UI display
- `end_time` nullable to support active (running) timers
- Indexes on user_id, task_id, and start_time for efficient filtering and sorting
- Composite index on (user_id, task_id) for task-specific queries

## Type Definitions

```typescript
interface TimeEntry {
  id: string;
  user_id: string;
  task_id: string;
  task?: {
    id: string;
    title: string;
    project_id?: string;
    project?: {
      name: string;
    };
  };
  start_time: string; // ISO timestamp
  end_time?: string | null; // ISO timestamp
  duration?: number | null; // minutes
  description?: string | null;
  created_at: string;
  updated_at: string;
}

interface TimeStats {
  totalTime: number; // minutes
  todayTime: number; // minutes
  weekTime: number; // minutes
  monthTime: number; // minutes
  averagePerDay: number; // minutes
}

interface TimeEntryFormData {
  task_id: string;
  description?: string;
  start_time: string;
  end_time: string;
  duration: number;
}
```

**Rationale**: Explicit types improve type safety. Nullable fields allow active timers. Task data included via join for display.

## Component Structure

### Pages

- **Time.tsx**: Main time tracking page with tab navigation, URL state management, and view switching

### Components

#### Timer Components

- **TimeTracker**: Timer controls with task selector, description input, start/stop buttons, and elapsed time display
- **TimeStats**: Statistics cards displaying today, week, month, total, and average time
- **FloatingTimerWidget**: Persistent draggable widget showing active timer across all pages

#### Entry Components

- **TimeEntryList**: Virtualized list of time entry cards with edit/delete actions
- **TimeEntryModal**: Edit time entry form with task, description, start/end times, and duration
- **TimeEntryFilters**: Search, task filter, and date range filter controls

### Hooks

#### Query Hooks

- **useTimeTracking**: Fetch entries, start/stop timer, update/delete entries with TanStack Query

#### Utility Hooks

- **useFloatingWidget**: Manage floating widget visibility and position with localStorage persistence

## State Management

### TanStack Query Configuration

```typescript
// Query Keys
const timeKeys = {
  entries: (userId: string) => ["time-entries", userId] as const,
};

// Query Options
const queryConfig = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
};
```

### Optimistic Update Pattern

```typescript
// Entry Creation (Start Timer)
onMutate: async (newEntry) => {
  await queryClient.cancelQueries({ queryKey: timeKeys.entries(userId) });
  const previousEntries = queryClient.getQueryData(timeKeys.entries(userId));

  queryClient.setQueryData(timeKeys.entries(userId), (old) => [
    newEntry,
    ...old,
  ]);

  return { previousEntries };
},
onError: (err, newEntry, context) => {
  queryClient.setQueryData(timeKeys.entries(userId), context.previousEntries);
  toast.error("Failed to start timer");
},

// Entry Update (Stop Timer)
onMutate: async ({ id, updates }) => {
  await queryClient.cancelQueries({ queryKey: timeKeys.entries(userId) });
  const previousEntries = queryClient.getQueryData(timeKeys.entries(userId));

  queryClient.setQueryData(timeKeys.entries(userId), (old) =>
    old.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry))
  );

  return { previousEntries };
},
onError: (err, variables, context) => {
  queryClient.setQueryData(timeKeys.entries(userId), context.previousEntries);
  toast.error("Failed to stop timer");
},
```

**Rationale**: Optimistic updates provide instant feedback. Rollback on error maintains data consistency.

### URL State Management

```typescript
// Tab State
const [searchParams, setSearchParams] = useSearchParams();
const activeTab = searchParams.get("tab") || "tracker";

const handleTabChange = (tab: string) => {
  setSearchParams({ tab }, { replace: true });
};
```

**Rationale**: URL state enables bookmarking specific views and browser back/forward navigation. Replace mode prevents cluttering history.

## Timer Logic

### Start Timer

```typescript
const startTracking = async (taskId: string, description?: string) => {
  // Stop any active timer first
  if (activeEntry) {
    await stopTracking(activeEntry.id);
  }

  // Create new entry
  const newEntry = {
    id: crypto.randomUUID(), // Temporary ID for optimistic update
    user_id: user.id,
    task_id: taskId,
    description: description || null,
    start_time: new Date().toISOString(),
    end_time: null,
    duration: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await createEntry(newEntry);
  toast.success("Time tracking started");
};
```

**Rationale**: Stopping active timer before starting new one enforces single active timer rule. Optimistic ID allows immediate UI update.

### Stop Timer

```typescript
const stopTracking = async (entryId: string) => {
  const entry = timeEntries.find((e) => e.id === entryId);
  if (!entry) return;

  const endTime = new Date();
  const startTime = new Date(entry.start_time);
  const duration = Math.round(
    (endTime.getTime() - startTime.getTime()) / (1000 * 60)
  ); // minutes

  await updateEntry(entryId, {
    end_time: endTime.toISOString(),
    duration,
  });

  toast.success("Time tracking stopped");
};
```

**Rationale**: Duration calculated as difference between end and start times in minutes. Rounding ensures whole minute values.

### Elapsed Time Display

```typescript
const [elapsedTime, setElapsedTime] = useState(0);

useEffect(() => {
  if (!activeEntry) {
    setElapsedTime(0);
    return;
  }

  const updateElapsed = () => {
    const now = new Date();
    const start = new Date(activeEntry.start_time);
    const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000); // seconds
    setElapsedTime(elapsed);
  };

  updateElapsed();
  const interval = setInterval(updateElapsed, 1000);

  return () => clearInterval(interval);
}, [activeEntry]);

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};
```

**Rationale**: setInterval updates every second for real-time display. Cleanup on unmount prevents memory leaks. Format shows hours only when > 0.

## Statistics Calculation

### Time Stats Logic

```typescript
const calculateStats = (entries: TimeEntry[]): TimeStats => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const completedEntries = entries.filter((entry) => entry.end_time);

  const calculateDuration = (entry: TimeEntry): number => {
    if (entry.duration) return entry.duration;
    if (entry.start_time && entry.end_time) {
      const start = new Date(entry.start_time);
      const end = new Date(entry.end_time);
      return (end.getTime() - start.getTime()) / (1000 * 60); // minutes
    }
    return 0;
  };

  const totalTime = completedEntries.reduce(
    (sum, entry) => sum + calculateDuration(entry),
    0
  );

  const todayEntries = completedEntries.filter((entry) => {
    const entryDate = new Date(entry.start_time);
    return entryDate >= today;
  });

  const todayTime = todayEntries.reduce(
    (sum, entry) => sum + calculateDuration(entry),
    0
  );

  const weekEntries = completedEntries.filter((entry) => {
    const entryDate = new Date(entry.start_time);
    return entryDate >= weekStart;
  });

  const weekTime = weekEntries.reduce(
    (sum, entry) => sum + calculateDuration(entry),
    0
  );

  const monthEntries = completedEntries.filter((entry) => {
    const entryDate = new Date(entry.start_time);
    return entryDate >= monthStart;
  });

  const monthTime = monthEntries.reduce(
    (sum, entry) => sum + calculateDuration(entry),
    0
  );

  const daysWithEntries = new Set(
    completedEntries.map((entry) => new Date(entry.start_time).toDateString())
  ).size;

  const averagePerDay = daysWithEntries > 0 ? totalTime / daysWithEntries : 0;

  return {
    totalTime,
    todayTime,
    weekTime,
    monthTime,
    averagePerDay,
  };
};
```

**Rationale**: Stats calculated from completed entries only. Duration fallback handles entries without stored duration. Days with entries used for average calculation.

### Time Formatting

```typescript
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};
```

**Rationale**: Format shows hours only when > 0. Rounding ensures whole minute display.

## Floating Timer Widget

### Widget Component

```typescript
const FloatingTimerWidget: React.FC = () => {
  const { activeEntry } = useTimeTracking();
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem("floating-timer-position");
    return saved ? JSON.parse(saved) : { x: 20, y: 80 };
  });

  useEffect(() => {
    localStorage.setItem("floating-timer-position", JSON.stringify(position));
  }, [position]);

  if (!activeEntry) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragEnd={(e, info) => {
        setPosition({ x: info.point.x, y: info.point.y });
      }}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: 9999,
      }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4"
    >
      {/* Widget content */}
    </motion.div>
  );
};
```

**Rationale**: Framer Motion provides smooth drag functionality. Position persisted in localStorage. High z-index ensures visibility. Conditional render when active entry exists.

## UI Design

### Tab Navigation

Three tabs with animated indicator and URL synchronization:

1. **Tracker**: Timer controls and quick statistics
2. **Entries**: Filtered time entry list
3. **Statistics**: Detailed time tracking statistics

**URL Pattern**: `/time?tab=tracker` or `/time?tab=entries`

**Rationale**: URL state enables bookmarking specific views and browser back/forward navigation.

### Time Tracker Component

Display elements:

- Task selector dropdown (required)
- Description input (optional, 500 char max)
- Start/Stop button (conditional based on active entry)
- Elapsed time display (for active entry)
- Recent entries preview

**Active State**:

- Display task title
- Display elapsed time (updating every second)
- Display description if present
- Show "Stop" button

**Inactive State**:

- Show task selector
- Show description input
- Show "Start Tracking" button

### Time Entry Card

Display elements:

- Active indicator (green dot + "Active" badge for running timers)
- Task title (bold)
- Project name badge (if associated)
- Start time with calendar icon
- End time (if completed)
- Duration (formatted as "Xh Ym")
- Description (if present)
- Edit button
- Delete button

### Time Entry Filters

Filter controls:

- Search input (filters by task title, description, project name)
- Task selector dropdown (shows all tasks)
- Date range picker (start and end dates)
- Clear filters button

**Filter Logic**: AND combination of all active filters

### Time Stats Display

Statistics cards:

- Today: Time tracked today
- This Week: Time tracked this week
- This Month: Time tracked this month
- Total Time: All-time tracked
- Daily Average: Average time per day with entries

**Format**: "Xh Ym" for hours and minutes

### Entry Edit Modal

Fields:

- Task selector (required)
- Description textarea (optional, 500 char max)
- Start time datetime picker (required)
- End time datetime picker (required)
- Duration display (auto-calculated, read-only)

Validation:

- Task: required
- Start time: required, must be before end time
- End time: required, must be after start time
- Duration: auto-calculated, non-negative

**Auto-calculation**: When start or end time changes, duration recalculates automatically

## Filtering Logic

### Entry Filtering

```typescript
const filterEntries = (
  entries: TimeEntry[],
  filters: {
    searchTerm: string;
    selectedTaskId?: string;
    dateRange: { start: string; end: string };
  }
) => {
  let filtered = [...entries];

  // Search filter
  if (filters.searchTerm.trim()) {
    const search = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(
      (entry) =>
        entry.task?.title?.toLowerCase().includes(search) ||
        entry.description?.toLowerCase().includes(search) ||
        entry.task?.project?.name?.toLowerCase().includes(search)
    );
  }

  // Task filter
  if (filters.selectedTaskId) {
    filtered = filtered.filter(
      (entry) => entry.task_id === filters.selectedTaskId
    );
  }

  // Date range filter
  if (filters.dateRange.start) {
    filtered = filtered.filter(
      (entry) => new Date(entry.start_time) >= new Date(filters.dateRange.start)
    );
  }

  if (filters.dateRange.end) {
    filtered = filtered.filter(
      (entry) => new Date(entry.start_time) <= new Date(filters.dateRange.end)
    );
  }

  return filtered;
};
```

**Rationale**: Filters use AND logic to progressively narrow results. Case-insensitive search. Date comparison uses start_time.

## Navigation Flow

```
Time Page
  ├─ Tab: Tracker (default)
  │   ├─ Task Selector
  │   ├─ Description Input
  │   ├─ Start/Stop Button
  │   ├─ Elapsed Time Display (if active)
  │   └─ Quick Stats
  │
  ├─ Tab: Entries
  │   ├─ Filters (Search, Task, Date Range)
  │   ├─ Entry Cards
  │   │   ├─ Click Edit → Entry Edit Modal
  │   │   │   ├─ Edit task, description, times
  │   │   │   └─ Save changes
  │   │   └─ Click Delete → Confirmation Modal
  │   │       └─ Confirm deletion
  │   └─ Empty State (if no entries)
  │
  └─ Tab: Statistics
      └─ Detailed Stats Cards

Floating Timer Widget (when active)
  ├─ Draggable Position
  ├─ Task Title
  ├─ Elapsed Time
  └─ Stop Button
```

## Form Validation

### Entry Form Validation Rules

```typescript
const entryValidation = {
  task_id: {
    required: "Task is required",
  },
  start_time: {
    required: "Start time is required",
  },
  end_time: {
    required: "End time is required",
    validate: (value, formValues) => {
      const start = new Date(formValues.start_time);
      const end = new Date(value);
      return end > start || "End time must be after start time";
    },
  },
  description: {
    maxLength: {
      value: 500,
      message: "Description cannot exceed 500 characters",
    },
  },
};
```

**Rationale**: React Hook Form with validation provides type-safe validation with clear error messages. Custom validator ensures end time is after start time.

## Error Handling

### Validation Errors

- Task: Required for timer start
- Start time: Required, must be valid timestamp
- End time: Required, must be after start time
- Duration: Must be non-negative
- Display inline error messages below fields
- Prevent form submission until valid
- Highlight invalid fields with red border

### Network Errors

- Display toast notification with error message
- Rollback optimistic updates
- Provide retry option for failed operations
- Show offline indicator if network unavailable
- Log errors to console for debugging

### Timer Errors

- Multiple active timers → Stop previous before starting new
- Invalid task ID → Display error toast and prevent start
- Failed to stop timer → Display error toast and retry
- Widget position out of bounds → Reset to default position

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Single Active Timer

_For any_ time tracking state, there exists at most one time entry with null end_time.

```typescript
timeEntries.filter((e) => e.end_time === null).length <= 1;
```

**Validates**: Requirements 1.2, 1.6

### Property 2: Duration Calculation Accuracy

_For any_ completed time entry, the duration equals the difference between end_time and start_time in minutes (rounded).

```typescript
entry.end_time !== null →
  entry.duration === Math.round((new Date(entry.end_time) - new Date(entry.start_time)) / (1000 * 60))
```

**Validates**: Requirements 1.5, 11.1, 11.2

### Property 3: Time Ordering

_For any_ time entry, the start_time is before the end_time.

```typescript
entry.end_time !== null → new Date(entry.start_time) < new Date(entry.end_time)
```

**Validates**: Requirements 5.7, 11.5

### Property 4: Statistics Accuracy

_For any_ time period filter, the calculated time equals the sum of durations for entries within that period.

```typescript
stats.todayTime ===
  timeEntries
    .filter((e) => e.start_time >= today && e.end_time !== null)
    .reduce((sum, e) => sum + e.duration, 0);
```

**Validates**: Requirements 6.2, 6.3, 6.4, 6.8

### Property 5: Filter Combination

_For any_ combination of filters, the result set satisfies all filter conditions (AND logic).

```typescript
filtered.every(
  (e) => matchesSearch(e) && matchesTaskFilter(e) && matchesDateRangeFilter(e)
);
```

**Validates**: Requirements 4.4, 4.5

### Property 6: Optimistic Update Rollback

_For any_ failed mutation, the UI state equals the state before the mutation attempt.

```typescript
mutate(data) fails → entries === previousEntries && toastDisplayed === true
```

**Validates**: Requirements 10.5

### Property 7: Widget Position Persistence

_For any_ widget position change, the position is saved to localStorage and restored on page reload.

```typescript
setPosition(newPos) →
  localStorage.getItem("floating-timer-position") === JSON.stringify(newPos) &&
  (reload() → widgetPosition === newPos)
```

**Validates**: Requirements 7.6, 7.7

### Property 8: Real-time Timer Updates

_For any_ active timer, the displayed elapsed time updates every second and matches the actual elapsed time.

```typescript
activeEntry !== null →
  (wait(1000) → displayedTime === Math.floor((now - start) / 1000))
```

**Validates**: Requirements 1.3, 7.3, 11.8

### Property 9: Task Association

_For any_ time entry, the task_id references a valid task in the tasks table.

```typescript
entry.task_id !== null → tasks.some(t => t.id === entry.task_id)
```

**Validates**: Requirements 12.1, 12.5

### Property 10: Entry CRUD Operations

_For any_ entry creation, the entry appears in the list immediately and persists to database.

```typescript
createEntry(data) → entries.includes(newEntry) === true (before server response)
```

_For any_ entry update, the changes appear immediately and persist to database.

```typescript
updateEntry(id, updates) → entry.field === updates.field (before server response)
```

_For any_ entry deletion, the entry disappears immediately and is removed from database.

```typescript
deleteEntry(id) → entries.includes(entry) === false (before server response)
```

**Validates**: Requirements 10.2, 10.3, 10.4

## Testing Strategy

### Unit Tests

- Timer start/stop logic
- Duration calculation
- Time formatting functions
- Statistics calculation
- Filter logic
- Validation rules

### Property-Based Tests

- Property 1: Single active timer (generate random timer operations, verify only one active)
- Property 2: Duration accuracy (generate random start/end times, verify calculation)
- Property 3: Time ordering (generate random entries, verify start < end)
- Property 4: Statistics accuracy (generate random entries, verify sum matches stats)
- Property 5: Filter combination (generate random filters, verify AND logic)

### Integration Tests

- Start timer → Stop timer → Verify entry created
- Edit entry → Verify changes persisted
- Delete entry → Verify entry removed
- Filter entries → Verify correct results
- Widget drag → Verify position saved

### End-to-End Tests

- Complete time tracking workflow
- Multi-tab navigation
- Floating widget across pages
- Error handling and recovery
