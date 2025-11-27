# Task Management System - Design

## Overview

This design document outlines the comprehensive task management system for Integral. The system provides multiple views (list, Kanban, calendar, projects) for managing tasks, with features including project-based organization, priority and status tracking, filtering and search, bulk operations, time tracking integration, and a unique "zombie task" resurrection feature. The design prioritizes performance through virtualization, instant feedback through optimistic updates, and seamless user experience through smooth animations and theme integration.

## Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Actions                             │
│  Create Task │ Update Task │ Delete Task │ Toggle Complete      │
└───────┬──────────────┬──────────────┬──────────────┬───────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Custom Hooks Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   useTasks   │  │ useProjects  │  │useTaskFilter │         │
│  │              │  │              │  │              │         │
│  │ • createTask │  │ • projects   │  │ • filtered   │         │
│  │ • updateTask │  │ • getByProj  │  │ • sorted     │         │
│  │ • deleteTask │  │              │  │              │         │
│  │ • toggleTask │  │              │  │              │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │useTaskSelect │  │useZombieTasks│  │useTaskOps    │         │
│  │              │  │              │  │              │         │
│  │ • selected   │  │ • deadTasks  │  │ • bulkComp   │         │
│  │ • selectAll  │  │ • hasZombies │  │ • bulkDelete │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└───────┬──────────────┬──────────────┬──────────────┬───────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TanStack Query Layer                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Query Key: ["tasks", userId]                              │ │
│  │  • Fetches all user tasks from Supabase                    │ │
│  │  • Caches results (staleTime: 5min, gcTime: 10min)        │ │
│  │  • Provides loading, error, refetch states                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Mutations: createTask, updateTask, deleteTask             │ │
│  │  • Optimistic updates to cache before server response      │ │
│  │  • Rollback on error                                       │ │
│  │  • Toast notifications for success/failure                 │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────┬──────────────┬──────────────┬──────────────┬───────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Supabase Client                             │
│  • supabase.from("tasks").select()                              │
│  • supabase.from("tasks").insert()                              │
│  • supabase.from("tasks").update()                              │
│  • supabase.from("tasks").delete()                              │
└───────┬──────────────┬──────────────┬──────────────┬───────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  tasks table                                               │ │
│  │  • id (UUID, PK)                                           │ │
│  │  • user_id (UUID, FK to auth.users)                       │ │
│  │  • title (TEXT, NOT NULL)                                 │ │
│  │  • description (TEXT)                                      │ │
│  │  • completed (BOOLEAN, DEFAULT false)                     │ │
│  │  • priority (TEXT, CHECK IN low/medium/high)              │ │
│  │  • due_date (DATE)                                         │ │
│  │  • project (TEXT)                                          │ │
│  │  • labels (TEXT[])                                         │ │
│  │  • status (TEXT, CHECK IN todo/in_progress/review/...)    │ │
│  │  • kanban_position (INTEGER)                              │ │
│  │  • completion_date (TIMESTAMPTZ)                          │ │
│  │  • total_time_seconds (INTEGER)                           │ │
│  │  • created_at, updated_at (TIMESTAMPTZ)                   │ │
│  │  • RLS: WHERE user_id = auth.uid()                        │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Design Rationale**: This layered architecture separates concerns cleanly. Custom hooks encapsulate business logic, TanStack Query manages server state and caching, and Supabase handles database operations with RLS security. Optimistic updates provide instant feedback while maintaining data integrity through rollback on errors.

### Component Hierarchy

```
Tasks Page
├── Header Section
│   ├── Title & Description
│   ├── Resurrect Button (Zombie Tasks)
│   └── New Task Button
├── Tab Navigation
│   ├── Tasks Tab
│   ├── Kanban Tab
│   ├── Projects Tab
│   └── Calendar Tab
└── Content Area (Tab-dependent)
    ├── Tasks Tab
    │   ├── TaskStats
    │   ├── BulkOperationsBar (conditional)
    │   ├── TaskFilters
    │   └── TaskList (virtualized)
    │       └── TaskItem (repeated)
    ├── Kanban Tab
    │   ├── KanbanProjectSelector (if no project selected)
    │   └── KanbanBoard (if project selected)
    │       ├── Column: Todo
    │       ├── Column: In Progress
    │       ├── Column: Review
    │       ├── Column: Completed
    │       └── Column: Blocked
    ├── Projects Tab
    │   ├── ProjectList (if no project selected)
    │   │   └── Project Cards (grid)
    │   └── ProjectDetails (if project selected)
    │       ├── Project Header
    │       ├── Project Stats
    │       └── Task List (filtered)
    └── Calendar Tab
        └── TasksCalendar
            └── DayTasksModal (on date click)

Modals (Global)
├── TaskCreationModal
├── TaskDetailModal
├── ZombieTaskModal
└── ConfirmationModal (delete)
```

**Design Rationale**: The component hierarchy follows a clear parent-child relationship with conditional rendering based on user selections. Modals are rendered at the root level to avoid z-index issues and enable access from any view.

## Components and Interfaces

### Tasks Page Component

The main page component that orchestrates all task management functionality.

**State Management**:

```typescript
// View state
const [currentView, setCurrentView] = useState<
  "tasks" | "calendar" | "projects" | "kanban"
>("tasks");
const [selectedProject, setSelectedProject] = useState<string | null>(null);
const [selectedKanbanProject, setSelectedKanbanProject] = useState<
  string | null
>(null);
const [selectedTask, setSelectedTask] = useState<string | null>(null);

// Filter state
const [filter, setFilter] = useState<"all" | "pending" | "completed">(
  "pending"
);
const [sortBy, setSortBy] = useState<"created" | "dueDate" | "priority">(
  "created"
);
const [searchTerm, setSearchTerm] = useState("");
const [projectFilter, setProjectFilter] = useState("");

// Modal state
const [showTaskForm, setShowTaskForm] = useState(false);
const [showZombieModal, setShowZombieModal] = useState(false);
const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
const [prefilledProject, setPrefilledProject] = useState("");
const [formError, setFormError] = useState<string | null>(null);
```

**Hook Integration**:

```typescript
const {
  tasks,
  loading,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
  resurrectTask,
  isCreating,
} = useTasks();
const { filteredTasks, sortedTasks } = useTaskFiltering({
  tasks,
  filter,
  sortBy,
  searchTerm,
  projectFilter,
});
const { projects, getTasksByProject } = useProjects(tasks);
const { deadTasks, hasZombies } = useZombieTasks(tasks);
const {
  selectedTasks,
  handleSelectTask,
  handleSelectAll,
  handleDeselectAll,
  clearSelection,
} = useTaskSelection({ tasks });
const { handleBulkComplete, markTasksIncomplete, handleBulkDelete } =
  useTaskOperations({
    updateTask,
    deleteTask,
    onSelectionClear: clearSelection,
  });
```

**URL State Synchronization**:

The component uses React Router's `useSearchParams` to sync view state with the URL:

```typescript
const [searchParams, setSearchParams] = useSearchParams();
const tabFromUrl = searchParams.get("tab") || "tasks";
const projectFromUrl = searchParams.get("project");

// Update URL when view changes
const handleTabChange = (tab: TabType) => {
  setCurrentView(tab);
  setSearchParams({ tab });
};
```

**Design Rationale**: URL state synchronization enables deep linking and browser back/forward navigation. Users can bookmark specific views or share links to projects.

### useTasks Hook

Core hook for task CRUD operations with TanStack Query integration.

**Interface**:

```typescript
interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  isCreating: boolean;
  createTask: (taskData: Partial<Task> & { title: string }) => Promise<Task>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  resurrectTask: (taskId: string, subtasks: string[]) => Promise<void>;
  refetch: () => Promise<void>;
}
```

**Query Configuration**:

```typescript
useQuery({
  queryKey: ["tasks", user?.id],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Validate and normalize data
    return data.map((task) => ({
      ...task,
      priority: validatePriority(task.priority),
      status: validateStatus(task.status),
    }));
  },
  enabled: !!user,
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
});
```

**Optimistic Updates**:

```typescript
createTaskMutation: useMutation({
  mutationFn: async (taskData) => {
    const { data, error } = await supabase
      .from("tasks")
      .insert({ ...taskData, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  onMutate: () => setIsCreating(true),
  onSuccess: (newTask) => {
    // Optimistically add to cache
    queryClient.setQueryData(["tasks", user?.id], (old: Task[] = []) => [
      newTask,
      ...old,
    ]);
  },
  onError: (error) => {
    toast.error("Failed to create task");
  },
  onSettled: () => setIsCreating(false),
});
```

**Toggle Task Logic**:

```typescript
const toggleTask = async (taskId: string) => {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;

  const updates: Partial<Task> = {
    completed: !task.completed,
    completion_date: !task.completed ? new Date().toISOString() : null,
  };

  await updateTask(taskId, updates);

  toast.success(
    !task.completed
      ? `Task "${task.title}" marked as completed! 🎉`
      : `Task "${task.title}" marked as incomplete`
  );
};
```

**Resurrect Task Logic**:

```typescript
const resurrectTask = async (taskId: string, subtasks: string[]) => {
  const parentTask = tasks.find((t) => t.id === taskId);

  for (const subtaskTitle of subtasks) {
    await createTask({
      title: subtaskTitle,
      description: `Resurrected subtask from: ${parentTask?.title}`,
      priority: parentTask?.priority || "medium",
      due_date: new Date().toISOString().split("T")[0],
      project: parentTask?.project || "",
      labels: [...(parentTask?.labels || []), "resurrected"],
    });
  }
};
```

**Design Rationale**: The hook encapsulates all task operations, providing a clean API to components. Optimistic updates make the UI feel instant, while error handling ensures data integrity. The toggle logic automatically manages completion dates, and resurrection creates properly configured subtasks.

### useProjects Hook

Derives project information from tasks without requiring a separate database table.

**Interface**:

```typescript
interface Project {
  name: string;
  taskCount: number;
  completedCount: number;
  pendingCount: number;
  completionRate: number;
}

interface UseProjectsReturn {
  projects: Project[];
  getTasksByProject: (projectName: string) => Task[];
}
```

**Implementation**:

```typescript
const projects = useMemo(() => {
  const projectMap = new Map<string, Project>();

  tasks.forEach((task) => {
    const projectName = task.project || "Unassigned";

    if (!projectMap.has(projectName)) {
      projectMap.set(projectName, {
        name: projectName,
        taskCount: 0,
        completedCount: 0,
        pendingCount: 0,
        completionRate: 0,
      });
    }

    const project = projectMap.get(projectName)!;
    project.taskCount++;

    if (task.completed) {
      project.completedCount++;
    } else {
      project.pendingCount++;
    }

    project.completionRate = Math.round(
      (project.completedCount / project.taskCount) * 100
    );
  });

  return Array.from(projectMap.values()).sort((a, b) => {
    if (a.taskCount !== b.taskCount) return b.taskCount - a.taskCount;
    return a.name.localeCompare(b.name);
  });
}, [tasks]);
```

**Design Rationale**: Projects are derived from task data rather than stored separately, eliminating sync issues. The useMemo hook ensures efficient recalculation only when tasks change. Sorting by task count puts active projects first.

### useTaskFiltering Hook

Handles all filtering, searching, and sorting logic.

**Interface**:

```typescript
interface UseTaskFilteringParams {
  tasks: Task[];
  filter: "all" | "pending" | "completed";
  sortBy: "created" | "dueDate" | "priority";
  searchTerm: string;
  projectFilter: string;
}

interface UseTaskFilteringReturn {
  filteredTasks: Task[];
  sortedTasks: Task[];
}
```

**Implementation**:

```typescript
const filteredTasks = useMemo(() => {
  return tasks.filter((task) => {
    // Status filter
    if (filter === "completed" && !task.completed) return false;
    if (filter === "pending" && task.completed) return false;

    // Project filter
    if (projectFilter && (task.project || "Unassigned") !== projectFilter)
      return false;

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(search);
      const matchesDescription = task.description
        ?.toLowerCase()
        .includes(search);
      const matchesLabels = task.labels.some((label) =>
        label.toLowerCase().includes(search)
      );

      if (!matchesTitle && !matchesDescription && !matchesLabels) return false;
    }

    return true;
  });
}, [tasks, filter, projectFilter, searchTerm]);

const sortedTasks = useMemo(() => {
  return [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case "dueDate":
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();

      case "priority":
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];

      case "created":
      default:
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }
  });
}, [filteredTasks, sortBy]);
```

**Design Rationale**: Filtering and sorting are separated into two steps for clarity. useMemo prevents unnecessary recalculations. Search checks multiple fields (title, description, labels) for better discoverability.

### useZombieTasks Hook

Identifies overdue tasks for the resurrection feature.

**Interface**:

```typescript
interface UseZombieTasksReturn {
  deadTasks: Task[];
  hasZombies: boolean;
}
```

**Implementation**:

```typescript
const deadTasks = useMemo(() => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return tasks.filter((task) => {
    if (task.completed) return false;
    if (!task.due_date) return false;

    const dueDate = new Date(task.due_date);
    return dueDate < sevenDaysAgo;
  });
}, [tasks]);

const hasZombies = deadTasks.length > 0;
```

**Design Rationale**: The 7-day threshold balances being helpful without being annoying. Only tasks with due dates are considered, as tasks without dates aren't truly "overdue."

## Data Models

### Task Interface

```typescript
interface Task {
  id: string; // UUID primary key
  user_id: string; // FK to auth.users
  title: string; // Required, non-empty
  description?: string | null; // Optional long text
  completed: boolean; // Default false
  priority: "low" | "medium" | "high"; // Default medium
  due_date?: string | null; // ISO date string (YYYY-MM-DD)
  assignee?: string | null; // Free text
  project?: string | null; // Project name
  labels: string[]; // Array of tag strings
  status?: "todo" | "in_progress" | "review" | "completed" | "blocked"; // Workflow state
  kanban_position?: number; // Position within Kanban column
  is_on_kanban?: boolean; // Whether task is on Kanban board
  completion_date?: string | null; // ISO timestamp when completed
  total_time_seconds?: number; // Tracked time in seconds
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}
```

### TaskFormData Interface

```typescript
interface TaskFormData {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  due_date: string;
  assignee: string;
  project: string;
  labels: string[];
}
```

### Project Interface

```typescript
interface Project {
  name: string; // Project name (or "Unassigned")
  taskCount: number; // Total tasks in project
  completedCount: number; // Completed tasks
  pendingCount: number; // Incomplete tasks
  completionRate: number; // Percentage (0-100)
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Task Creation Persistence

_For any_ valid task data with a non-empty title, creating a task should result in the task appearing in the task list and being stored in the database.

**Validates: Requirements 1.1, 1.6, 1.8**

**Design Rationale**: Task creation is the foundation of the system. This property ensures tasks are never lost during creation.

### Property 2: Optimistic Update Consistency

_For any_ task operation (create, update, delete), the UI should update immediately, and if the server operation fails, the UI should rollback to the previous state.

**Validates: Requirements 11.2, 11.3, 11.4, 11.5**

**Design Rationale**: Optimistic updates provide instant feedback, but consistency requires proper rollback on errors.

### Property 3: Filter Combination Correctness

_For any_ combination of filters (status, project, search), the filtered task list should contain only tasks that match all active filters.

**Validates: Requirements 2.3, 2.4, 2.5, 2.7**

**Design Rationale**: Multiple filters must combine with AND logic to narrow results progressively.

### Property 4: Project Statistics Accuracy

_For any_ project, the completion rate should equal (completed tasks / total tasks) × 100, rounded to the nearest integer.

**Validates: Requirements 4.2, 4.7, 7.5**

**Design Rationale**: Statistics must be accurate for users to trust the system and make informed decisions.

### Property 5: Kanban Status Synchronization

_For any_ task moved between Kanban columns, the task status should update to match the destination column.

**Validates: Requirements 5.4**

**Design Rationale**: Kanban columns represent status, so moving a task must update its status field.

### Property 6: Zombie Task Identification

_For any_ task that is incomplete and has a due date more than 7 days in the past, the task should be identified as a zombie task.

**Validates: Requirements 8.1**

**Design Rationale**: The zombie feature depends on accurate identification of overdue tasks.

### Property 7: Bulk Operation Atomicity

_For any_ bulk operation on selected tasks, either all tasks should be updated successfully, or none should be updated (with appropriate error handling).

**Validates: Requirements 9.6, 9.7, 9.8**

**Design Rationale**: Partial bulk operations create inconsistent state. All-or-nothing semantics prevent confusion.

### Property 8: URL State Synchronization

_For any_ view change or project selection, the URL should update to reflect the current state, and loading the URL should restore that state.

**Validates: Requirements 12.4, 12.5, 12.6**

**Design Rationale**: URL state enables deep linking, bookmarking, and browser navigation.

## Error Handling

### Error Categories

**Network Errors**:

- Connection timeout
- Server unavailable
- Rate limiting

**Validation Errors**:

- Empty task title
- Invalid priority value
- Invalid status value
- Invalid date format

**Database Errors**:

- Constraint violations
- RLS policy failures
- Concurrent modification conflicts

### Error Display Strategy

**Toast Notifications**: Used for operation feedback

```typescript
// Success
toast.success("Task created successfully!");
toast.success(`Task "${task.title}" marked as completed! 🎉`);

// Error
toast.error("Failed to create task");
toast.error("Failed to update task. Please try again.");
```

**Inline Errors**: Used in forms

```typescript
{formError && (
  <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-3">
    {formError}
  </div>
)}
```

**Confirmation Modals**: Used for destructive actions

```typescript
<ConfirmationModal
  isOpen={!!taskToDelete}
  onClose={() => setTaskToDelete(null)}
  onConfirm={async () => {
    await deleteTask(taskToDelete);
    toast.success("Task deleted successfully!");
  }}
  title="Delete Task"
  description="Are you sure you want to delete this task?"
  type="danger"
/>
```

**Design Rationale**: Toast notifications provide non-blocking feedback. Inline errors keep attention on the form. Confirmation modals prevent accidental data loss.

### Error Recovery

- **Network Errors**: Automatic retry with exponential backoff (handled by TanStack Query)
- **Validation Errors**: User corrects input and resubmits
- **Optimistic Update Failures**: Automatic rollback to previous state
- **Concurrent Modifications**: Refetch latest data and prompt user to retry

**Design Rationale**: Automatic recovery where possible, clear user guidance where manual intervention is needed.

## Testing Strategy

### Unit Testing

Unit tests will verify specific behaviors:

- useTasks hook creates/updates/deletes tasks correctly
- useProjects hook calculates statistics accurately
- useTaskFiltering hook filters and sorts correctly
- useZombieTasks hook identifies overdue tasks
- Task creation validates required fields
- Optimistic updates rollback on error

### Property-Based Testing

Property-based tests will verify universal properties:

- **Property Testing Library**: fast-check (JavaScript/TypeScript PBT library)
- **Minimum iterations**: 100 runs per property test
- **Test annotation format**: `**Feature: tasks-page, Property {number}: {property_text}**`

Each correctness property will be implemented as a property-based test.

### Integration Testing

- Complete task creation flow
- Task update and completion flow
- Task deletion with confirmation
- Filter combinations produce correct results
- Kanban drag-and-drop updates status
- Bulk operations affect all selected tasks
- Zombie task resurrection creates subtasks
- URL state synchronization works correctly

**Design Rationale**: Unit tests catch specific bugs, property tests verify general correctness, integration tests ensure all pieces work together.

## Performance Considerations

### Virtualization

**Problem**: Rendering 1000+ tasks causes performance issues

**Solution**: React Virtuoso for virtualized scrolling

```typescript
<Virtuoso
  data={sortedTasks}
  itemContent={(index, task) => (
    <TaskItem
      key={task.id}
      task={task}
      onToggle={toggleTask}
      onDelete={deleteTask}
      onClick={setSelectedTask}
    />
  )}
/>
```

**Design Rationale**: Virtualization renders only visible items, maintaining 60fps scrolling even with thousands of tasks.

### Memoization

**Problem**: Expensive calculations run on every render

**Solution**: useMemo for derived data

```typescript
const filteredTasks = useMemo(() => {
  return tasks.filter(/* filtering logic */);
}, [tasks, filter, searchTerm, projectFilter]);

const projects = useMemo(() => {
  // Calculate project statistics
}, [tasks]);
```

**Design Rationale**: Memoization prevents unnecessary recalculations, improving responsiveness.

### Optimistic Updates

**Problem**: Network latency makes UI feel slow

**Solution**: Update UI immediately, sync with server in background

```typescript
onSuccess: (newTask) => {
  queryClient.setQueryData(["tasks", user?.id], (old: Task[] = []) => [
    newTask,
    ...old,
  ]);
};
```

**Design Rationale**: Optimistic updates make the UI feel instant, dramatically improving perceived performance.

### Query Caching

**Problem**: Repeated fetches waste bandwidth and slow down UI

**Solution**: TanStack Query caching with appropriate stale times

```typescript
{
  staleTime: 5 * 60 * 1000,  // 5 minutes
  gcTime: 10 * 60 * 1000,     // 10 minutes
}
```

**Design Rationale**: 5-minute stale time balances freshness with performance. 10-minute garbage collection keeps memory usage reasonable.

## Accessibility

### Keyboard Navigation

- Tab through all interactive elements
- Enter to submit forms
- Escape to close modals
- Arrow keys for calendar navigation
- Space to toggle checkboxes

### Screen Reader Support

- All buttons have descriptive labels
- Form inputs have associated labels
- Task counts announced
- Status changes announced
- Error messages announced

### Visual Accessibility

- High contrast text colors
- Focus indicators on all interactive elements
- Color is not the only indicator (icons + text)
- Sufficient touch target sizes (44x44px minimum)

**Design Rationale**: Accessibility is built in from the start, ensuring all users can manage tasks effectively.

## Theme Integration

### Dark Mode

- Dark backgrounds with light text
- Subtle borders and shadows
- Color-coded priorities and statuses

### Light Mode

- Light backgrounds with dark text
- Defined borders and shadows
- Color-coded priorities and statuses

### Halloween Mode

- Teal accent color (#60c9b6) replaces default colors
- Animated decorations (cat, candles, spider, ghost, pumpkin background)
- Glowing effects on active elements
- Skull icon for zombie tasks
- Pulsing animations for attention

**Design Rationale**: Theme support provides personalization and seasonal delight without compromising usability. Halloween mode adds whimsy while maintaining functionality.
