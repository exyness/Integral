# Pomodoro Timer - Implementation Tasks

## Phase 1: Database and Type Definitions

- [x] 1. Verify Database Schema
  - Review `supabase/migrations/20251119045332_remote_schema.sql` to confirm pomodoro_sessions and pomodoro_settings table structure
  - Verify pomodoro_sessions table has columns: id (UUID PK), user_id (UUID FK), task_id (UUID FK nullable), session_type (TEXT CHECK IN 'work'/'short_break'/'long_break'), duration_minutes (INTEGER NOT NULL), completed (BOOLEAN DEFAULT false), started_at (TIMESTAMPTZ DEFAULT NOW()), completed_at (TIMESTAMPTZ), is_paused (BOOLEAN DEFAULT false), paused_at (TIMESTAMPTZ), total_paused_seconds (INTEGER DEFAULT 0), notes (TEXT), created_at (TIMESTAMPTZ), updated_at (TIMESTAMPTZ)
  - Verify pomodoro_settings table has columns: id (UUID PK), user_id (UUID FK UNIQUE), work_duration (INTEGER DEFAULT 25), short_break_duration (INTEGER DEFAULT 5), long_break_duration (INTEGER DEFAULT 15), sessions_until_long_break (INTEGER DEFAULT 4), auto_start_breaks (BOOLEAN DEFAULT false), auto_start_work (BOOLEAN DEFAULT false), sound_enabled (BOOLEAN DEFAULT true), created_at (TIMESTAMPTZ), updated_at (TIMESTAMPTZ)
  - Confirm RLS policies exist for SELECT, INSERT, UPDATE, DELETE operations (WHERE auth.uid() = user_id)
  - Verify foreign key constraints: pomodoro_sessions.user_id → auth.users.id, pomodoro_sessions.task_id → tasks.id
  - Verify indexes exist: idx_pomodoro_sessions_user_id, idx_pomodoro_sessions_task_id
  - Verify trigger exists: update_pomodoro_sessions_updated_at trigger calls update_updated_at_column() function
  - TypeScript types are auto-generated in `src/integrations/supabase/types.ts`
  - _Requirements: AC1, AC4_

- [x] 2. Create Type Definitions
  - Define PomodoroMode type as union ("work" | "short_break" | "long_break")
  - Define PomodoroSession interface with all fields and proper types
  - Define PomodoroSettings interface with all configuration fields
  - Export all types from usePomodoro hook
  - _Requirements: AC1, AC3_

## Phase 2: Core Data Management Hook

- [x] 3. Implement usePomodoro Hook - Settings Query
  - Create `src/hooks/usePomodoro.ts` file
  - Set up useQuery with key ["pomodoro-settings", userId] to fetch user settings
  - Define DEFAULT_SETTINGS constant with standard Pomodoro values (25/5/15 minutes, 4 sessions)
  - Return default settings if no user settings exist
  - Configure staleTime: 10 minutes, gcTime: 30 minutes
  - Return settings, loading state
  - _Requirements: AC3_

- [x] 4. Implement usePomodoro Hook - Stats Query
  - Set up useQuery with key ["pomodoro-stats", userId] to fetch session statistics
  - Calculate total sessions, completed sessions, work sessions, total minutes
  - Filter completed sessions for accurate time tracking
  - Configure staleTime: 5 minutes
  - Return statsData with all calculated values
  - _Requirements: AC6_

- [x] 5. Implement usePomodoro Hook - Sessions Query
  - Set up useQuery with key ["pomodoro-sessions", userId, limit] to fetch user sessions
  - Order sessions by started_at descending
  - Implement pagination with limit parameter (default 50)
  - Implement loadMore method to increase limit by 50
  - Configure staleTime: 5 minutes, gcTime: 10 minutes
  - Return sessions array, loading state, hasMore boolean
  - _Requirements: AC5_

- [x] 6. Implement Settings Update Mutation
  - Create useUpdateSettings mutation
  - Check if settings exist for user (upsert logic)
  - If exists: update settings, else: insert new settings
  - Implement optimistic update: update settings in cache immediately
  - Show success toast on completion
  - Show error toast and rollback on failure
  - _Requirements: AC3_

- [x] 7. Implement Session Creation Mutation
  - Create useCreateSession mutation
  - Accept sessionType, durationMinutes, taskId (optional), notes (optional)
  - Insert session with user_id, session_type, duration_minutes, task_id, notes, started_at
  - Implement optimistic update: add session to beginning of cache array
  - Return Promise<PomodoroSession | null> for async/await usage
  - Show error toast on failure
  - _Requirements: AC1, AC4, AC7_

- [x] 8. Implement Pause Session Mutation
  - Create usePauseSession mutation
  - Update session with is_paused: true, paused_at: current timestamp
  - Implement optimistic update: update session in cache immediately
  - Show error toast and rollback on failure
  - _Requirements: AC2_

- [x] 9. Implement Resume Session Mutation
  - Create useResumeSession mutation
  - Find session and verify it's paused
  - Calculate pause duration: current time - paused_at
  - Add pause duration to total_paused_seconds
  - Update session with is_paused: false, paused_at: null, total_paused_seconds
  - Implement optimistic update: update session in cache immediately
  - Show error toast and rollback on failure
  - _Requirements: AC2_

- [x] 10. Implement Complete Session Mutation
  - Create useCompleteSession mutation
  - Update session with completed: true, completed_at: current timestamp
  - Implement optimistic update: update session in cache immediately
  - Invalidate stats query to refresh statistics
  - Show error toast and rollback on failure
  - _Requirements: AC1, AC4_

- [x] 11. Implement Update Notes Mutation
  - Create useUpdateNotes mutation
  - Accept sessionId and notes parameters
  - Update session notes field
  - Implement optimistic update: update session in cache immediately
  - Show success toast on completion
  - Show error toast and rollback on failure
  - _Requirements: AC4, AC5_

- [x] 12. Implement Delete Session Mutation
  - Create useDeleteSession mutation
  - Delete session by ID from database
  - Implement optimistic update: remove session from cache immediately
  - Invalidate both sessions and stats queries to refresh all data
  - Show success toast on completion
  - Show error toast and rollback on failure
  - _Requirements: AC5_

- [x] 13. Implement Statistics Methods
  - Create getTodayStats method: filter sessions by today's date, calculate totals
  - Create getAllTimeStats method: return statsData from query
  - Create refreshSessions method: invalidate sessions query
  - Return all methods from hook
  - _Requirements: AC6_

## Phase 3: Main Pomodoro Page

- [x] 14. Create Pomodoro Page Structure
  - Create `src/pages/Pomodoro.tsx` file
  - Import all necessary hooks, components, and assets
  - Set up state for currentMode, showSettings
  - Initialize usePomodoro hook
  - Get stats with getAllTimeStats method
  - _Requirements: AC1_

- [x] 15. Implement URL State Synchronization
  - Use useSearchParams to read mode from URL
  - Initialize currentMode from URL mode parameter (default: "work")
  - Support modes: "work", "short_break", "long_break", "history"
  - Implement handleModeChange to update currentMode and URL
  - Use useEffect to sync URL parameters with state on mount
  - _Requirements: (navigation)_

- [x] 16. Create Mode Navigation
  - Create mode buttons for: Work, Short Break, Long Break, History
  - Apply mode-specific colors: Work (red), Short Break (green), Long Break (blue)
  - Highlight active mode with background color
  - Add icons for each mode
  - Handle mode change on click
  - Apply Halloween theme colors when enabled (teal)
  - _Requirements: AC1_

- [x] 17. Create Header Section with Decorations
  - Display "Pomodoro Timer" title with theme-aware color
  - Show mode-specific description text
  - Add "Settings" button with gear icon
  - Apply theme-aware styling to button
  - Add Halloween decorations: witch background, bat, pumpkin, spider, ghost, web
  - Animate decorations (flying bat, peeking pumpkin, hanging spider, appearing ghost)
  - Position decorations with absolute positioning and z-index layering
  - _Requirements: AC1_

- [x] 18. Implement Loading State
  - Check if loading is true
  - Display skeleton loaders for stats and timer
  - Use PomodoroSkeleton for timer view
  - Use PomodoroHistorySkeleton for history view
  - Wrap in motion.div with fade-in animation
  - _Requirements: (loading states)_

- [x] 19. Implement Mode Content Rendering
  - Use conditional rendering based on currentMode
  - For "work", "short_break", "long_break": render PomodoroStats and PomodoroTimer
  - For "history": render PomodoroHistory
  - Pass appropriate props and callbacks to each component
  - _Requirements: AC1, AC5_

## Phase 4: Timer Component

- [x] 20. Create PomodoroTimer Component
  - Create `src/components/pomodoro/PomodoroTimer.tsx` file
  - Accept mode, onSessionComplete, onModeChange props
  - Set up timer state: timeLeft, isRunning, isPaused, currentSession
  - Initialize timeLeft based on mode and settings
  - Implement countdown logic with setInterval (1 second intervals)
  - Clear interval on unmount or when timer stops
  - _Requirements: AC1, AC2_

- [x] 21. Implement Timer Display
  - Display large circular progress indicator
  - Calculate progress percentage: (timeLeft / totalTime) × 100
  - Display time in MM:SS format using AnimatedNumbers component
  - Display session type label
  - Display task name if session is associated with task
  - Apply mode-specific colors to progress ring
  - Apply Halloween theme colors when enabled
  - _Requirements: AC1_

- [x] 22. Implement Timer Controls
  - Add Start button (visible when idle)
  - Add Pause button (visible when running)
  - Add Resume button (visible when paused)
  - Add Stop button (visible when running or paused)
  - Disable/enable buttons based on timer state
  - Apply theme-aware styling to all buttons
  - _Requirements: AC2_

- [x] 23. Implement Start Session Logic
  - On start: call createSession from usePomodoro hook
  - Pass mode, duration, optional taskId
  - Store returned session in currentSession state
  - Set isRunning to true
  - Start countdown
  - _Requirements: AC1, AC4, AC7_

- [x] 24. Implement Pause/Resume Logic
  - On pause: call pauseSession with currentSession.id
  - Set isPaused to true, stop countdown
  - On resume: call resumeSession with currentSession.id
  - Set isPaused to false, continue countdown
  - Track pause time in database
  - _Requirements: AC2_

- [x] 25. Implement Stop Logic
  - On stop: reset timer state
  - Set isRunning to false, isPaused to false
  - Clear currentSession
  - Reset timeLeft to initial duration
  - Do not mark session as completed
  - _Requirements: AC2_

- [x] 26. Implement Complete Logic
  - When timeLeft reaches 0: call completeSession with currentSession.id
  - Play completion sound if sound_enabled is true
  - Show completion toast with congratulations message
  - Call onSessionComplete callback
  - Reset timer state
  - Suggest next session based on mode and session count
  - _Requirements: AC1, AC4_

- [x] 27. Implement Task Association
  - Add task selector dropdown (optional)
  - Fetch user tasks from tasks table
  - Allow selecting task before starting session
  - Pass taskId to createSession when starting
  - Display selected task name during session
  - Make task association optional
  - _Requirements: AC7_

- [x] 28. Create AnimatedNumbers Component
  - Create `src/components/pomodoro/AnimatedNumbers.tsx` file
  - Accept value prop (number of seconds)
  - Format as MM:SS
  - Use Framer Motion for smooth transitions
  - Animate number changes with spring physics
  - Apply theme-aware text colors
  - _Requirements: AC1_

## Phase 5: Statistics Component

- [x] 29. Create PomodoroStats Component
  - Create `src/components/pomodoro/PomodoroStats.tsx` file
  - Get stats from usePomodoro hook (getAllTimeStats)
  - Calculate and display Total Sessions
  - Calculate and display Completed Sessions
  - Calculate and display Total Work Time (format as hours and minutes)
  - Calculate and display Completion Rate (percentage)
  - Display statistics in grid of glass cards (2 columns mobile, 4 columns desktop)
  - Use icons: Timer (Total), CheckCircle (Completed), Clock (Work Time), TrendingUp (Rate)
  - Apply theme-aware colors (teal for Halloween mode)
  - _Requirements: AC6_

- [x] 30. Implement Time Formatting
  - Create formatTime utility function
  - Convert minutes to hours and minutes
  - Display as "Xh Ym" format
  - Handle edge cases (0 minutes, < 60 minutes, > 60 minutes)
  - _Requirements: AC6_

- [x] 31. Implement Completion Rate Calculation
  - Calculate as (completed / total) × 100
  - Round to 1 decimal place
  - Display with percentage symbol
  - Handle division by zero (show 0% if no sessions)
  - _Requirements: AC6_

## Phase 6: History Component

- [x] 32. Create PomodoroHistory Component
  - Create `src/components/pomodoro/PomodoroHistory.tsx` file
  - Get sessions from usePomodoro hook
  - Display sessions in list format using Virtuoso for performance
  - Show session type, duration, date/time, completion status
  - Show task name if associated
  - Show notes if present
  - Apply theme-aware styling
  - _Requirements: AC5_

- [x] 33. Implement Session List Item
  - Display session type badge with color coding
  - Display duration in minutes
  - Display start time with date and time formatting
  - Display completion status (checkmark or X)
  - Display task name with link to task (if associated)
  - Display notes preview (truncated to 2 lines)
  - Add click to expand/view full details
  - _Requirements: AC5_

- [x] 34. Implement Session Actions
  - Add "Edit Notes" button that opens inline editor
  - Add "Delete" button with confirmation modal
  - Handle notes update: call updateNotes from usePomodoro
  - Handle delete: call deleteSession from usePomodoro
  - Show success/error toasts for actions
  - _Requirements: AC5_

- [x] 35. Implement Pagination
  - Display "Load More" button at bottom of list
  - Call loadMore from usePomodoro hook
  - Show loading indicator while loading more
  - Hide button when hasMore is false
  - Display total count: "Showing X of Y sessions"
  - _Requirements: AC5_

- [x] 36. Implement Empty State
  - Check if sessions array is empty
  - Display encouraging message: "No sessions yet. Start your first Pomodoro!"
  - Add Halloween-themed illustration when isHalloweenMode is true
  - Add "Start Session" button that switches to work mode
  - _Requirements: (UX)_

## Phase 7: Settings Modal

- [x] 37. Create PomodoroSettingsModal Component
  - Create `src/components/pomodoro/PomodoroSettingsModal.tsx` file
  - Use Modal component as base
  - Get settings from usePomodoro hook
  - Display all settings fields with current values
  - _Requirements: AC3_

- [x] 38. Implement Settings Form Fields
  - Add work duration input (1-60 minutes, number type)
  - Add short break duration input (1-30 minutes, number type)
  - Add long break duration input (1-60 minutes, number type)
  - Add sessions until long break input (1-10, number type)
  - Add auto-start breaks toggle (checkbox)
  - Add auto-start work toggle (checkbox)
  - Add sound enabled toggle (checkbox)
  - Use React Hook Form for form management
  - _Requirements: AC3_

- [x] 39. Implement Settings Validation
  - Validate work duration: 1-60 minutes
  - Validate short break duration: 1-30 minutes
  - Validate long break duration: 1-60 minutes
  - Validate sessions until long break: 1-10
  - Display inline error messages below fields
  - Prevent form submission until valid
  - _Requirements: AC3_

- [x] 40. Implement Settings Save
  - On submit: call updateSettings from usePomodoro hook
  - Pass all settings fields
  - Show success toast on completion
  - Close modal on success
  - Apply settings immediately to timer
  - _Requirements: AC3_

- [x] 41. Implement Default Settings
  - If no settings exist for user, use DEFAULT_SETTINGS
  - Standard Pomodoro values: 25/5/15 minutes, 4 sessions
  - Auto-start disabled by default
  - Sound enabled by default
  - _Requirements: AC3_

## Phase 8: Sound Notifications

- [x] 42. Implement Completion Sound
  - Add completion sound file to assets
  - Play sound when session completes
  - Check sound_enabled setting before playing
  - Handle audio playback errors gracefully
  - Use Web Audio API or HTML5 audio element
  - _Requirements: (notifications)_

- [x] 43. Implement Visual Notifications
  - Show toast notification on session complete
  - Display congratulations message
  - Suggest next session type
  - Apply theme-aware styling to toast
  - _Requirements: (notifications)_

## Phase 9: Auto-start Logic

- [x] 44. Implement Auto-start After Work
  - Check auto_start_breaks setting
  - When work session completes, check setting
  - If enabled: automatically start appropriate break
  - Determine break type: short or long based on session count
  - Show countdown toast before auto-starting (5 seconds)
  - Allow user to cancel auto-start
  - _Requirements: AC3_

- [x] 45. Implement Auto-start After Break
  - Check auto_start_work setting
  - When break session completes, check setting
  - If enabled: automatically start work session
  - Show countdown toast before auto-starting (5 seconds)
  - Allow user to cancel auto-start
  - _Requirements: AC3_

- [x] 46. Implement Session Count Tracking
  - Track completed work sessions count
  - Reset count after long break
  - Use count to determine when to suggest long break
  - Check sessions_until_long_break setting
  - _Requirements: AC3_

## Phase 10: Final Polish

- [x] 47. Implement Confirmation Modals
  - Use existing ConfirmationModal component
  - Configure for session deletion with session details
  - Configure for stopping active session
  - Set type to "danger" for red styling
  - Show appropriate confirmation message
  - Call delete/stop handler on confirm
  - _Requirements: AC2, AC5_

- [x] 48. Add Loading Skeletons
  - Create `src/components/skeletons/PomodoroSkeletons.tsx` file
  - Create PomodoroSkeleton with timer and stats skeletons
  - Create PomodoroHistorySkeleton with session list skeletons
  - Use Skeleton component from UI library
  - Apply theme-aware styling
  - _Requirements: (UX)_

- [x] 49. Implement Responsive Design
  - Test timer display on mobile (adjust size)
  - Test stats cards on mobile (2 columns)
  - Test history list on mobile (full width)
  - Test settings modal on mobile (scrollable)
  - Verify all buttons are touch-friendly (44x44px minimum)
  - _Requirements: (responsive)_

- [x] 50. Final Code Review and Cleanup
  - Remove console.log statements
  - Ensure consistent code formatting with Biome
  - Check for unused imports and variables
  - Verify all error messages are user-friendly
  - Add comments for complex logic (pause tracking, auto-start)
  - Verify all components have proper TypeScript types
  - Check for any hardcoded values that should be constants
  - Verify all requirements are met
  - _Requirements: All_
