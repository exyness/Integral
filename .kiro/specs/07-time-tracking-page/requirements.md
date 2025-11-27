# Requirements Document

## Introduction

This document specifies the requirements for implementing a comprehensive time tracking system for Integral. The system provides time entry creation with start/stop timers, manual time entry, task association, filtering, statistics, and a persistent floating timer widget. The design prioritizes accurate time tracking, seamless task integration, and real-time feedback for productivity monitoring.

## Glossary

- **Time Entry**: A record of time spent on a task with start time, optional end time, duration, and description
- **Active Entry**: A time entry that is currently running (no end_time)
- **Duration**: The calculated time between start_time and end_time in minutes
- **Floating Timer Widget**: A persistent, draggable UI component displaying the active timer across all pages
- **Time Stats**: Aggregated time tracking metrics (today, week, month, total, average)
- **Task Association**: The link between a time entry and a specific task
- **Optimistic Update**: UI update that occurs immediately before server confirmation
- **Integral**: The productivity suite application

## Requirements

### Requirement 1

**User Story:** As a user, I want to start and stop timers for tasks, so that I can accurately track time spent on different activities.

#### Acceptance Criteria

1. WHEN a user selects a task and clicks "Start Tracking", THE **Integral** application SHALL create a new **Time Entry** with start_time set to current timestamp
2. WHEN a timer is started, THE **Integral** application SHALL stop any other **Active Entry** before creating the new entry
3. WHEN a timer is running, THE **Integral** application SHALL display elapsed time updating every second
4. WHEN a user clicks "Stop", THE **Integral** application SHALL set end_time to current timestamp and calculate **Duration**
5. THE **Integral** application SHALL calculate duration as the difference between end_time and start_time in minutes
6. THE **Integral** application SHALL allow only one **Active Entry** at a time
7. WHEN a timer is started, THE **Integral** application SHALL display a success toast notification
8. WHEN a timer is stopped, THE **Integral** application SHALL display a success toast notification

### Requirement 2

**User Story:** As a user, I want to add optional descriptions to time entries, so that I can provide context about what I was working on.

#### Acceptance Criteria

1. THE timer start form SHALL provide an optional description input field
2. THE description field SHALL accept text up to 500 characters
3. WHEN a user provides a description, THE **Integral** application SHALL store it with the **Time Entry**
4. THE time entry list SHALL display the description when present
5. THE description field SHALL support editing after entry creation
6. THE description SHALL be optional and not required for timer operation

### Requirement 3

**User Story:** As a user, I want to view all my time entries in a list, so that I can review my time tracking history.

#### Acceptance Criteria

1. THE **Integral** application SHALL display all time entries in a list format ordered by start_time descending
2. THE entry list SHALL display task title, project name, start time, end time, duration, and description for each entry
3. THE entry list SHALL indicate **Active Entry** with a visual indicator (green dot and "Active" badge)
4. THE entry list SHALL use virtualized scrolling for performance with 100+ entries
5. THE entry list SHALL display date labels grouping entries by day
6. THE **Integral** application SHALL display an empty state when no entries exist
7. THE empty state SHALL include an encouraging message and call-to-action

### Requirement 4

**User Story:** As a user, I want to filter and search time entries, so that I can find specific tracking sessions quickly.

#### Acceptance Criteria

1. THE Entries tab SHALL provide a search input that filters by task title, description, and project name
2. THE Entries tab SHALL provide a task filter dropdown showing all tasks
3. THE Entries tab SHALL provide a date range filter with start and end date pickers
4. THE **Integral** application SHALL combine filters with AND logic
5. THE **Integral** application SHALL debounce search input by 300ms
6. THE search SHALL be case-insensitive
7. THE **Integral** application SHALL display "No entries found" message when no entries match filters
8. WHEN filters are cleared, THE **Integral** application SHALL display all entries

### Requirement 5

**User Story:** As a user, I want to edit and delete time entries, so that I can correct mistakes or adjust tracking data.

#### Acceptance Criteria

1. WHEN a user clicks an entry's edit button, THE **Integral** application SHALL display the time entry edit modal
2. THE edit modal SHALL allow modifying task, description, start_time, end_time, and duration
3. WHEN start_time or end_time is changed, THE **Integral** application SHALL recalculate duration automatically
4. WHEN a user saves changes, THE **Integral** application SHALL update the entry and display a success toast
5. WHEN a user clicks delete button, THE **Integral** application SHALL display a confirmation modal
6. WHEN deletion is confirmed, THE **Integral** application SHALL remove the entry and display a success toast
7. THE **Integral** application SHALL validate that start_time is before end_time
8. THE **Integral** application SHALL validate that duration is non-negative

### Requirement 6

**User Story:** As a user, I want to see time tracking statistics, so that I can understand my productivity patterns.

#### Acceptance Criteria

1. THE **Integral** application SHALL display total time tracked across all entries
2. THE **Integral** application SHALL display time tracked today (entries with start_time on current date)
3. THE **Integral** application SHALL display time tracked this week (entries with start_time in current week)
4. THE **Integral** application SHALL display time tracked this month (entries with start_time in current month)
5. THE **Integral** application SHALL display average time per day (total time divided by days with entries)
6. THE **Integral** application SHALL format time statistics as "Xh Ym" for hours and minutes
7. THE **Integral** application SHALL update statistics in real-time as timers run
8. THE **Integral** application SHALL recalculate statistics when entries are created, updated, or deleted

### Requirement 7

**User Story:** As a user, I want a persistent floating timer widget, so that I can see my active timer from any page without switching views.

#### Acceptance Criteria

1. WHEN a timer is running, THE **Integral** application SHALL display the **Floating Timer Widget** on all pages
2. THE **Floating Timer Widget** SHALL display the task title and elapsed time
3. THE **Floating Timer Widget** SHALL update elapsed time every second
4. THE **Floating Timer Widget** SHALL provide a "Stop" button to end the active timer
5. THE **Floating Timer Widget** SHALL be draggable to any position on the screen
6. THE **Integral** application SHALL persist the widget position in localStorage
7. WHEN the page is reloaded, THE **Integral** application SHALL restore the widget to its saved position
8. WHEN no timer is running, THE **Floating Timer Widget** SHALL not be displayed

### Requirement 8

**User Story:** As a user, I want tab navigation for different time tracking views, so that I can easily switch between tracking, entries, and statistics.

#### Acceptance Criteria

1. THE **Integral** application SHALL provide three tabs: Tracker, Entries, Statistics
2. THE Tracker tab SHALL display the timer controls and quick statistics
3. THE Entries tab SHALL display the filtered time entry list
4. THE Statistics tab SHALL display detailed time tracking statistics
5. WHEN a user switches tabs, THE **Integral** application SHALL update the URL with a tab query parameter
6. WHEN a user loads the page with a tab parameter, THE **Integral** application SHALL display the specified tab
7. WHEN a user uses browser back/forward buttons, THE **Integral** application SHALL navigate between tab states
8. THE **Integral** application SHALL use replace mode for URL updates to avoid cluttering browser history

### Requirement 9

**User Story:** As a user, I want the time tracking interface to support Halloween theme mode, so that I can enjoy seasonal decorations while tracking time.

#### Acceptance Criteria

1. WHEN Halloween mode is enabled, THE **Integral** application SHALL display teal accent color (#60c9b6) instead of default blue
2. WHEN Halloween mode is enabled, THE time tracking page header SHALL display animated decorations (bat, pumpkin, spider, web, ghost, witch)
3. WHEN Halloween mode is enabled, THE tab indicator and buttons SHALL use teal color
4. WHEN Halloween mode is enabled, THE empty states SHALL display Halloween-themed illustrations
5. THE **Integral** application SHALL apply Halloween styling consistently across all time tracking views
6. WHEN Halloween mode is disabled, THE **Integral** application SHALL revert to standard theme colors

### Requirement 10

**User Story:** As a developer, I want centralized time tracking state management with optimistic updates, so that the UI feels instant and data stays synchronized with the database.

#### Acceptance Criteria

1. THE **Integral** application SHALL use TanStack Query with query key ["time-entries", userId]
2. WHEN an entry is created, THE **Integral** application SHALL add it to the local cache immediately before server confirmation
3. WHEN an entry is updated, THE **Integral** application SHALL update it in the local cache immediately before server confirmation
4. WHEN an entry is deleted, THE **Integral** application SHALL remove it from the local cache immediately before server confirmation
5. WHEN a server operation fails, THE **Integral** application SHALL rollback the **Optimistic Update** and display an error toast
6. THE **Integral** application SHALL configure query staleTime to 5 minutes and gcTime to 10 minutes
7. THE **Integral** application SHALL fetch entries ordered by start_time descending
8. THE **Integral** application SHALL include task and project data in entry queries using join

### Requirement 11

**User Story:** As a user, I want accurate time calculations, so that my tracked time reflects actual work duration.

#### Acceptance Criteria

1. WHEN a timer is stopped, THE **Integral** application SHALL calculate duration as (end_time - start_time) in minutes
2. THE **Integral** application SHALL round duration to the nearest minute
3. WHEN displaying elapsed time for running timers, THE **Integral** application SHALL show hours, minutes, and seconds
4. WHEN displaying completed entry duration, THE **Integral** application SHALL show hours and minutes
5. THE **Integral** application SHALL validate that end_time is after start_time
6. THE **Integral** application SHALL validate that duration is non-negative
7. THE **Integral** application SHALL handle timezone differences correctly using ISO timestamps
8. THE **Integral** application SHALL update running timer display every second without drift

### Requirement 12

**User Story:** As a user, I want time entries to be associated with tasks, so that I can see total time spent per task.

#### Acceptance Criteria

1. WHEN creating a time entry, THE **Integral** application SHALL require task selection
2. THE time entry list SHALL display the associated task title and project name
3. THE task filter dropdown SHALL show all tasks with their project names
4. WHEN a task is deleted, THE **Integral** application SHALL retain associated time entries
5. THE time entry SHALL store task_id as a foreign key reference
6. THE **Integral** application SHALL fetch task details when loading time entries
7. THE timer start form SHALL display tasks grouped by project
8. THE timer start form SHALL show only active (non-completed) tasks by default
