# Time Tracking System - Implementation Tasks

## Phase 1: Database and Type Definitions

- [x] 1. Verify Database Schema
  - Review `supabase/migrations/20251119045332_remote_schema.sql` to confirm time_entries table structure
  - Verify time_entries table has columns: id (UUID PK), task_id (UUID FK NOT NULL), user_id (UUID FK NOT NULL), start_time (TIMESTAMPTZ NOT NULL), end_time (TIMESTAMPTZ), duration_seconds (INTEGER), description (TEXT), is_running (BOOLEAN DEFAULT false), is_paused (BOOLEAN DEFAULT false), paused_at (TIMESTAMPTZ), total_paused_seconds (INTEGER DEFAULT 0), created_at (TIMESTAMPTZ), updated_at (TIMESTAMPTZ)
  - Confirm RLS policies exist for SELECT, INSERT, UPDATE, DELETE operations (WHERE auth.uid() = user_id)
  - Verify foreign key constraints: time_entries.task_id → tasks.id, time_entries.user_id → auth.users.id
  - Verify indexes exist: idx_time_entries_task_id, idx_time_entries_user_id
  - Verify trigger exists: time_entries_update_task_total trigger calls trigger_update_task_total_time() function
  - Verify function exists: update_task_total_time() calculates sum of duration_seconds and updates tasks.total_time_seconds
  - TypeScript types are auto-generated in `src/integrations/supabase/types.ts`
  - _Requirements: AC1, AC6_

- [x] 2. Create Type Definitions
  - Define TimeEntry interface in `src/types/task.ts` with all fields and proper types
  - Export TimeEntry interface for use across the application
  - _Requirements: AC1_

## Phase 2: Core Data Management Hook

- [x] 3. Implement useTimeTracking Hook - Count Query
  - Create `src/hooks/tasks/useTimeTracking.ts` file
  - Set up useQuery with key ["timeEntries", "count", userId] to fetch total count
  - Use Supabase count query with head: true for efficiency
  - Return totalCount for pagination display
  - _Requirements: AC4_

- [x] 4. Implement useTimeTracking Hook - Entries Query
  - Set up useQuery with key ["timeEntries", userId, limit] to fetch user time entries
  - Order entries by start_time descending
  - Implement pagination with limit parameter (default 50)
  - Implement loadMore method to increase limit by 50
  - Configure staleTime: 5 minutes, gcTime: 10 minutes
  - Return timeEntries array, loading state, hasMore boolean
  - _Requirements: AC4_

- [x] 5. Implement Stop Timer Mutation
  - Create useStopTimer mutation
  - Fetch entry to get start_time, is_paused, paused_at, total_paused_seconds
  - Calculate end_time as current timestamp
  - Calculate duration_seconds: (end_time - start_time) - total_paused_seconds
  - Update entry with end_time, duration_seconds, is_running: false
  - Implement optimistic update: update entry in cache immediately
  - Invalidate queries to refresh task total time
  - Show success toast with formatted duration
  - Show error toast and rollback on failure
  - _Requirements: AC1, AC2, AC6_

- [x] 6. Implement Start Timer Mutation
  - Create useStartTimer mutation
  - Stop any running timers first (ensure single timer rule)
  - Insert new entry with task_id, user_id, start_time, is_running: true
  - Implement optimistic update: add entry to beginning of cache array
  - Invalidate queries to refresh
  - Show success toast
  - Show error toast on failure
  - _Requirements: AC1, AC2_

- [x] 7. Implement Update Time Entry Mutation
  - Create useUpdateTimeEntry mutation
  - Accept entryId and updates parameters
  - Update entry with provided fields
  - Set updated_at to current timestamp
  - Implement optimistic update: update entry in cache immediately
  - Invalidate queries to refresh task total time
  - Show success toast on completion
  - Show error toast on failure
  - _Requirements: AC5_

- [x] 8. Implement Pause Timer Mutation
  - Create usePauseTimer mutation
  - Update entry with is_paused: true, paused_at: current timestamp
  - Implement optimistic update: update entry in cache immediately
  - Invalidate queries
  - Show success toast
  - Show error toast on failure
  - _Requirements: AC1, AC2_

- [x] 9. Implement Resume Timer Mutation
  - Create useResumeTimer mutation
  - Find entry and verify it's paused
  - Calculate pause duration: current time - paused_at
  - Add pause duration to total_paused_seconds
  - Update entry with is_paused: false, paused_at: null, total_paused_seconds
  - Implement optimistic update: update entry in cache immediately
  - Invalidate queries
  - Show success toast
  - Show error toast on failure
  - _Requirements: AC1, AC2_

- [x] 10. Implement Delete Time Entry Mutation
  - Create useDeleteTimeEntry mutation
  - Find entry to get task_id for invalidation
  - Delete entry by ID from database
  - Implement optimistic update: remove entry from cache immediately
  - Invalidate queries to refresh task total time
  - Show success toast on completion
  - Show error toast on failure
  - _Requirements: AC5_

- [x] 11. Implement Helper Methods
  - Create startTimer method: stops running timers, calls startTimerMutation
  - Create stopTimer method: calls stopTimerMutation with entryId
  - Create pauseTimer method: calls pauseTimerMutation with entryId
  - Create resumeTimer method: calls resumeTimerMutation with entryId
  - Create updateTimeEntry method: calls updateTimeEntryMutation
  - Create deleteTimeEntry method: calls deleteTimeEntryMutation
  - Create loadMore method: increases limit by 50
  - Return all methods from hook
  - _Requirements: AC1, AC2, AC5_

- [x] 12. Implement useTimeCalculations Hook
  - Create `src/hooks/tasks/useTimeCalculations.ts` file
  - Implement getCurrentDuration: calculate elapsed time for running entry
  - Account for pause time in calculation
  - Update every second for running timers
  - Format duration as HH:MM:SS
  - Return formatted duration and raw seconds
  - _Requirements: AC1, AC2, AC6_

## Phase 3: Floating Widget Context

- [x] 13. Create FloatingWidgetContext
  - Create `src/contexts/FloatingWidgetContext.tsx` file
  - Implement widget visibility state (default: false)
  - Implement widget position state (default: { x: 20, y: 20 })
  - Load position from localStorage on mount
  - Persist position to localStorage on change
  - Provide toggleWidget method
  - Provide setWidgetPosition method
  - Export context and provider
  - _Requirements: AC7_

- [x] 14. Wrap App with Provider
  - Add FloatingWidgetProvider to App.tsx or main.tsx
  - Ensure provider wraps all routes
  - Initialize context state
  - _Requirements: AC7_

## Phase 4: Main Time Page

- [x] 15. Create Time Page Structure
  - Create `src/pages/Time.tsx` file
  - Import all necessary hooks, components, and assets
  - Initialize useTasks hook to get tasks list
  - Initialize useTimeTracking hook to get time entries
  - Initialize useFloatingWidget hook for widget toggle
  - Set up state for modals and selections
  - _Requirements: AC4_

- [x] 16. Create Header Section with Decorations
  - Display "Time Tracking" title with theme-aware color
  - Show description text
  - Add "Toggle Widget" button
  - Apply theme-aware styling to button
  - Add Halloween decorations: witch background, bat, pumpkin, spider, ghost, web
  - Animate decorations (flying bat, peeking pumpkin, hanging spider, appearing ghost)
  - Position decorations with absolute positioning and z-index layering
  - _Requirements: AC7_

- [x] 17. Implement Loading State
  - Check if loading is true and entries array is empty
  - Display skeleton loaders for stats and tracker
  - Use TimeSkeletons component
  - Wrap in motion.div with fade-in animation
  - _Requirements: (loading states)_

- [x] 18. Implement Page Content Rendering
  - Render TimeStats component with time entries
  - Render TimeTracker component with tasks and time entries
  - Pass appropriate props and callbacks
  - Apply theme-aware styling
  - _Requirements: AC1, AC4, AC8_

## Phase 5: Time Tracker Component

- [x] 19. Create TimeTracker Component
  - Create `src/components/tasks/TimeTracker.tsx` file
  - Get running entry from timeEntries (is_running: true)
  - Get paused entry from timeEntries (is_paused: true)
  - Set up state for selectedTaskId, description
  - Use useTimeCalculations to get current duration
  - _Requirements: AC1, AC2_

- [x] 20. Implement Task Selector
  - Add task selector dropdown
  - Display all user tasks
  - Filter out completed tasks (optional)
  - Show task title and project
  - Handle task selection
  - Disable when timer is running
  - _Requirements: AC1_

- [x] 21. Implement Timer Display
  - Display elapsed time in HH:MM:SS format
  - Update every second for running timers
  - Show selected task name
  - Show running indicator (pulsing dot)
  - Show paused indicator (pause icon)
  - Apply theme-aware styling
  - _Requirements: AC1, AC2_

- [x] 22. Implement Timer Controls
  - Add "Start" button (visible when no timer running)
  - Add "Stop" button (visible when timer running or paused)
  - Add "Pause" button (visible when timer running)
  - Add "Resume" button (visible when timer paused)
  - Disable start button if no task selected
  - Handle button clicks with appropriate methods
  - Apply theme-aware styling to all buttons
  - _Requirements: AC1, AC2_

- [x] 23. Implement Description Input
  - Add description textarea
  - Allow adding description while timer runs
  - Save description on stop
  - Make optional
  - _Requirements: AC1, AC3_

- [x] 24. Implement Recent Entries List
  - Display recent time entries (last 10-20)
  - Show task name, duration, start time, description
  - Add edit button for each entry
  - Add delete button for each entry
  - Format duration as HH:MM:SS or "Xh Ym"
  - Apply theme-aware styling
  - _Requirements: AC4_

## Phase 6: Floating Timer Widget

- [x] 25. Create FloatingTimerWidget Component
  - Create `src/components/FloatingTimerWidget.tsx` file
  - Get running/paused entry from useTimeTracking hook
  - Get widget visibility and position from useFloatingWidget context
  - Only render when isWidgetVisible is true and entry exists
  - Use motion.div for draggable functionality
  - _Requirements: AC7_

- [x] 26. Implement Widget Dragging
  - Use Framer Motion drag prop
  - Set dragMomentum to false for precise control
  - Set dragElastic to 0 for no bounce
  - Handle onDragEnd to save position
  - Call setWidgetPosition with new coordinates
  - Keep widget within viewport bounds
  - _Requirements: AC7_

- [x] 27. Implement Widget Display
  - Display current task name (truncated)
  - Display elapsed time in MM:SS format
  - Update time every second
  - Show running indicator (pulsing animation)
  - Show paused indicator (pause icon)
  - Apply theme-aware styling with glass effect
  - _Requirements: AC7_

- [x] 28. Implement Widget Controls
  - Add "Pause" button (visible when running)
  - Add "Resume" button (visible when paused)
  - Add "Stop" button (always visible)
  - Add "Close" button to hide widget
  - Handle button clicks with appropriate methods from useTimeTracking
  - Apply compact styling for small widget size
  - _Requirements: AC7_

- [x] 29. Implement Widget Minimize State
  - Add minimize/expand toggle button
  - Store minimized state in localStorage
  - Show only time and controls when minimized
  - Show full details when expanded
  - Animate transition between states
  - _Requirements: AC7_

- [x] 30. Implement Widget Persistence
  - Load position from localStorage on mount
  - Save position to localStorage on drag end
  - Load visibility state from context
  - Persist across page navigation
  - Handle window resize (keep within bounds)
  - _Requirements: AC7_

## Phase 7: Time Statistics Component

- [x] 31. Create TimeStats Component
  - Create `src/components/tasks/TimeStats.tsx` file
  - Get time entries from useTimeTracking hook
  - Calculate Total Time Tracked (sum of all duration_seconds)
  - Calculate Time Today (sum of entries with start_time today)
  - Calculate Time This Week (sum of entries with start_time this week)
  - Calculate Time This Month (sum of entries with start_time this month)
  - Calculate Average Session Length (total duration / entry count)
  - Display statistics in grid of glass cards (2 columns mobile, 3-4 columns desktop)
  - Use icons: Clock (Total), Calendar (Today), CalendarDays (Week), CalendarRange (Month), TrendingUp (Average)
  - Apply theme-aware colors (teal for Halloween mode)
  - Format durations as "Xh Ym" or "Xm Ys"
  - _Requirements: AC8_

- [x] 32. Implement Time Formatting Utilities
  - Create formatDuration function in `src/lib/timeUtils.ts`
  - Convert seconds to hours, minutes, seconds
  - Format as "Xh Ym" for long durations
  - Format as "Xm Ys" for short durations
  - Format as "HH:MM:SS" for timer display
  - Handle edge cases (0 seconds, negative values)
  - _Requirements: AC6, AC8_

- [x] 33. Implement Most Tracked Tasks
  - Group time entries by task_id
  - Sum duration_seconds for each task
  - Sort tasks by total time descending
  - Display top 5 tasks with names and durations
  - Show in separate card or section
  - _Requirements: AC8_

## Phase 8: Task Integration

- [x] 34. Create TaskTimeStats Component
  - Create `src/components/tasks/TaskTimeStats.tsx` file
  - Accept task prop
  - Display total time for task (from task.total_time_seconds)
  - Display entry count for task
  - Display average session length
  - Display last tracked date
  - Format durations nicely
  - Apply theme-aware styling
  - _Requirements: AC6_

- [x] 35. Add Time Display to Task Details
  - Add TaskTimeStats component to TaskDetailModal
  - Display total time prominently
  - Show "Start Timer" button
  - Link to time tracking page with task pre-selected
  - _Requirements: AC6_

- [x] 36. Add Start Timer Button to Tasks
  - Add timer icon button to TaskItem component
  - Handle click: navigate to time page, start timer for task
  - Show running indicator if task has active timer
  - Apply theme-aware styling
  - _Requirements: AC2_

## Phase 9: Manual Time Entry

- [x] 37. Implement Manual Entry Creation
  - Add "Manual Entry" button to TimeTracker
  - Open modal with form fields
  - Add task selector (required)
  - Add start time picker (required)
  - Add end time picker (required)
  - Add description textarea (optional)
  - Calculate duration_seconds from start and end times
  - Validate end_time > start_time
  - Call createTimeEntry with calculated duration
  - _Requirements: AC3_

- [x] 38. Implement Entry Editing
  - Add edit button to time entry rows
  - Open modal with entry data pre-filled
  - Allow editing start_time, end_time, description
  - Recalculate duration_seconds when times change
  - Validate end_time > start_time
  - Call updateTimeEntry with changes
  - Show success toast
  - _Requirements: AC5_

- [x] 39. Implement Entry Deletion
  - Add delete button to time entry rows
  - Show confirmation modal with entry details
  - On confirm: call deleteTimeEntry with entryId
  - Update task total time automatically via trigger
  - Show success toast
  - _Requirements: AC5_

## Phase 10: Final Polish

- [x] 40. Implement Empty States
  - Add empty state for no time entries (encouraging message, illustration)
  - Add empty state for no running timer
  - Add Halloween-themed empty states when isHalloweenMode is true
  - Use appropriate icons and messages for each state
  - _Requirements: (UX)_

- [x] 41. Implement Confirmation Modals
  - Use existing ConfirmationModal component
  - Configure for time entry deletion with entry details
  - Set type to "danger" for red styling
  - Show appropriate confirmation message
  - Call delete handler on confirm
  - _Requirements: AC5_

- [x] 42. Add Loading Skeletons
  - Create `src/components/skeletons/TimeSkeletons.tsx` file
  - Create skeleton for stats cards
  - Create skeleton for tracker component
  - Create skeleton for entry list
  - Use Skeleton component from UI library
  - Apply theme-aware styling
  - _Requirements: (UX)_

- [x] 43. Implement Single Timer Rule
  - Before starting new timer, check for running entries
  - Stop all running entries (set is_running: false, calculate duration)
  - Show toast: "Stopped previous timer"
  - Then start new timer
  - Ensure only one entry has is_running: true at any time
  - _Requirements: AC2_

- [x] 44. Final Code Review and Cleanup
  - Remove console.log statements
  - Ensure consistent code formatting with Biome
  - Check for unused imports and variables
  - Verify all error messages are user-friendly
  - Add comments for complex logic (duration calculations, pause tracking)
  - Verify all components have proper TypeScript types
  - Check for any hardcoded values that should be constants
  - Verify all requirements are met
  - _Requirements: All_
