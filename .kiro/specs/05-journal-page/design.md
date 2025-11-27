# Journal - Design

## Overview

The Journal feature provides comprehensive daily journaling with mood and energy tracking, project organization, calendar visualization, and powerful filtering. The design emphasizes personal reflection, pattern recognition, and seamless integration with the existing task management system through shared projects.

**Key Design Decisions:**

1. **Optimistic Updates**: All mutations update the UI immediately before server confirmation to provide instant feedback, with automatic rollback on failure
2. **URL State Synchronization**: Tab selection and project detail views are reflected in the URL, enabling bookmarking, browser navigation, and deep linking
3. **Shared Projects**: Projects are shared between journal entries and tasks, providing unified organization across features
4. **Mood & Energy Tracking**: 1-5 scale with visual indicators (emojis for mood, color-coded labels for energy) for easy pattern recognition
5. **Flexible Tagging**: Array-based tags stored in database for efficient filtering and categorization

## Architecture

### Data Flow

```
User Writes → Entry Form → Save Entry → Supabase → Database
                              ↓
                       Update Projects Count
                              ↓
                       Optimistic UI Update
```

## Database Schema

### daily_entries table

```sql
CREATE TABLE daily_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  project_id UUID REFERENCES projects,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  entry_date DATE DEFAULT CURRENT_DATE NOT NULL,
  mood SMALLINT CHECK (mood >= 1 AND mood <= 5),
  energy_level SMALLINT CHECK (energy_level >= 1 AND energy_level <= 5),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_daily_entries_user_id ON daily_entries(user_id);
CREATE INDEX idx_daily_entries_project ON daily_entries(project_id);
CREATE INDEX idx_daily_entries_created_at ON daily_entries(created_at DESC);
CREATE INDEX idx_daily_entries_entry_date ON daily_entries(entry_date DESC);
```

### projects table (shared with tasks)

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#10B981',
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_archived ON projects(user_id, archived);
```

## Type Definitions

```typescript
interface Journal {
  id: string;
  user_id: string;
  project_id?: string | null;
  project?: Project | null;
  title: string;
  content: string;
  entry_date: string; // ISO date string
  mood?: number | null; // 1-5
  energy_level?: number | null; // 1-5
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  color: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

interface JournalFormData {
  title: string;
  content: string;
  entry_date: string;
  project_id?: string;
  mood?: number;
  energy_level?: number;
  tags: string[];
}

interface ProjectFormData {
  name: string;
  description?: string;
  color: string;
}
```

**Rationale**: Explicit types for mood and energy levels improve type safety. Nullable fields allow optional tracking. Tags as array enables efficient filtering.

## Component Structure

### Pages

- **Journal.tsx**: Main journal page with tab navigation, URL state management, and view switching

### Components

#### Entry Components

- **JournalEntryList**: Virtualized list of entry cards
- **JournalEntryCreationModal**: Create new entry form with all fields
- **JournalEntryModal**: View/edit entry with inline editing
- **JournalEntryFilters**: Search, filter, sort controls

#### Calendar Components

- **JournalCalendar**: Monthly calendar with entry indicators
- **JournalEntriesModal**: View entries for a specific day

#### Project Components

- **ProjectsList**: Grid of projects with entry counts
- **ProjectCreationModal**: Create/edit project form
- **ProjectDetailsModal**: Project-specific entries view

### Hooks

#### Query Hooks

- **useJournalQuery**: Fetch entries with TanStack Query
- **useCreateJournal**: Create entry mutation with optimistic updates
- **useUpdateJournal**: Update entry mutation with optimistic updates
- **useDeleteJournal**: Delete entry mutation with optimistic updates
- **useProjectsQuery**: Fetch projects with TanStack Query

#### Utility Hooks

- **useJournalFiltering**: Filter and sort logic with memoization

## State Management

### TanStack Query Configuration

```typescript
// Query Keys
const journalKeys = {
  entries: (userId: string) => ["journal-entries", userId] as const,
  projects: (userId: string) => ["projects", userId] as const,
};

// Query Options
const queryConfig = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
};
```

### Optimistic Update Pattern

```typescript
// Entry Creation
onMutate: async (newEntry) => {
  await queryClient.cancelQueries({ queryKey: journalKeys.entries(userId) });
  const previousEntries = queryClient.getQueryData(journalKeys.entries(userId));

  queryClient.setQueryData(journalKeys.entries(userId), (old) => {
    const newData = [...old];
    const insertIndex = newData.findIndex(
      (entry) =>
        entry.entry_date < newEntry.entry_date ||
        (entry.entry_date === newEntry.entry_date &&
          entry.created_at < newEntry.created_at)
    );

    if (insertIndex === -1) {
      newData.push(newEntry);
    } else {
      newData.splice(insertIndex, 0, newEntry);
    }

    return newData;
  });

  return { previousEntries };
},
onError: (err, newEntry, context) => {
  queryClient.setQueryData(journalKeys.entries(userId), context.previousEntries);
  toast.error("Failed to create entry");
},
```

**Rationale**: Optimistic updates provide instant feedback. Correct insertion position maintains sort order. Rollback on error maintains data consistency.

### URL State Management

```typescript
// Tab State
const [searchParams, setSearchParams] = useSearchParams();
const activeTab = (searchParams.get("tab") as TabType) || "entries";

const handleTabChange = (tab: TabType) => {
  setSearchParams({ tab }, { replace: true });
};

// Project State
const projectId = searchParams.get("project");
const selectedProject = projects?.find((p) => p.id === projectId);

const handleProjectClick = (project: Project) => {
  setSearchParams({ tab: "projects", project: project.id }, { replace: true });
};

const handleBackToProjects = () => {
  setSearchParams({ tab: "projects" }, { replace: true });
};
```

**Rationale**: URL state enables bookmarking, sharing, and browser navigation. Replace mode prevents cluttering history.

## UI Design

### Tab Navigation

Three tabs with animated indicator and URL synchronization:

1. **Entries**: List view with filters and search
2. **Projects**: Project grid or project details
3. **Calendar**: Monthly calendar view

**URL Pattern**: `/journal?tab=entries` or `/journal?tab=projects&project=uuid`

**Rationale**: URL state enables bookmarking specific views and browser back/forward navigation.

### Mood Scale

```typescript
const MOODS = {
  1: { emoji: "😢", label: "Very Bad", color: "#EF4444" },
  2: { emoji: "😕", label: "Bad", color: "#F59E0B" },
  3: { emoji: "😐", label: "Okay", color: "#8B5CF6" },
  4: { emoji: "🙂", label: "Good", color: "#10B981" },
  5: { emoji: "😄", label: "Great", color: "#10B981" },
};
```

**Visual Representation**:

- Emoji displayed on entry cards and calendar
- Color coding: red (1-2), purple (3), green (4-5)
- Interactive selector in entry form

### Energy Scale

```typescript
const ENERGY_LEVELS = {
  1: { label: "Exhausted", color: "#EF4444", icon: "battery-low" },
  2: { label: "Tired", color: "#F59E0B", icon: "battery-medium" },
  3: { label: "Moderate", color: "#8B5CF6", icon: "battery-half" },
  4: { label: "Energized", color: "#10B981", icon: "battery-high" },
  5: { label: "Highly Energized", color: "#10B981", icon: "battery-full" },
};
```

**Visual Representation**:

- Label and color displayed on entry cards
- Color coding: red (1-2), purple (3), green (4-5)
- Interactive selector in entry form

### Entry Card

Display elements:

- Title (bold, truncated to 1 line)
- Entry date with calendar icon
- Mood emoji (if present)
- Energy indicator with color (if present)
- Content preview (2 lines, truncated)
- Tags (max 3 visible, "..." if more)
- Project badge with project color (if associated)
- Click handler to open detail modal

### Entry Form

Fields:

- Title input (required)
- Content textarea (required, multi-line)
- Entry date picker (default: today)
- Mood selector (1-5, optional)
- Energy level selector (1-5, optional)
- Tags input (comma-separated, optional)
- Project selector dropdown (optional)

Validation:

- Title: non-empty
- Entry date: required
- Mood: 1-5 if provided
- Energy level: 1-5 if provided

### Calendar View

- Monthly calendar using react-day-picker
- Entry indicators on dates with entries
- Mood emoji displayed on dates
- Entry count badge for multiple entries
- Current date highlighted
- Navigation: Previous/Next month buttons
- Click date to open day entries modal

**Day Modal**: Shows selected date, lists all entries, allows viewing/editing/deleting.

### Projects View

#### Project List

- Grid layout (1-3 columns based on screen size)
- Project cards with: name, description preview, entry count, color
- Click to view project details
- "Create Project" button

#### Project Details

- Project header with name, description, color
- Project statistics: total entries, date range
- Filtered entry list (entries for this project)
- Actions: Add Entry (pre-selects project), Edit, Archive, Delete, Back

**Rationale**: Project organization provides structure for long-term journaling. Shared with tasks for unified organization.

## Filtering & Sorting Logic

### Entry Filtering

```typescript
const filterEntries = (
  entries: Journal[],
  filters: {
    filter: FilterType;
    searchTerm: string;
    selectedProjectId?: string;
  }
) => {
  let filtered = [...entries];

  // Search filter
  if (filters.searchTerm.trim()) {
    const search = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(
      (entry) =>
        entry.title.toLowerCase().includes(search) ||
        entry.content.toLowerCase().includes(search) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(search)) ||
        entry.project?.name.toLowerCase().includes(search)
    );
  }

  // Time filter
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  switch (filters.filter) {
    case "today":
      filtered = filtered.filter((entry) => entry.entry_date === today);
      break;
    case "this-week":
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.entry_date);
        return entryDate >= startOfWeek;
      });
      break;
    case "this-month":
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.entry_date);
        return entryDate >= startOfMonth;
      });
      break;
    case "project":
      if (filters.selectedProjectId) {
        filtered = filtered.filter(
          (entry) => entry.project_id === filters.selectedProjectId
        );
      }
      break;
    case "all":
    default:
      break;
  }

  return filtered;
};
```

### Entry Sorting

```typescript
const sortEntries = (entries: Journal[], sortBy: SortType) => {
  const sorted = [...entries];

  switch (sortBy) {
    case "oldest":
      return sorted.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    case "title":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "mood":
      return sorted.sort((a, b) => {
        const moodA = a.mood || 0;
        const moodB = b.mood || 0;
        return moodB - moodA; // Higher mood first
      });
    case "energy":
      return sorted.sort((a, b) => {
        const energyA = a.energy_level || 0;
        const energyB = b.energy_level || 0;
        return energyB - energyA; // Higher energy first
      });
    case "newest":
    default:
      return sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }
};
```

**Rationale**: Filters use AND logic to progressively narrow results. Entries without mood/energy values appear last in those sorts.

## Navigation Flow

```
Journal Page
  ├─ Tab: Entries (default)
  │   ├─ Filters (All, Today, This Week, This Month, Project)
  │   ├─ Search (title, content, tags, project)
  │   ├─ Sort (Newest, Oldest, Title, Mood, Energy)
  │   ├─ Entry Cards
  │   │   └─ Click → Entry Detail Modal
  │   │       ├─ View all fields
  │   │       ├─ Edit inline
  │   │       └─ Delete with confirmation
  │   └─ New Entry → Entry Creation Modal
  │
  ├─ Tab: Projects
  │   ├─ Project Grid
  │   │   └─ Click Project → Project Details Modal
  │   │       ├─ View project entries
  │   │       ├─ Add entry (pre-selects project)
  │   │       ├─ Edit project
  │   │       ├─ Archive project
  │   │       ├─ Delete project
  │   │       └─ Back → Project Grid
  │   └─ Create Project → Project Creation Modal
  │
  └─ Tab: Calendar
      ├─ Monthly Calendar View
      ├─ Navigate Months (Previous/Next)
      └─ Click Date → Day Entries Modal
          ├─ View entries for date
          ├─ Edit entries
          └─ Delete entries
```

## Form Validation

### Entry Form Validation Rules

```typescript
const entryValidation = {
  title: {
    required: "Title is required",
    minLength: { value: 1, message: "Title cannot be empty" },
  },
  entry_date: {
    required: "Entry date is required",
  },
  mood: {
    min: { value: 1, message: "Mood must be between 1 and 5" },
    max: { value: 5, message: "Mood must be between 1 and 5" },
  },
  energy_level: {
    min: { value: 1, message: "Energy level must be between 1 and 5" },
    max: { value: 5, message: "Energy level must be between 1 and 5" },
  },
};
```

### Project Form Validation Rules

```typescript
const projectValidation = {
  name: {
    required: "Project name is required",
    minLength: { value: 1, message: "Name cannot be empty" },
  },
  color: {
    pattern: {
      value: /^#[0-9A-F]{6}$/i,
      message: "Color must be a valid hex code",
    },
  },
};
```

**Rationale**: React Hook Form with validation provides type-safe validation with clear error messages. Inline errors guide users to fix issues before submission.

## Error Handling

### Validation Errors

- Entry: Title required, entry_date required, mood 1-5, energy_level 1-5
- Project: Name required, color valid hex code
- Display inline error messages below fields
- Prevent form submission until valid
- Highlight invalid fields with red border

### Network Errors

- Display toast notification with error message
- Rollback optimistic updates
- Provide retry option for failed operations
- Show offline indicator if network unavailable
- Log errors to console for debugging

### Not Found Errors

- Invalid project ID → Redirect to projects list with toast message
- Missing entry → Show empty state with "Create Entry" CTA
- Failed to load data → Show error state with retry button
- No entries for date → Show empty state in day modal

## Correctness Properties

### CP1: Entry CRUD Operations

**Property**: For any entry creation, the entry appears in the list immediately and persists to database.

```typescript
createEntry(data) → entries.includes(newEntry) === true (before server response)
```

**Property**: For any entry update, the changes appear immediately and persist to database.

```typescript
updateEntry(id, updates) → entry.field === updates.field (before server response)
```

**Property**: For any entry deletion, the entry disappears immediately and is removed from database.

```typescript
deleteEntry(id) → entries.includes(entry) === false (before server response)
```

**Property**: For any failed mutation, the UI rolls back to the previous state and displays an error toast.

```typescript
mutate(data) fails → entries === previousEntries && toastDisplayed === true
```

**Validates**: Requirements 1.9, 1.10, 3.5, 3.8, 10.2, 10.3, 10.4, 10.5

### CP2: Calendar View Accuracy

**Property**: For any date, the calendar displays all and only entries with that entry_date.

```typescript
calendarEntries[date] === entries.filter((e) => e.entry_date === date);
```

**Property**: For any date with entries, the mood indicator matches the most recent entry's mood.

```typescript
calendarMood[date] === entries.filter((e) => e.entry_date === date)[0].mood;
```

**Property**: For any date with multiple entries, the entry count badge displays the correct count.

```typescript
calendarCount[date] === entries.filter((e) => e.entry_date === date).length;
```

**Validates**: Requirements 4.2, 4.3, 4.4, 4.5

### CP3: Project Association

**Property**: For any entry with project_id, the entry appears in that project's entry list.

```typescript
entry.project_id === projectId → projectEntries.includes(entry) === true
```

**Property**: For any project, the entry count equals the number of entries with that project_id.

```typescript
project.entryCount ===
  entries.filter((e) => e.project_id === project.id).length;
```

**Property**: For any project deletion, associated entries remain but become unassociated.

```typescript
deleteProject(id) → entries.filter(e => e.project_id === id).every(e => e.project_id === null)
```

**Validates**: Requirements 5.4, 5.8

### CP4: Filtering Logic

**Property**: For any search query, all returned entries match the query in title, content, tags, or project name.

```typescript
filteredEntries.every(
  (e) =>
    e.title.includes(query) ||
    e.content.includes(query) ||
    e.tags.some((t) => t.includes(query)) ||
    e.project?.name.includes(query)
);
```

**Property**: For any time filter, all returned entries have entry_date within the specified range.

```typescript
filter === "today" → filteredEntries.every(e => e.entry_date === today)
filter === "this-week" → filteredEntries.every(e => e.entry_date >= startOfWeek)
filter === "this-month" → filteredEntries.every(e => e.entry_date >= startOfMonth)
```

**Property**: For any combination of filters, the result set satisfies all filter conditions (AND logic).

```typescript
filtered.every(
  (e) => matchesSearch(e) && matchesTimeFilter(e) && matchesProjectFilter(e)
);
```

**Validates**: Requirements 6.3, 6.5, 6.7

### CP5: Mood & Energy Validation

**Property**: For any entry, if mood is present, it is between 1 and 5 inclusive.

```typescript
entry.mood !== null → entry.mood >= 1 && entry.mood <= 5
```

**Property**: For any entry, if energy_level is present, it is between 1 and 5 inclusive.

```typescript
entry.energy_level !== null → entry.energy_level >= 1 && entry.energy_level <= 5
```

**Property**: For any mood value, the correct emoji and color are displayed.

```typescript
entry.mood === 1 → emoji === "😢" && color === "#EF4444"
entry.mood === 5 → emoji === "😄" && color === "#10B981"
```

**Validates**: Requirements 7.1, 7.2, 7.6, 7.7

### CP6: URL State Synchronization

**Property**: For any tab selection, the URL contains the tab query parameter with the selected tab name.

```typescript
setActiveTab(tab) → window.location.search.includes(`tab=${tab}`)
```

**Property**: For any project selection, the URL contains the project query parameter with the project ID.

```typescript
selectProject(project) → window.location.search.includes(`project=${project.id}`)
```

**Property**: For any URL with tab or project parameters, loading the page restores the corresponding view.

```typescript
window.location.search.includes("tab=projects") → activeTab === "projects"
window.location.search.includes("project=uuid") → selectedProject.id === "uuid"
```

**Property**: For any browser back/forward navigation, the application state matches the URL parameters.

```typescript
browserBack() → applicationState === stateFromURL(window.location.search)
```

**Validates**: Requirements 11.1, 11.2, 11.3, 11.4, 11.5
