# Requirements Document

## Introduction

This document specifies the requirements for implementing a comprehensive Pomodoro timer system for Integral. The system provides customizable work/break intervals, session tracking with pause functionality, task association, session history, statistics, and auto-start capabilities. The design prioritizes focus management, productivity tracking, and seamless integration with the existing task management system.

## Glossary

- **Pomodoro Session**: A timed work or break period with configurable duration
- **Work Session**: A focused work period (default 25 minutes)
- **Short Break**: A brief rest period between work sessions (default 5 minutes)
- **Long Break**: An extended rest period after multiple work sessions (default 15 minutes)
- **Session Type**: The mode of a Pomodoro session (work, short_break, long_break)
- **Pause Time**: Time spent with the timer paused, tracked separately from session duration
- **Completion**: When a session runs to zero and is marked as completed
- **Auto-start**: Automatic initiation of the next session based on user settings
- **Session Count**: Number of completed work sessions used to determine long break timing
- **Optimistic Update**: UI update that occurs immediately before server confirmation
- **Integral**: The productivity suite application

## Requirements

### Requirement 1

**User Story:** As a user, I want to start Pomodoro sessions with customizable durations, so that I can maintain focus and take regular breaks.

#### Acceptance Criteria

1. WHEN a user clicks "Start" on a work session, THE **Integral** application SHALL create a **Pomodoro Session** with session_type "work" and duration from settings
2. WHEN a user clicks "Start" on a short break, THE **Integral** application SHALL create a **Pomodoro Session** with session_type "short_break" and duration from settings
3. WHEN a user clicks "Start" on a long break, THE **Integral** application SHALL create a **Pomodoro Session** with session_type "long_break" and duration from settings
4. THE timer SHALL count down in real-time with 1-second intervals
5. THE timer SHALL display time remaining in MM:SS format
6. THE timer SHALL display a circular progress indicator showing percentage complete
7. WHEN the timer reaches zero, THE **Integral** application SHALL mark the session as completed and display a completion notification
8. THE **Integral** application SHALL play a completion sound if sound_enabled setting is true

### Requirement 2

**User Story:** As a user, I want to pause and resume sessions, so that I can handle interruptions without losing my progress.

#### Acceptance Criteria

1. WHEN a user clicks "Pause" during a running session, THE **Integral** application SHALL pause the timer and record the pause start time
2. WHEN a session is paused, THE timer SHALL stop counting down
3. WHEN a user clicks "Resume" on a paused session, THE **Integral** application SHALL calculate the pause duration and add it to total_paused_seconds
4. WHEN a session is resumed, THE timer SHALL continue counting down from where it stopped
5. THE **Integral** application SHALL track total_paused_seconds separately from session duration
6. WHEN a user clicks "Stop" during a running or paused session, THE **Integral** application SHALL reset the timer without marking the session as completed
7. THE pause time SHALL be stored in the database for accurate time tracking

### Requirement 3

**User Story:** As a user, I want to customize timer durations and behavior, so that I can adapt the Pomodoro technique to my work style.

#### Acceptance Criteria

1. THE **Integral** application SHALL provide a settings modal with all configuration options
2. THE settings modal SHALL allow work duration customization (1-60 minutes)
3. THE settings modal SHALL allow short break duration customization (1-30 minutes)
4. THE settings modal SHALL allow long break duration customization (1-60 minutes)
5. THE settings modal SHALL allow sessions until long break customization (1-10 sessions)
6. THE settings modal SHALL provide an auto-start breaks toggle
7. THE settings modal SHALL provide an auto-start work toggle
8. THE settings modal SHALL provide a sound enabled toggle
9. THE **Integral** application SHALL persist settings to the database
10. THE **Integral** application SHALL apply settings changes immediately to the timer
11. THE **Integral** application SHALL use default settings (25/5/15 minutes, 4 sessions) if no user settings exist

### Requirement 4

**User Story:** As a user, I want my completed sessions to be tracked, so that I can review my focus patterns over time.

#### Acceptance Criteria

1. WHEN a session completes, THE **Integral** application SHALL save the session to the database with completed: true
2. THE saved session SHALL include session_type, duration_minutes, started_at, completed_at
3. THE saved session SHALL include total_paused_seconds if the session was paused
4. THE saved session SHALL include task_id if the session was associated with a task
5. THE saved session SHALL include notes if the user added notes
6. THE **Integral** application SHALL create the session record when the timer starts (not when it completes)
7. THE **Integral** application SHALL update the session record when paused, resumed, or completed

### Requirement 5

**User Story:** As a user, I want to view my session history, so that I can review past Pomodoro sessions and add notes.

#### Acceptance Criteria

1. THE **Integral** application SHALL provide a History mode displaying all completed sessions
2. THE session list SHALL display session type, duration, start time, completion status for each session
3. THE session list SHALL display task name if the session was associated with a task
4. THE session list SHALL display notes if present
5. THE session list SHALL use virtualized scrolling for performance with 100+ sessions
6. THE session list SHALL implement pagination with "Load More" functionality (50 sessions per page)
7. WHEN a user clicks "Edit Notes" on a session, THE **Integral** application SHALL allow inline editing of session notes
8. WHEN a user clicks "Delete" on a session, THE **Integral** application SHALL show a confirmation modal
9. WHEN deletion is confirmed, THE **Integral** application SHALL remove the session and display a success toast
10. THE **Integral** application SHALL display an empty state when no sessions exist

### Requirement 6

**User Story:** As a user, I want to see statistics about my Pomodoro sessions, so that I can understand my focus patterns and productivity.

#### Acceptance Criteria

1. THE **Integral** application SHALL display Total Sessions count (all sessions)
2. THE **Integral** application SHALL display Completed Sessions count (sessions that ran to completion)
3. THE **Integral** application SHALL display Total Work Time (sum of completed work session durations)
4. THE **Integral** application SHALL display Completion Rate (completed / total × 100)
5. THE statistics SHALL be displayed in glass cards with appropriate icons
6. THE statistics SHALL update in real-time as sessions are completed
7. THE **Integral** application SHALL format work time as hours and minutes (e.g., "2h 30m")
8. THE **Integral** application SHALL handle edge cases (0 sessions, 0 completed sessions)

### Requirement 7

**User Story:** As a user, I want to associate Pomodoro sessions with tasks, so that I can track time spent on specific work.

#### Acceptance Criteria

1. THE timer SHALL provide an optional task selector dropdown
2. THE task selector SHALL display all user tasks
3. WHEN a user selects a task before starting a session, THE **Integral** application SHALL associate the session with that task
4. THE session record SHALL include task_id when associated
5. THE timer SHALL display the selected task name during the session
6. THE task association SHALL be optional (sessions can exist without tasks)
7. THE session SHALL be visible in task details (if task management integration exists)

### Requirement 8

**User Story:** As a user, I want automatic session transitions, so that I can maintain my Pomodoro flow without manual intervention.

#### Acceptance Criteria

1. WHEN a work session completes and auto_start_breaks is enabled, THE **Integral** application SHALL automatically start the appropriate break session
2. WHEN a break session completes and auto_start_work is enabled, THE **Integral** application SHALL automatically start a work session
3. THE **Integral** application SHALL determine break type based on session count: short break for sessions 1-3, long break after N sessions (from settings)
4. THE **Integral** application SHALL show a countdown toast (5 seconds) before auto-starting
5. THE countdown toast SHALL include a "Cancel" button to prevent auto-start
6. WHEN a user cancels auto-start, THE **Integral** application SHALL respect the user's choice and not start the session
7. THE **Integral** application SHALL track completed work session count to determine long break timing
8. THE session count SHALL reset after a long break

### Requirement 9

**User Story:** As a user, I want the Pomodoro interface to support Halloween theme mode, so that I can enjoy seasonal decorations while focusing.

#### Acceptance Criteria

1. WHEN Halloween mode is enabled, THE **Integral** application SHALL display teal accent color (#60c9b6) instead of default red
2. WHEN Halloween mode is enabled, THE Pomodoro page header SHALL display animated decorations (bat, pumpkin, spider, web, ghost, witch)
3. WHEN Halloween mode is enabled, THE mode buttons SHALL use teal color for active state
4. WHEN Halloween mode is enabled, THE progress ring SHALL use teal color
5. THE **Integral** application SHALL apply Halloween styling consistently across all Pomodoro views
6. WHEN Halloween mode is disabled, THE **Integral** application SHALL revert to standard theme colors

### Requirement 10

**User Story:** As a developer, I want centralized Pomodoro state management with optimistic updates, so that the UI feels instant and data stays synchronized with the database.

#### Acceptance Criteria

1. THE **Integral** application SHALL use TanStack Query with query keys ["pomodoro-settings", userId], ["pomodoro-sessions", userId], ["pomodoro-stats", userId]
2. WHEN a session is created, THE **Integral** application SHALL add it to the local cache immediately before server confirmation
3. WHEN a session is paused, THE **Integral** application SHALL update it in the local cache immediately before server confirmation
4. WHEN a session is resumed, THE **Integral** application SHALL update it in the local cache immediately before server confirmation
5. WHEN a session is completed, THE **Integral** application SHALL update it in the local cache immediately before server confirmation
6. WHEN a session is deleted, THE **Integral** application SHALL remove it from the local cache immediately before server confirmation
7. WHEN a server operation fails, THE **Integral** application SHALL rollback the **Optimistic Update** and display an error toast
8. THE **Integral** application SHALL configure query staleTime to 5-10 minutes and gcTime to 10-30 minutes
9. THE **Integral** application SHALL fetch sessions ordered by started_at descending

### Requirement 11

**User Story:** As a user, I want smooth navigation with URL state synchronization, so that I can bookmark specific modes and use browser navigation.

#### Acceptance Criteria

1. WHEN a user switches modes, THE **Integral** application SHALL update the URL with a mode query parameter
2. WHEN a user loads the page with URL parameters, THE **Integral** application SHALL restore the selected mode
3. THE **Integral** application SHALL support modes: "work", "short_break", "long_break", "history"
4. WHEN a user uses browser back/forward buttons, THE **Integral** application SHALL navigate between mode states
5. THE **Integral** application SHALL use replace mode for URL updates to avoid cluttering browser history
