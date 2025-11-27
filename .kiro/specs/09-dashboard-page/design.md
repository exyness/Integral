# Dashboard - Design

## Overview

The Dashboard feature provides a comprehensive unified overview of all productivity metrics, quick actions for navigation, AI-powered insights, zombie task alerts, and motivational elements. The design emphasizes data accuracy, performance through parallel data fetching, and an engaging user experience with smooth animations and Halloween theme support.

**Key Design Decisions:**

1. **Parallel Data Fetching**: All data queries run simultaneously to minimize load time and achieve sub-2-second dashboard load
2. **Calculated Statistics**: All metrics calculated from actual data using useMemo for performance optimization
3. **Graceful Degradation**: Dashboard displays partial data if some queries fail, ensuring usability even with errors
4. **Responsive Grid Layouts**: Statistics and quick actions use responsive grids that adapt to screen size (2/4/7 columns)
5. **AI-Powered Insights**: Automated analysis of spending patterns, task completion, and zombie tasks with actionable recommendations
6. **Halloween Theme Integration**: Comprehensive seasonal decorations with animated elements and teal color scheme

## Architecture

### Data Flow

```
Dashboard Loads → Fetch All Data in Parallel → Calculate Statistics → Display Cards
                           ↓                            ↓
                    Handle Errors              Update Real-time
                           ↓                            ↓
                  Graceful Degradation         Smooth Animations
```

## Data Fetching Strategy

### Parallel Query Execution

```typescript
// All hooks called simultaneously for parallel execution
const { tasks, loading: tasksLoading } = useTasks();
const { notes, loading: notesLoading } = useNotes();
const { entries, loading: entriesLoading } = useJournalQuery();
const { budgets, loading: budgetsLoading } = useBudgets();
const { transactions, loading: transactionsLoading } = useBudgetTransactions();
const { accounts, loading: accountsLoading } = useAccounts();
const { getAllTimeStats, loading: pomodoroLoading } = usePomodoro();
const { timeEntries, loading: timeLoading } = useTimeTracking();

// Combined loading state
const loading =
  tasksLoading ||
  notesLoading ||
  entriesLoading ||
  budgetsLoading ||
  transactionsLoading ||
  accountsLoading ||
  pomodoroLoading ||
  timeLoading;
```

**Rationale**: Parallel execution minimizes total load time. Individual loading states allow partial rendering. Combined loading state controls skeleton display.

## Type Definitions

```typescript
interface DashboardStats {
  // Task Statistics
  completedTasks: number;
  totalTasks: number;
  activeTasks: number;
  completionRate: number;
  highPriorityTasks: number;

  // Financial Statistics
  totalBudget: number;
  totalSpent: number;
  budgetRemaining: number;

  // Account Statistics
  activeAccounts: number;

  // Pomodoro Statistics
  pomodoroStats: {
    total: number;
    completed: number;
    work: number;
    breaks: number;
  };

  // Time Tracking Statistics
  totalTimeHours: number;
}

interface StatCard {
  title: string;
  value: number | string;
  icon: React.ComponentType;
  color: string;
  href?: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType;
  href: string;
  color: string;
  bgColor: string;
}

interface DailyRitual {
  icon: string;
  title: string;
  description: string;
  completed: boolean;
  action: () => void;
}
```

**Rationale**: Explicit types improve type safety and code clarity. Separate interfaces for different card types enable reusability.

## Component Structure

### Pages

- **Dashboard.tsx**: Main dashboard page with all sections and data aggregation

### Components

#### Dashboard-Specific Components

- **DashboardDecorations**: Halloween-themed animated decorations (bat, pumpkin, spider, ghost, witch)
- **ProductivitySummaryCard**: Daily rituals, habits, and recent activity display
- **DashboardSkeleton**: Loading skeleton matching dashboard layout

#### Shared Components

- **ProductivityInsightsCard**: Task insights and zombie task alerts (shared with tasks page)
- **FinancialInsightsCard**: Budget insights and spending analysis (shared with budget page)
- **ZombieTaskModal**: Resurrect overdue tasks modal (shared with tasks page)
- **GlassCard**: Glass morphism card wrapper (shared across app)

### Hooks

#### Data Hooks

- **useTasks**: Fetch tasks with completion status
- **useNotes**: Fetch notes count
- **useJournalQuery**: Fetch journal entries
- **usePomodoro**: Fetch Pomodoro statistics
- **useTimeTracking**: Fetch time entries
- **useBudgets**: Fetch budgets
- **useBudgetTransactions**: Fetch transactions
- **useAccounts**: Fetch accounts

#### Utility Hooks

- **useZombieTasks**: Identify and manage zombie tasks (tasks overdue by 7+ days)

## Statistics Calculation

### Dashboard Stats Logic

```typescript
const dashboardStats = useMemo(() => {
  // Task Statistics
  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const activeTasks = tasks.filter((task) => !task.completed).length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 1000) / 10 : 0;
  const highPriorityTasks = tasks.filter(
    (task) => !task.completed && task.priority === "high"
  ).length;

  // Financial Statistics
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const budgetRemaining = totalBudget - totalSpent;

  // Account Statistics
  const activeAccounts = accounts.filter((account) => account.is_active).length;

  // Pomodoro Statistics
  const pomodoroStats = getAllTimeStats();

  // Time Tracking Statistics
  const totalTimeTracked = timeEntries
    .filter((entry) => entry.end_time)
    .reduce((total, entry) => {
      if (entry.duration) {
        return total + entry.duration;
      }
      if (entry.start_time && entry.end_time) {
        const start = new Date(entry.start_time);
        const end = new Date(entry.end_time);
        return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }
      return total;
    }, 0);

  const totalTimeHours = Math.round(totalTimeTracked * 10) / 10;

  return {
    completedTasks,
    totalTasks,
    activeTasks,
    completionRate,
    highPriorityTasks,
    totalBudget,
    totalSpent,
    budgetRemaining,
    activeAccounts,
    pomodoroStats,
    totalTimeHours,
  };
}, [tasks, budgets, transactions, accounts, getAllTimeStats, timeEntries]);
```

**Rationale**: useMemo prevents recalculation on every render. All stats derived from actual data. Handles edge cases (division by zero, null values). Completion rate rounded to 1 decimal place.

## UI Design

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Header: Welcome + Completion Rate + Decorations            │
├─────────────────────────────────────────────────────────────┤
│ Statistics Cards Grid (2/4/7 columns responsive)           │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──┐│
│ │Tasks │ │Notes │ │Journal│ │Pomo │ │Time  │ │Budget│ │Acc││
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──┘│
├─────────────────────────────────────────────────────────────┤
│ Quick Actions Grid (2/3-4/7 columns responsive)            │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──┐│
│ │Tasks │ │Time  │ │Notes │ │Journal│ │Pomo │ │Budget│ │Acc││
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──┘│
├─────────────────────────────────────────────────────────────┤
│ Insights Grid (2 columns on large, stack on mobile)        │
│ ┌──────────────────────┐ ┌──────────────────────┐          │
│ │ Financial Insights   │ │ Productivity Insights│          │
│ │ - Spending patterns  │ │ - Task completion    │          │
│ │ - Budget alerts      │ │ - Zombie tasks       │          │
│ │ - Recommendations    │ │ - Focus time         │          │
│ └──────────────────────┘ └──────────────────────┘          │
├─────────────────────────────────────────────────────────────┤
│ Productivity Summary                                        │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Daily Rituals: Morning Journal, Review Tasks, etc.     ││
│ │ Recent Activity, Trends, Motivational Messages         ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Statistics Cards

```typescript
const statsCards: StatCard[] = [
  {
    title: "Total Tasks",
    value: dashboardStats.totalTasks,
    icon: CheckCircle,
    color: isHalloweenMode ? "#60c9b6" : "#10B981",
  },
  {
    title: "Total Notes",
    value: notes.length,
    icon: StickyNote,
    color: isHalloweenMode ? "#60c9b6" : "#8B5CF6",
  },
  {
    title: "Journal Entries",
    value: entries.length,
    icon: BookOpen,
    color: isHalloweenMode ? "#60c9b6" : "#3B82F6",
  },
  {
    title: "Pomodoro Sessions",
    value: dashboardStats.pomodoroStats.total,
    icon: Timer,
    color: isHalloweenMode ? "#60c9b6" : "#EF4444",
  },
  {
    title: "Time Tracked",
    value: `${dashboardStats.totalTimeHours}h`,
    icon: Clock,
    color: isHalloweenMode ? "#60c9b6" : "#F59E0B",
  },
  {
    title: "Total Budgets",
    value: budgets.length,
    icon: DollarSign,
    color: isHalloweenMode ? "#60c9b6" : "#06B6D4",
  },
  {
    title: "Active Accounts",
    value: dashboardStats.activeAccounts,
    icon: Wallet,
    color: isHalloweenMode ? "#60c9b6" : "#EC4899",
  },
];
```

**Rationale**: Array-based approach enables easy mapping and rendering. Halloween mode overrides all colors with teal. Icons from lucide-react for consistency.

### Quick Actions

```typescript
const quickActions: QuickAction[] = useMemo(
  () => [
    {
      title: "Tasks",
      description: "Manage your tasks",
      icon: List,
      href: "/tasks",
      color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#10B981]",
      bgColor: isHalloweenMode
        ? "bg-[#60c9b6]/10 hover:bg-[#60c9b6]/20"
        : "bg-green-500/10 hover:bg-green-500/20",
    },
    {
      title: "Time",
      description: "Track time",
      icon: Timer,
      href: "/time",
      color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#3B82F6]",
      bgColor: isHalloweenMode
        ? "bg-[#60c9b6]/10 hover:bg-[#60c9b6]/20"
        : "bg-blue-500/10 hover:bg-blue-500/20",
    },
    // ... other actions
  ],
  [isHalloweenMode]
);
```

**Rationale**: useMemo prevents recreation on every render. Color and bgColor adapt to theme. Hover effects provide visual feedback.

### Responsive Grid Configuration

```typescript
// Statistics Cards Grid
<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
  {statsCards.map((stat, index) => (
    <motion.div
      key={stat.title}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <GlassCard className="p-4">
        {/* Card content */}
      </GlassCard>
    </motion.div>
  ))}
</div>

// Quick Actions Grid
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
  {quickActions.map((action, index) => (
    <motion.div
      key={action.title}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      {/* Action card */}
    </motion.div>
  ))}
</div>
```

**Rationale**: Tailwind responsive classes handle breakpoints. Framer Motion provides stagger effect. GlassCard ensures consistent styling.

## Zombie Tasks Logic

### Zombie Task Identification

```typescript
const useZombieTasks = () => {
  const { tasks } = useTasks();

  const zombieTasks = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return tasks.filter((task) => {
      if (task.completed || !task.due_date) return false;

      const dueDate = new Date(task.due_date);
      return dueDate < sevenDaysAgo;
    });
  }, [tasks]);

  return { zombieTasks, zombieCount: zombieTasks.length };
};
```

**Rationale**: Zombie tasks are overdue by 7+ days. Excludes completed tasks and tasks without due dates. useMemo prevents recalculation.

### Zombie Task Modal

```typescript
const ZombieTaskModal: React.FC<{ tasks: Task[]; onClose: () => void }> = ({
  tasks,
  onClose,
}) => {
  const handleResurrect = (task: Task) => {
    // Options:
    // 1. Break into subtasks
    // 2. Create new task with updated due date
    // 3. Delete task
  };

  return (
    <Modal isOpen={tasks.length > 0} onClose={onClose} title="Zombie Tasks">
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="p-4 border rounded">
            <h3>{task.title}</h3>
            <p>Due: {formatDate(task.due_date)}</p>
            <div className="flex gap-2 mt-2">
              <button onClick={() => handleResurrect(task)}>Resurrect</button>
              <button onClick={() => deleteTask(task.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};
```

**Rationale**: Modal provides focused interface for managing zombie tasks. Multiple resurrection options give users flexibility.

## Daily Rituals Logic

### Ritual Completion Tracking

```typescript
const dailyRituals: DailyRitual[] = useMemo(() => {
  const today = new Date().toISOString().split("T")[0];

  return [
    {
      icon: "📝",
      title: "Morning Journal",
      description: "Write your daily reflection",
      completed: entries.some((entry) => entry.entry_date === today),
      action: () => navigate("/journal"),
    },
    {
      icon: "✅",
      title: "Review Tasks",
      description: "Check your task list",
      completed: localStorage.getItem(`tasks-viewed-${today}`) === "true",
      action: () => navigate("/tasks"),
    },
    {
      icon: "🍅",
      title: "Focus Session",
      description: "Complete a Pomodoro",
      completed: pomodoroStats.todayCompleted > 0,
      action: () => navigate("/pomodoro"),
    },
    {
      icon: "💰",
      title: "Budget Check",
      description: "Review your spending",
      completed: localStorage.getItem(`budget-viewed-${today}`) === "true",
      action: () => navigate("/budget"),
    },
  ];
}, [entries, pomodoroStats, navigate]);
```

**Rationale**: Rituals encourage daily engagement with all features. Completion tracked via data (journal, pomodoro) or localStorage (views). useMemo prevents recreation.

## Halloween Decorations

### Decoration Components

```typescript
const DashboardDecorations: React.FC = () => {
  const { isHalloweenMode } = useTheme();

  if (!isHalloweenMode) return null;

  return (
    <>
      {/* Flying Bat */}
      <motion.div
        className="fixed top-20 left-0 w-16 h-16 pointer-events-none z-50"
        animate={{
          x: ["0vw", "100vw"],
          y: [0, -20, 0, 20, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <img src={batFlying} alt="" className="w-full h-full" />
      </motion.div>

      {/* Peeking Pumpkin */}
      <motion.div
        className="fixed bottom-10 right-10 w-20 h-20 pointer-events-none z-50"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <img src={pumpkinPeeking} alt="" className="w-full h-full" />
      </motion.div>

      {/* Hanging Spider */}
      <motion.div
        className="fixed top-0 right-40 w-12 h-24 pointer-events-none z-50"
        initial={{ y: -100 }}
        animate={{
          y: [0, 0],
          rotate: [-5, 5, -5],
        }}
        transition={{
          y: { duration: 2, ease: "easeOut" },
          rotate: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <img src={spiderHanging} alt="" className="w-full h-full" />
      </motion.div>

      {/* Background Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-purple-900/5 to-transparent pointer-events-none z-0" />
    </>
  );
};
```

**Rationale**: Fixed positioning keeps decorations visible during scroll. Pointer-events-none prevents interaction. High z-index ensures visibility. Conditional render based on Halloween mode.

## Loading States

### Dashboard Skeleton

```typescript
const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-6 w-48" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>

      {/* Insights Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
};
```

**Rationale**: Skeleton matches actual layout for smooth transition. Array.from creates placeholder elements. Responsive grid classes match actual content.

## Error Handling

### Graceful Degradation

```typescript
const Dashboard: React.FC = () => {
  const { tasks, error: tasksError } = useTasks();
  const { notes, error: notesError } = useNotes();
  // ... other hooks

  const errors = [
    tasksError,
    notesError,
    // ... other errors
  ].filter(Boolean);

  if (errors.length === Object.keys(hooks).length) {
    // All queries failed
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Failed to load dashboard</h2>
        <p className="text-gray-600 mb-4">Please try again</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (errors.length > 0) {
    // Some queries failed
    toast.error(`Failed to load some data: ${errors.length} errors`);
  }

  // Render with available data
  return <DashboardContent />;
};
```

**Rationale**: Checks all errors to determine failure severity. Complete failure shows error state. Partial failure shows toast and renders available data.

## Performance Optimization

### Memoization Strategy

```typescript
// Expensive calculations memoized
const dashboardStats = useMemo(() => {
  // Calculate all stats
}, [tasks, budgets, transactions, accounts, timeEntries]);

const quickActions = useMemo(() => {
  // Create actions array
}, [isHalloweenMode]);

const statsCards = useMemo(() => {
  // Create stats cards array
}, [dashboardStats, isHalloweenMode, notes, entries, budgets]);
```

**Rationale**: useMemo prevents recalculation on every render. Dependencies ensure updates when data changes. Improves performance for complex calculations.

### Lazy Loading

```typescript
// Lazy load heavy components
const FinancialInsightsCard = lazy(
  () => import("@/components/budget/FinancialInsightsCard")
);
const ProductivityInsightsCard = lazy(
  () => import("@/components/tasks/ProductivityInsightsCard")
);

// Render with Suspense
<Suspense fallback={<Skeleton className="h-64" />}>
  <FinancialInsightsCard />
</Suspense>;
```

**Rationale**: Lazy loading reduces initial bundle size. Suspense provides loading fallback. Improves initial page load time.

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Statistics Accuracy

_For any_ dashboard load, all statistics equal the actual data counts and calculations.

```typescript
dashboardStats.totalTasks === tasks.length;
dashboardStats.completedTasks === tasks.filter((t) => t.completed).length;
dashboardStats.completionRate === (completedTasks / totalTasks) * 100;
dashboardStats.totalBudget === budgets.reduce((sum, b) => sum + b.amount, 0);
```

**Validates**: Requirements 4, 5, 11

### Property 2: Parallel Data Fetching

_For any_ dashboard load, all data queries execute simultaneously (not sequentially).

```typescript
startTime = now()
Promise.all([fetchTasks(), fetchNotes(), fetchJournal(), ...])
endTime = now()
totalTime === max(individualQueryTimes) // not sum
```

**Validates**: Requirement 10

### Property 3: Graceful Degradation

_For any_ partial data fetch failure, the dashboard displays available data and shows error notification.

```typescript
someQueriesFailed && allQueriesNotFailed →
  dashboardDisplayed === true &&
  errorToastDisplayed === true &&
  availableDataDisplayed === true
```

**Validates**: Requirements 10, 13

### Property 4: Zombie Task Identification

_For any_ task, it is a zombie task if and only if it is overdue by 7 or more days and not completed.

```typescript
isZombieTask(task) ⟺
  !task.completed &&
  task.due_date !== null &&
  (now - task.due_date) >= 7 days
```

**Validates**: Requirement 8

### Property 5: Responsive Grid Layout

_For any_ screen width, the grid displays the correct number of columns.

```typescript
width < 768px → statsGrid.columns === 2
768px <= width < 1024px → statsGrid.columns === 4
width >= 1024px → statsGrid.columns === 7
```

**Validates**: Requirement 12

### Property 6: Halloween Theme Consistency

_For any_ Halloween mode state, all module colors are either teal or their default colors.

```typescript
isHalloweenMode === true →
  statsCards.every(card => card.color === "#60c9b6")

isHalloweenMode === false →
  statsCards.every(card => card.color === defaultColors[card.module])
```

**Validates**: Requirements 2, 9

### Property 7: Real-time Statistics Updates

_For any_ data change, the dashboard statistics update to reflect the new data.

```typescript
tasks.push(newTask) →
  dashboardStats.totalTasks === previousTotal + 1

task.completed = true →
  dashboardStats.completedTasks === previousCompleted + 1 &&
  dashboardStats.completionRate === recalculated
```

**Validates**: Requirements 4, 5, 11

### Property 8: Daily Ritual Completion

_For any_ ritual, it is marked complete if and only if the completion condition is met.

```typescript
ritual.title === "Morning Journal" →
  ritual.completed === entries.some(e => e.entry_date === today)

ritual.title === "Focus Session" →
  ritual.completed === pomodoroStats.todayCompleted > 0
```

**Validates**: Requirement 6

### Property 9: Loading State Accuracy

_For any_ data fetch state, the loading indicator displays if and only if at least one query is loading.

```typescript
loading === true ⟺
  tasksLoading || notesLoading || entriesLoading || ... (any query loading)
```

**Validates**: Requirement 10

### Property 10: Error Handling Completeness

_For any_ error state, the dashboard either shows error state (all failed) or partial data with notification (some failed).

```typescript
allQueriesFailed → errorStateDisplayed === true

someQueriesFailed && !allQueriesFailed →
  partialDataDisplayed === true && errorToastDisplayed === true
```

**Validates**: Requirement 13

## Testing Strategy

### Unit Tests

- Statistics calculation functions
- Zombie task identification logic
- Daily ritual completion checking
- Currency formatting
- Date calculations
- Grid responsive logic

### Property-Based Tests

- Property 1: Statistics accuracy (generate random data, verify calculations)
- Property 4: Zombie task identification (generate random tasks with dates, verify classification)
- Property 5: Responsive grid layout (test various screen widths, verify column counts)
- Property 6: Halloween theme consistency (toggle theme, verify all colors)

### Integration Tests

- Parallel data fetching → Verify all queries execute simultaneously
- Graceful degradation → Simulate partial failures, verify partial rendering
- Real-time updates → Modify data, verify statistics update
- Navigation → Click quick actions, verify navigation
- Zombie task modal → Open modal, resurrect task, verify update

### End-to-End Tests

- Complete dashboard load workflow
- All quick actions navigation
- Zombie task resurrection flow
- Daily ritual completion tracking
- Halloween mode toggle
- Error handling and recovery
- Responsive design on all devices
