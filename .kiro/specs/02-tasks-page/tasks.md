# Task Management System - Implementation Tasks

## Phase 1: Database and Type Definitions

- [x] 1. Verify Database Schema
  - Review `supabase/migrations/20251119045332_remote_schema.sql` to confirm tasks table structure
  - Verify tasks table has all required columns: id (UUID PK), user_id (UUID FK), title (TEXT NOT NULL), description (TEXT), completed (BOOLEAN DEFAULT false), priority (TEXT DEFAULT 'medium'), due_date (DATE), assignee (TEXT), project (TEXT), labels (TEXT[]), status (TEXT DEFAULT 'todo'), kanban_position (INTEGER DEFAULT 0), is_on_kanban (BOOLEAN DEFAULT false), completion_date (TIMESTAMPTZ), total_time_seconds (INTEGER DEFAULT 0), created_at (TIMESTAMPTZ), updated_at (TIMESTAMPTZ)
  - Confirm priority CHECK constraint exists: `CHECK (priority IN ('low', 'medium', 'high'))`
  - Confirm status CHECK constraint exists: `CHECK (status IN ('todo', 'in_progress', 'review', 'completed', 'blocked'))`
  - Verify RLS policies exist for SELECT, INSERT, UPDATE, DELETE operations (WHERE auth.uid() = user_id)
  - Verify indexes exist: idx_tasks_user_id, idx_tasks_kanban
  - Verify foreign key constraint: tasks_user_id_fkey references auth.users(id)
  - Verify trigger exists: set_updated_at trigger calls handle_updated_at() function
  - TypeScript types are auto-generated in `src/integrations/supabase/types.ts`
  - _Requirements: 11.1, 11.7_

- [x] 2. Create Type Definitions
  - Create `src/types/task.ts` file
  - Define Task interface with all fields and proper types
  - Define TaskFormData interface for form submissions
  - Define PriorityType as union type ("low" | "medium" | "high")
  - Export all types for use across the application
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [x] 3. Create Task Constants
  - Create `src/constants/taskConstants.ts` file
  - Define FilterType as union type ("all" | "pending" | "completed")
  - Define SortType as union type ("created" | "dueDate" | "priority")
  - Define PRIORITY_COLORS constant mapping priorities to hex colors
  - Export TaskFormData interface
  - _Requirements: 2.4, 2.6_

## Phase 2: Core Data Management Hooks

- [x] 4. Implement useTasks Hook
  - Create `src/hooks/tasks/useTasks.ts` file
  - Set up useQuery with key ["tasks", userId] to fetch all user tasks
  - Order tasks by created_at descending
  - Validate and normalize priority values (default to "medium" if invalid)
  - Validate and normalize status values (default to "todo" if invalid)
  - Configure staleTime: 5 minutes, gcTime: 10 minutes
  - _Requirements: 11.1, 11.6, 11.7, 11.8_

- [x] 5. Implement Task Creation Mutation
  - Create useMutation for task creation
  - Insert task with user_id, title, and optional fields
  - Set completed: false, labels: [], created_at, updated_at
  - Implement optimistic update: add new task to cache immediately
  - Set isCreating state to true during operation
  - Show success toast on completion
  - Show error toast and rollback on failure
  - _Requirements: 1.1, 1.6, 1.8, 11.2, 11.5_

- [x] 6. Implement Task Update Mutation
  - Create useMutation for task updates
  - Update task with provided fields and set updated_at
  - Implement optimistic update: update task in cache immediately
  - Rollback cache on error
  - Show error toast on failure
  - _Requirements: 3.2, 3.8, 11.3, 11.5_

- [x] 7. Implement Task Delete Mutation
  - Create useMutation for task deletion
  - Delete task by ID from database
  - Implement optimistic update: remove task from cache immediately
  - Rollback cache on error
  - Show error toast on failure
  - _Requirements: 3.7, 11.4, 11.5_

- [x] 8. Implement Toggle Task Method
  - Find task by ID in tasks array
  - Toggle completed field
  - Set completion_date to current timestamp if completing, null if uncompleting
  - Call updateTask mutation with updates
  - Show success toast with task title and emoji (🎉 for completion)
  - _Requirements: 3.3, 3.4, 3.5_

- [x] 9. Implement Resurrect Task Method
  - Accept taskId and array of subtask titles
  - Find parent task by ID
  - Loop through subtask titles and create new tasks
  - Set description to "Resurrected subtask from: {parent title}"
  - Inherit parent's priority, project, and assignee
  - Set due_date to today
  - Add "resurrected" label
  - Handle errors and throw for caller to catch
  - _Requirements: 8.6, 8.7_

- [x] 10. Implement useProjects Hook
  - Create `src/hooks/useProjects.ts` file
  - Use useMemo to derive projects from tasks array
  - Create Map to accumulate project statistics
  - For each task, increment taskCount for its project (or "Unassigned")
  - Track completedCount and pendingCount
  - Calculate completionRate as (completedCount / taskCount) × 100, rounded
  - Sort projects by taskCount descending, then alphabetically
  - Implement getTasksByProject method to filter tasks by project name
  - _Requirements: 4.1, 4.2, 4.3, 4.7, 4.8_

- [x] 11. Implement useTaskFiltering Hook
  - Create `src/hooks/tasks/useTaskFiltering.ts` file
  - Accept tasks, filter, sortBy, searchTerm, projectFilter as parameters
  - Use useMemo for filteredTasks: apply status filter, project filter, and search filter
  - Search should check title, description, and labels (case-insensitive)
  - Use useMemo for sortedTasks: sort by created date, due date, or priority
  - For priority sort, use order: high (0), medium (1), low (2)
  - For due date sort, tasks without due dates should appear last
  - Return filteredTasks and sortedTasks
  - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 12. Implement useTaskSelection Hook
  - Create `src/hooks/tasks/useTaskSelection.ts` file
  - Maintain selectedTasks state as array of task IDs
  - Implement handleSelectTask to toggle task selection
  - Implement handleSelectAll to select all filtered tasks
  - Implement handleDeselectAll to clear selection
  - Implement clearSelection method
  - Return selectedTasks and all handler methods
  - _Requirements: 9.1, 9.4, 9.5_

- [x] 13. Implement useTaskOperations Hook
  - Create `src/hooks/tasks/useTaskOperations.ts` file
  - Accept updateTask, deleteTask, onSelectionClear as parameters
  - Implement handleBulkComplete: mark all selected tasks as completed
  - Implement markTasksIncomplete: mark all selected tasks as incomplete
  - Implement handleBulkDelete: delete all selected tasks
  - Show success toast with count after each operation
  - Show error toast on failure
  - Call onSelectionClear after successful operations
  - _Requirements: 9.6, 9.7, 9.8, 9.9_

- [x] 14. Implement useZombieTasks Hook
  - Create `src/hooks/tasks/useZombieTasks.ts` file
  - Use useMemo to filter tasks for zombie candidates
  - Calculate date 7 days ago from current date
  - Filter for tasks that are: not completed, have a due_date, and due_date < 7 days ago
  - Return deadTasks array and hasZombies boolean
  - _Requirements: 8.1, 8.2_

## Phase 3: Main Tasks Page

- [x] 15. Create Tasks Page Structure
  - Create `src/pages/Tasks.tsx` file
  - Import all necessary hooks, components, and assets
  - Set up state for currentView, selectedProject, selectedKanbanProject, selectedTask
  - Set up state for filters: filter, sortBy, searchTerm, projectFilter
  - Set up state for modals: showTaskForm, showZombieModal, taskToDelete, showBulkDeleteModal
  - Initialize all hooks: useTasks, useTaskFiltering, useProjects, useZombieTasks, useTaskSelection, useTaskOperations
  - _Requirements: 1.1, 2.1, 12.1_

- [x] 16. Implement URL State Synchronization
  - Use useSearchParams to read tab and project from URL
  - Initialize currentView from URL tab parameter (default: "tasks")
  - Initialize selectedProject and selectedKanbanProject from URL project parameter
  - Implement handleTabChange to update currentView and URL
  - Implement handleKanbanProjectSelect to set project and update URL
  - Implement handleKanbanBack to clear project and update URL
  - Use useEffect to sync URL parameters with state on mount
  - _Requirements: 12.4, 12.5, 12.6_

- [x] 17. Create Tab Navigation with Animated Indicator
  - Create refs for each tab button and tabs container
  - Calculate tab position (left, width, top, height) based on active tab
  - Use useEffect to update position when currentView changes
  - Create motion.div for sliding background indicator
  - Animate indicator position with spring physics (stiffness: 400, damping: 30)
  - Apply theme-aware colors to indicator (teal for Halloween, view-specific otherwise)
  - Add glowing shadow animation for Halloween mode
  - Handle window resize with debounced position recalculation
  - _Requirements: 12.2, 12.3, 12.7_

- [x] 18. Create Header Section with Decorations
  - Display "Task Manager" title with theme-aware color
  - Show view-specific description text
  - Add "Resurrect" button with zombie count badge
  - Apply pulse animation to Resurrect button when hasZombies is true
  - Show skull icon in Halloween mode, Skull lucide icon otherwise
  - Add "New Task" button with Plus icon
  - Apply theme-aware styling to buttons
  - Add Halloween decorations: pumpkin background, cat, candles, spider, ghost
  - Animate decorations (floating, pulsing, rotating)
  - _Requirements: 1.1, 8.2, 8.3, 10.1, 10.2, 10.3, 10.4, 10.7_

- [x] 19. Implement Loading State
  - Check if loading is true and tasks array is empty
  - Display skeleton loaders for header, tabs, and content
  - Use tab-specific skeletons: TasksTabSkeleton, ProjectsTabSkeleton, CalendarTabSkeleton
  - Wrap in motion.div with fade-in animation
  - _Requirements: 12.8_

- [x] 20. Implement Tab Content Rendering
  - Use conditional rendering based on currentView
  - For "tasks" view: render TaskStats, BulkOperationsBar (if selections), TaskFilters, TaskList
  - For "kanban" view: render KanbanProjectSelector or KanbanBoard based on selectedKanbanProject
  - For "projects" view: render ProjectList or ProjectDetails based on selectedProject
  - For "calendar" view: render TasksCalendar
  - Pass appropriate props and callbacks to each component
  - _Requirements: 2.1, 4.1, 5.1, 5.2, 6.1, 12.1_

## Phase 4: Task List View Components

- [x] 21. Create TaskStats Component
  - Create `src/components/tasks/TaskStats.tsx` file
  - Calculate total tasks count
  - Calculate active (incomplete) tasks count
  - Calculate completed tasks count
  - Calculate completion rate as (completed / total) × 100
  - Calculate high priority tasks count
  - Display statistics in grid of glass cards
  - Use theme-aware colors (teal for Halloween mode)
  - Add icons for each statistic
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

- [x] 22. Create TaskFilters Component
  - Create `src/components/tasks/TaskFilters.tsx` file
  - Add search input with magnifying glass icon
  - Add status filter dropdown (All, Pending, Completed)
  - Add project filter dropdown with all project names
  - Add sort dropdown (Created Date, Due Date, Priority)
  - Call appropriate onChange handlers when filters change
  - Apply theme-aware styling to all inputs and dropdowns
  - Make responsive for mobile devices
  - _Requirements: 2.3, 2.4, 2.5, 2.6_

- [x] 23. Create TaskList Component
  - Create `src/components/tasks/TaskList.tsx` file
  - Use Virtuoso component for virtualized scrolling
  - Pass sortedTasks as data prop
  - Render TaskItem for each task in itemContent
  - Pass selectedTasks, onSelectTask, onToggleTask, onDeleteTask, onTaskClick as props
  - Display empty state when no tasks match filters
  - Show appropriate empty state message and illustration
  - _Requirements: 2.1, 2.2, 2.8_

- [x] 24. Create TaskItem Component
  - Create `src/components/tasks/TaskItem.tsx` file
  - Display checkbox for task selection
  - Display task title with truncation
  - Display priority badge with color coding (red/yellow/green)
  - Display due date with calendar icon (show "Overdue" in red if past)
  - Display project badge if task has project
  - Display labels as small badges
  - Add click handler to open task detail modal
  - Add checkbox handler to toggle completion
  - Apply theme-aware styling and hover effects
  - Make responsive for mobile devices
  - _Requirements: 2.2, 9.1_

- [x] 25. Create BulkOperationsBar Component
  - Create `src/components/tasks/BulkOperationsBar.tsx` file
  - Display selected count and total count
  - Add "Select All" button
  - Add "Deselect All" button
  - Add "Mark Complete" button
  - Add "Mark Incomplete" button
  - Add "Delete Selected" button with trash icon
  - Apply theme-aware styling
  - Position as sticky bar at top of task list
  - _Requirements: 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

## Phase 5: Task Modals

- [x] 26. Create TaskCreationModal Component
  - Create `src/components/tasks/TaskCreationModal.tsx` file
  - Use Modal component as base
  - Add title input field (required)
  - Add description textarea
  - Add priority select dropdown (Low, Medium, High)
  - Add due date picker
  - Add assignee input field
  - Add project combobox with autocomplete and create new option
  - Add labels input with tag creation
  - Validate title is non-empty before submission
  - Display error message if formError prop is provided
  - Disable submit button and show "Creating..." when isCreating is true
  - Call onSubmit with TaskFormData on form submission
  - Pre-fill project field if defaultProject prop is provided
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 27. Create TaskDetailModal Component
  - Create `src/components/tasks/TaskDetailModal.tsx` file
  - Use Modal component as base
  - Display all task fields with inline editing
  - Add completion toggle button
  - Add delete button with confirmation
  - Display time tracking entries if any exist
  - Display completion date if task is completed
  - Call onUpdate when any field changes
  - Call onToggleComplete when completion toggle is clicked
  - Call onDelete when delete button is clicked
  - Apply theme-aware styling
  - _Requirements: 3.1, 3.2, 3.3, 3.6, 3.7_

- [x] 28. Create ZombieTaskModal Component
  - Create `src/components/tasks/ZombieTaskModal.tsx` file
  - Use Modal component as base
  - Display list of zombie tasks with titles and days overdue
  - Calculate days overdue for each task
  - Add "Resurrect" button for each task
  - Add "Delete" button for each task
  - On resurrect click, prompt for subtask names (comma-separated input)
  - Call onResurrect with taskId and subtask array
  - Call onDelete with taskId on delete click
  - Show success toast after resurrection
  - Apply Halloween-themed styling (skull icons, teal colors)
  - _Requirements: 8.4, 8.5, 8.6, 8.7, 8.8_

- [x] 29. Create ConfirmationModal for Deletions
  - Use existing ConfirmationModal component from `src/components/ui/ConfirmationModal.tsx`
  - Configure for single task deletion with task title and description
  - Configure for bulk deletion with selected count
  - Set type to "danger" for red styling
  - Show appropriate confirmation message
  - Call delete handler on confirm
  - _Requirements: 3.7, 9.8_

## Phase 6: Projects View Components

- [x] 30. Create ProjectList Component
  - Create `src/components/tasks/ProjectList.tsx` file
  - Display projects in responsive grid layout
  - Show project name, task count, completion rate for each project
  - Display progress bar showing completion percentage
  - Add click handler to call onProjectClick with project name
  - Apply theme-aware styling to project cards
  - Use glass card styling for each project
  - Sort projects by task count (handled by useProjects hook)
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 31. Create ProjectDetails Component
  - Create `src/components/tasks/ProjectDetails.tsx` file
  - Display project header with name and statistics
  - Show task count, completed count, completion rate
  - Add back button to return to project list
  - Display filtered task list for the project
  - Reuse TaskList component with filtered tasks
  - Pass through task selection and operation handlers
  - Apply theme-aware styling
  - _Requirements: 4.4, 4.5, 4.6_

## Phase 7: Kanban View Components

- [x] 32. Create KanbanProjectSelector Component
  - Create `src/components/tasks/KanbanProjectSelector.tsx` file
  - Display all projects in grid layout
  - Show project name and task count for each project
  - Add click handler to call onProjectSelect with project name
  - Apply theme-aware styling to project cards
  - Use glass card styling
  - Add hover effects
  - _Requirements: 5.2, 5.3_

- [x] 33. Create KanbanBoard Component
  - Create `src/components/tasks/KanbanBoard.tsx` file
  - Display five columns: Todo, In Progress, Review, Completed, Blocked
  - Filter tasks by selected project
  - Group tasks by status into appropriate columns
  - Implement drag-and-drop using @dnd-kit or react-beautiful-dnd
  - On drop, update task status to match destination column
  - On drop within column, update kanban_position
  - Add "New Task" button in each column header
  - Display task cards with title, priority badge, due date
  - Add back button to return to project selector
  - Apply theme-aware styling to columns and cards
  - _Requirements: 5.1, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

## Phase 8: Calendar View Components

- [x] 34. Create TasksCalendar Component
  - Create `src/components/tasks/TasksCalendar.tsx` file
  - Use react-day-picker or similar calendar library
  - Display monthly calendar view
  - Group tasks by due date
  - Display task indicators on dates with tasks
  - Color-code indicators by project
  - Highlight current date
  - Add navigation buttons for previous/next month
  - Add click handler for dates to show DayTasksModal
  - Apply theme-aware styling
  - _Requirements: 6.1, 6.2, 6.4, 6.5, 6.6_

- [x] 35. Create DayTasksModal Component
  - Create `src/components/tasks/DayTasksModal.tsx` file
  - Use Modal component as base
  - Display selected date in header
  - List all tasks due on that date
  - Show task title, priority, project, completion status
  - Add checkbox to toggle task completion
  - Add click handler to open full task detail modal
  - Apply theme-aware styling
  - _Requirements: 6.3, 6.7, 6.8_

## Phase 9: Testing and Polish

- [x] 36. Test Task CRUD Operations
  - Test creating task with all fields
  - Test creating task with only title (minimal)
  - Test updating task fields
  - Test toggling task completion
  - Test deleting task with confirmation
  - Verify optimistic updates work correctly
  - Verify rollback on error
  - Verify toast notifications appear
  - _Requirements: 1.1, 1.6, 1.8, 3.2, 3.3, 3.7, 11.2, 11.3, 11.4, 11.5_

- [x] 37. Test Filtering and Sorting
  - Test status filter (all, pending, completed)
  - Test project filter
  - Test search by title, description, labels
  - Test combining multiple filters
  - Test sort by created date
  - Test sort by due date
  - Test sort by priority
  - Verify filter combinations use AND logic
  - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 38. Test Projects View
  - Test project list displays all projects
  - Test project statistics are accurate
  - Test clicking project shows project details
  - Test back button returns to project list
  - Test "Unassigned" project appears
  - Test project sorting by task count
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

- [x] 39. Test Kanban Board
  - Test project selector displays projects
  - Test selecting project shows Kanban board
  - Test dragging task between columns updates status
  - Test dragging task within column updates position
  - Test "New Task" button pre-fills status
  - Test back button returns to project selector
  - Test priority and due date indicators display
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

- [x] 40. Test Calendar View
  - Test calendar displays current month
  - Test tasks appear on correct dates
  - Test clicking date shows day tasks modal
  - Test month navigation works
  - Test current date is highlighted
  - Test overdue indicators display
  - Test toggling completion in day modal
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

- [x] 41. Test Zombie Tasks Feature
  - Test zombie tasks are identified correctly (7+ days overdue)
  - Test Resurrect button shows count
  - Test Resurrect button pulses when zombies exist
  - Test zombie modal displays dead tasks
  - Test resurrection creates subtasks with correct properties
  - Test delete removes zombie task
  - Test Halloween mode shows skull icon
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

- [x] 42. Test Bulk Operations
  - Test selecting multiple tasks
  - Test "Select All" selects all filtered tasks
  - Test "Deselect All" clears selection
  - Test "Mark Complete" completes all selected
  - Test "Mark Incomplete" marks all selected as incomplete
  - Test "Delete Selected" shows confirmation and deletes
  - Test bulk operations bar appears when tasks selected
  - Test selection clears after operations
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9_

- [x] 43. Test URL State Synchronization
  - Test changing tabs updates URL
  - Test selecting project updates URL
  - Test loading page with URL parameters restores state
  - Test browser back/forward navigation works
  - Test bookmarking specific views works
  - _Requirements: 12.4, 12.5, 12.6_

- [x] 44. Test Halloween Mode Integration
  - Test teal accent color applies throughout
  - Test decorations appear in header
  - Test animations work (floating, pulsing, rotating)
  - Test skull icon appears on Resurrect button
  - Test tab indicator glows
  - Test disabling Halloween mode reverts styling
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_

- [x] 45. Test Performance with Large Datasets
  - Create 1000+ tasks
  - Test task list scrolls smoothly (60fps)
  - Test search results appear quickly (< 300ms)
  - Test filtering doesn't cause lag
  - Test Kanban drag-and-drop is smooth
  - Verify virtualization is working
  - _Requirements: 2.8_

- [x] 46. Test Responsive Design
  - Test on mobile devices (320px - 480px)
  - Test on tablets (768px - 1024px)
  - Test on desktop (1280px+)
  - Verify tab navigation wraps on mobile
  - Verify modals are scrollable on small screens
  - Verify touch targets are adequate (44x44px)
  - _Requirements: All UI requirements_

- [x] 47. Test Accessibility
  - Test keyboard navigation through all elements
  - Test screen reader announces task counts and status changes
  - Test focus indicators are visible
  - Test color contrast meets WCAG AA standards
  - Test form labels are associated with inputs
  - Test error messages are announced
  - _Requirements: All UI requirements_

- [x] 48. Final Code Review and Cleanup
  - Remove console.log statements
  - Ensure consistent code formatting with Biome
  - Check for unused imports and variables
  - Verify all error messages are user-friendly
  - Add comments for complex logic
  - Verify all components have proper TypeScript types
  - _Requirements: All_
