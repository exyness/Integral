# Requirements Document

## Introduction

This document specifies the requirements for implementing a comprehensive task management system for Integral. The system provides task creation and organization, project-based grouping, multiple view modes (list, Kanban, calendar, projects), filtering and search capabilities, bulk operations, time tracking integration, and a unique "zombie task" resurrection feature for overdue items. The design prioritizes performance with virtualized lists, optimistic updates for instant feedback, and seamless integration with the existing application architecture.

## Glossary

- **Task**: A work item with title, description, priority, due date, assignee, project, labels, status, and completion tracking
- **Project**: A named collection of related tasks used for organization and filtering
- **Priority**: Task importance level (low, medium, high) with visual color coding
- **Status**: Task workflow state (todo, in_progress, review, completed, blocked)
- **Kanban Board**: Visual workflow board with columns for each status, supporting drag-and-drop
- **Zombie Task**: Task that is overdue by 7 or more days and incomplete
- **Resurrection**: Process of breaking a zombie task into smaller subtasks
- **Bulk Operation**: Action performed on multiple selected tasks simultaneously
- **Optimistic Update**: UI update that occurs immediately before server confirmation
- **Virtualization**: Rendering technique that only displays visible items for performance
- **Task List View**: Default view showing all tasks in a scrollable list with filters
- **Calendar View**: Monthly calendar displaying tasks on their due dates
- **Projects View**: Grid of projects showing task counts and completion rates
- **TanStack Query**: React library for server state management with caching
- **Integral**: The productivity suite application

## Requirements

### Requirement 1

**User Story:** As a user, I want to create tasks quickly with essential information, so that I can capture todos without friction and start organizing my work immediately.

#### Acceptance Criteria

1. WHEN a user clicks the "New Task" button, THE **Integral** application SHALL display a task creation modal
2. WHEN a user submits the task creation form, THE **Task** title field SHALL be required and non-empty
3. THE **Task** creation form SHALL provide optional fields for description, priority (low/medium/high), due date, assignee, project, and labels
4. WHEN a user types in the project field, THE **Integral** application SHALL suggest existing **Project** names and allow creating new projects
5. WHEN a user adds labels, THE **Integral** application SHALL store them as an array of strings
6. WHEN task creation succeeds, THE **Integral** application SHALL display a success toast notification and close the modal
7. WHEN task creation fails, THE **Integral** application SHALL display an error message and keep the modal open with entered data
8. WHEN a task is created, THE **Integral** application SHALL add it to the task list immediately using **Optimistic Update**

### Requirement 2

**User Story:** As a user, I want to view all my tasks in a list with filtering and sorting options, so that I can find specific tasks quickly and focus on what matters.

#### Acceptance Criteria

1. THE **Task List View** SHALL display all tasks in a virtualized scrollable list
2. THE **Task List View** SHALL show task title, **Priority** badge, due date, **Project** badge, and labels for each task
3. THE **Task List View** SHALL provide a search input that filters tasks by title, description, and labels
4. THE **Task List View** SHALL provide a status filter with options: all, pending, completed
5. THE **Task List View** SHALL provide a project filter dropdown showing all available **Project** names
6. THE **Task List View** SHALL provide a sort dropdown with options: created date, due date, priority
7. WHEN multiple filters are applied, THE **Integral** application SHALL combine them with AND logic
8. WHEN the task list exceeds 100 items, THE **Integral** application SHALL use **Virtualization** to maintain smooth scrolling

### Requirement 3

**User Story:** As a user, I want to view and edit task details in a modal, so that I can manage all task properties and track completion without leaving my current view.

#### Acceptance Criteria

1. WHEN a user clicks a task in any view, THE **Integral** application SHALL display a task detail modal
2. THE task detail modal SHALL allow inline editing of all **Task** properties
3. THE task detail modal SHALL provide a toggle to mark the task as complete or incomplete
4. WHEN a task is marked complete, THE **Integral** application SHALL record the completion date
5. WHEN a task is marked incomplete, THE **Integral** application SHALL clear the completion date
6. THE task detail modal SHALL display time tracking entries if any exist
7. THE task detail modal SHALL provide a delete button that shows a confirmation modal
8. WHEN task updates are saved, THE **Integral** application SHALL use **Optimistic Update** to reflect changes immediately

### Requirement 4

**User Story:** As a user, I want to organize tasks by projects, so that I can manage different areas of my life separately and track progress per project.

#### Acceptance Criteria

1. THE **Projects View** SHALL display all projects in a grid layout
2. THE **Projects View** SHALL show task count, completed count, and completion rate percentage for each **Project**
3. THE **Projects View** SHALL include an "Unassigned" project for tasks without a project
4. WHEN a user clicks a project, THE **Integral** application SHALL display project details with filtered tasks
5. THE project details view SHALL show all tasks belonging to that **Project**
6. THE project details view SHALL provide a back button to return to the projects grid
7. THE **Integral** application SHALL calculate completion rate as (completed tasks / total tasks) × 100
8. THE **Integral** application SHALL sort projects by task count descending, then alphabetically

### Requirement 5

**User Story:** As a user, I want to visualize my workflow in a Kanban board, so that I can see task progress and move tasks through different stages with drag-and-drop.

#### Acceptance Criteria

1. THE **Kanban Board** SHALL display five columns: todo, in_progress, review, completed, blocked
2. THE **Kanban Board** SHALL show a project selector when no project is selected
3. WHEN a user selects a project, THE **Kanban Board** SHALL display only tasks from that **Project**
4. WHEN a user drags a task to a different column, THE **Integral** application SHALL update the task **Status** to match the column
5. WHEN a user drags a task within a column, THE **Integral** application SHALL update the kanban_position field
6. THE **Kanban Board** SHALL provide a "New Task" button in each column that pre-fills the status
7. THE **Kanban Board** SHALL display **Priority** indicators and due dates on task cards
8. THE **Kanban Board** SHALL provide a back button to return to the project selector

### Requirement 6

**User Story:** As a user, I want to view tasks in a monthly calendar, so that I can plan my schedule visually and see what's due on specific dates.

#### Acceptance Criteria

1. THE **Calendar View** SHALL display a monthly calendar with tasks on their due dates
2. THE **Calendar View** SHALL color-code tasks by **Project**
3. WHEN a user clicks a date, THE **Integral** application SHALL display a modal with all tasks due on that date
4. THE **Calendar View** SHALL provide navigation buttons to move between months
5. THE **Calendar View** SHALL highlight the current date
6. THE **Calendar View** SHALL display visual indicators for overdue tasks
7. THE day tasks modal SHALL allow marking tasks as complete or incomplete
8. THE day tasks modal SHALL allow clicking tasks to open the full task detail modal

### Requirement 7

**User Story:** As a user, I want to see statistics about my tasks, so that I can understand my productivity and track my progress over time.

#### Acceptance Criteria

1. THE **Task List View** SHALL display a statistics section with glass card styling
2. THE statistics section SHALL show total task count
3. THE statistics section SHALL show active (incomplete) task count
4. THE statistics section SHALL show completed task count
5. THE statistics section SHALL show completion rate as a percentage
6. THE statistics section SHALL show high priority task count
7. THE **Integral** application SHALL calculate statistics in real-time as tasks change
8. THE statistics section SHALL use theme-aware colors (teal for Halloween mode)

### Requirement 8

**User Story:** As a user, I want to identify and resurrect overdue tasks, so that I can address neglected work by breaking it into manageable subtasks.

#### Acceptance Criteria

1. THE **Integral** application SHALL identify **Zombie Task** items as tasks that are incomplete and overdue by 7 or more days
2. THE **Integral** application SHALL display a "Resurrect" button in the header showing the count of **Zombie Task** items
3. WHEN **Zombie Task** items exist, THE "Resurrect" button SHALL animate with a pulse effect
4. WHEN a user clicks the "Resurrect" button, THE **Integral** application SHALL display a zombie tasks modal
5. THE zombie tasks modal SHALL list all **Zombie Task** items with their titles and days overdue
6. THE zombie tasks modal SHALL provide a "Resurrect" action that prompts for subtask names
7. WHEN a user resurrects a task, THE **Integral** application SHALL create new tasks with the subtask titles, inheriting the parent's project, priority, and assignee
8. THE zombie tasks modal SHALL provide a delete action to remove **Zombie Task** items

### Requirement 9

**User Story:** As a user, I want to perform actions on multiple tasks at once, so that I can efficiently manage large numbers of tasks without repetitive clicking.

#### Acceptance Criteria

1. THE **Task List View** SHALL provide checkboxes for selecting multiple tasks
2. WHEN tasks are selected, THE **Integral** application SHALL display a bulk operations bar
3. THE bulk operations bar SHALL show the count of selected tasks
4. THE bulk operations bar SHALL provide a "Select All" button to select all filtered tasks
5. THE bulk operations bar SHALL provide a "Deselect All" button to clear selection
6. THE bulk operations bar SHALL provide a "Mark Complete" button to complete all selected tasks
7. THE bulk operations bar SHALL provide a "Mark Incomplete" button to mark all selected tasks as incomplete
8. THE bulk operations bar SHALL provide a "Delete Selected" button that shows a confirmation modal
9. WHEN **Bulk Operation** actions complete, THE **Integral** application SHALL clear the selection and show a success toast

### Requirement 10

**User Story:** As a user, I want the task interface to support Halloween theme mode, so that I can enjoy seasonal decorations while managing my tasks.

#### Acceptance Criteria

1. WHEN Halloween mode is enabled, THE **Integral** application SHALL display teal accent color (#60c9b6) instead of default colors
2. WHEN Halloween mode is enabled, THE task page header SHALL display animated decorations (cat, candles, spider, ghost)
3. WHEN Halloween mode is enabled, THE header SHALL show a pumpkin background image with low opacity
4. WHEN Halloween mode is enabled, THE "Resurrect" button SHALL display a skull icon instead of the default icon
5. WHEN Halloween mode is enabled, THE tab indicator SHALL glow with teal shadow effects
6. THE **Integral** application SHALL apply Halloween styling consistently across all task views
7. THE **Integral** application SHALL animate decorations (floating, pulsing, rotating) for visual interest
8. WHEN Halloween mode is disabled, THE **Integral** application SHALL revert to standard theme colors

### Requirement 11

**User Story:** As a developer, I want centralized task state management with optimistic updates, so that the UI feels instant and data stays synchronized with the database.

#### Acceptance Criteria

1. THE **Integral** application SHALL use **TanStack Query** with query key ["tasks", userId] for all task data
2. WHEN a task is created, THE **Integral** application SHALL add it to the local cache immediately before server confirmation
3. WHEN a task is updated, THE **Integral** application SHALL update the local cache immediately before server confirmation
4. WHEN a task is deleted, THE **Integral** application SHALL remove it from the local cache immediately before server confirmation
5. WHEN a server operation fails, THE **Integral** application SHALL rollback the **Optimistic Update** and display an error toast
6. THE **Integral** application SHALL configure query staleTime to 5 minutes and gcTime to 10 minutes
7. THE **Integral** application SHALL fetch tasks ordered by created_at descending
8. THE **Integral** application SHALL validate priority values as low, medium, or high, defaulting to medium if invalid

### Requirement 12

**User Story:** As a user, I want smooth navigation between different task views, so that I can switch perspectives without losing context or experiencing jarring transitions.

#### Acceptance Criteria

1. THE **Integral** application SHALL provide four tab options: Tasks, Kanban, Projects, Calendar
2. THE **Integral** application SHALL display an animated indicator that slides to the active tab
3. WHEN Halloween mode is enabled, THE tab indicator SHALL glow with animated teal shadows
4. WHEN a user switches tabs, THE **Integral** application SHALL update the URL with a tab query parameter
5. WHEN a user navigates to a project or Kanban board, THE **Integral** application SHALL update the URL with a project query parameter
6. WHEN a user loads the page with URL parameters, THE **Integral** application SHALL restore the selected tab and project
7. THE **Integral** application SHALL use smooth spring animations for tab transitions
8. THE **Integral** application SHALL display appropriate loading skeletons while switching views
