# Requirements Document

## Introduction

This document specifies the requirements for implementing a comprehensive daily journaling system for Integral. The system provides journal entry creation with rich text support, mood and energy tracking, activity tags, project association, calendar visualization, and project management. The design prioritizes personal reflection, pattern recognition through mood/energy tracking, and seamless integration with the existing application architecture.

## Glossary

- **Journal Entry**: A daily reflection with title, content, date, optional mood, energy level, tags, and project association
- **Mood**: A 1-5 scale rating representing emotional state (1=Very Bad, 5=Great)
- **Energy Level**: A 1-5 scale rating representing physical/mental energy (1=Exhausted, 5=Highly Energized)
- **Project**: A collection or category for organizing related journal entries (shared with task management)
- **Tags**: Keywords or labels attached to entries for categorization and filtering
- **Entry Date**: The date the journal entry is about (not necessarily when it was created)
- **Calendar View**: Monthly calendar displaying entries with visual indicators
- **Optimistic Update**: UI update that occurs immediately before server confirmation
- **Integral**: The productivity suite application

## Requirements

### Requirement 1

**User Story:** As a user, I want to create daily journal entries with rich content, so that I can reflect on my day and track my thoughts.

#### Acceptance Criteria

1. WHEN a user clicks "New Entry", THE **Integral** application SHALL display a journal entry creation modal
2. THE entry creation modal SHALL require title and content fields
3. THE entry creation modal SHALL provide an entry date picker with default value of today
4. THE entry creation modal SHALL provide a mood selector (1-5 scale with emoji indicators)
5. THE entry creation modal SHALL provide an energy level selector (1-5 scale with visual indicators)
6. THE entry creation modal SHALL provide a tags input field accepting comma-separated values
7. THE entry creation modal SHALL provide an optional project selector dropdown
8. THE entry creation modal SHALL validate that title is non-empty
9. WHEN a user submits the form, THE **Integral** application SHALL create the **Journal Entry** with all provided fields
10. WHEN entry creation succeeds, THE **Integral** application SHALL display a success toast notification

### Requirement 2

**User Story:** As a user, I want to view all my journal entries in a list, so that I can browse my past reflections.

#### Acceptance Criteria

1. THE **Integral** application SHALL display all journal entries in a list format ordered by entry date descending
2. THE entry list SHALL display entry title, entry date, mood emoji, energy indicator, content preview, tags, and project badge for each entry
3. THE entry list SHALL truncate content preview to 2 lines
4. THE entry list SHALL display maximum 3 tags per entry card
5. THE entry list SHALL use virtualized scrolling for performance with 100+ entries
6. WHEN a user clicks an entry card, THE **Integral** application SHALL display the entry detail modal
7. THE **Integral** application SHALL display an empty state when no entries exist
8. THE empty state SHALL include an encouraging message and call-to-action

### Requirement 3

**User Story:** As a user, I want to view and edit entry details, so that I can review and update my reflections.

#### Acceptance Criteria

1. WHEN a user clicks an entry, THE **Integral** application SHALL display the entry detail modal
2. THE entry detail modal SHALL display all entry fields: title, content, entry date, mood, energy level, tags, project
3. THE entry detail modal SHALL render content in formatted text
4. THE entry detail modal SHALL provide an "Edit" button to enable inline editing
5. WHEN a user edits fields, THE **Integral** application SHALL update the entry immediately
6. THE entry detail modal SHALL provide a "Delete" button
7. WHEN a user clicks delete, THE **Integral** application SHALL show a confirmation modal
8. WHEN deletion is confirmed, THE **Integral** application SHALL remove the entry and display a success toast

### Requirement 4

**User Story:** As a user, I want to view my entries in a calendar format, so that I can see my journaling consistency and patterns over time.

#### Acceptance Criteria

1. THE **Integral** application SHALL provide a Calendar tab displaying a monthly calendar view
2. THE calendar SHALL display visual indicators on dates with journal entries
3. THE calendar SHALL show mood emoji on dates with entries
4. THE calendar SHALL display entry count for dates with multiple entries
5. WHEN a user clicks a date, THE **Integral** application SHALL display all entries for that date in a modal
6. THE calendar SHALL provide navigation buttons for previous and next month
7. THE calendar SHALL highlight the current date with distinct styling
8. THE day entries modal SHALL allow viewing, editing, and deleting entries

### Requirement 5

**User Story:** As a user, I want to organize entries by projects, so that I can track progress on specific goals or areas of my life.

#### Acceptance Criteria

1. THE **Integral** application SHALL provide a Projects tab displaying all projects in a grid layout
2. THE project grid SHALL display project name, description preview, entry count, and color for each project
3. WHEN a user clicks a project, THE **Integral** application SHALL display the project details modal
4. THE project details modal SHALL display all entries associated with that project
5. THE project details modal SHALL provide "Add Entry" button that pre-selects the project
6. THE project details modal SHALL provide "Edit", "Archive", and "Delete" buttons
7. THE **Integral** application SHALL allow creating new projects with name, description, and color
8. WHEN a project is deleted, THE **Integral** application SHALL not delete associated entries (entries become unassociated)

### Requirement 6

**User Story:** As a user, I want to filter and search my entries, so that I can find specific reflections quickly.

#### Acceptance Criteria

1. THE Entries tab SHALL provide filter buttons: All, Today, This Week, This Month
2. THE Entries tab SHALL provide a project filter dropdown
3. THE Entries tab SHALL provide a search input that filters by title, content, tags, and project name
4. THE Entries tab SHALL provide sort options: Newest, Oldest, Title, Mood, Energy
5. THE **Integral** application SHALL combine filters with AND logic
6. THE **Integral** application SHALL debounce search input by 300ms
7. THE **Integral** application SHALL display "No results" message when no entries match filters
8. THE search SHALL be case-insensitive

### Requirement 7

**User Story:** As a user, I want to track my mood and energy levels, so that I can identify patterns in my well-being over time.

#### Acceptance Criteria

1. THE mood selector SHALL provide 5 options with emoji indicators: 😢 (Very Bad), 😕 (Bad), 😐 (Okay), 🙂 (Good), 😄 (Great)
2. THE mood selector SHALL apply color coding: red (1-2), purple (3), green (4-5)
3. THE energy level selector SHALL provide 5 options with labels: Exhausted, Tired, Moderate, Energized, Highly Energized
4. THE energy level selector SHALL apply color coding: red (1-2), purple (3), green (4-5)
5. THE mood and energy fields SHALL be optional
6. THE **Integral** application SHALL validate mood values are between 1 and 5
7. THE **Integral** application SHALL validate energy level values are between 1 and 5
8. THE entry cards SHALL display mood emoji and energy indicator when present

### Requirement 8

**User Story:** As a user, I want to add tags to my entries, so that I can categorize and find related entries easily.

#### Acceptance Criteria

1. THE entry creation modal SHALL provide a tags input field
2. THE tags input SHALL accept comma-separated values
3. THE tags input SHALL convert input to an array of strings on submit
4. THE entry cards SHALL display tags as small badges
5. THE entry cards SHALL display maximum 3 tags with "..." indicator if more exist
6. THE search filter SHALL match entries by tag content
7. THE tags SHALL be stored as TEXT[] array in database

### Requirement 9

**User Story:** As a user, I want the journal interface to support Halloween theme mode, so that I can enjoy seasonal decorations while journaling.

#### Acceptance Criteria

1. WHEN Halloween mode is enabled, THE **Integral** application SHALL display teal accent color (#60c9b6) instead of default purple
2. WHEN Halloween mode is enabled, THE journal page header SHALL display animated decorations (bat, pumpkin, spider, web, ghost, witch)
3. WHEN Halloween mode is enabled, THE tab indicator SHALL glow with teal shadow effects
4. WHEN Halloween mode is enabled, THE empty states SHALL display Halloween-themed illustrations
5. THE **Integral** application SHALL apply Halloween styling consistently across all journal views
6. WHEN Halloween mode is disabled, THE **Integral** application SHALL revert to standard theme colors

### Requirement 10

**User Story:** As a developer, I want centralized journal state management with optimistic updates, so that the UI feels instant and data stays synchronized with the database.

#### Acceptance Criteria

1. THE **Integral** application SHALL use TanStack Query with query keys ["journal-entries", userId] and ["projects", userId]
2. WHEN an entry is created, THE **Integral** application SHALL add it to the local cache immediately before server confirmation
3. WHEN an entry is updated, THE **Integral** application SHALL update it in the local cache immediately before server confirmation
4. WHEN an entry is deleted, THE **Integral** application SHALL remove it from the local cache immediately before server confirmation
5. WHEN a server operation fails, THE **Integral** application SHALL rollback the **Optimistic Update** and display an error toast
6. THE **Integral** application SHALL configure query staleTime to 5 minutes and gcTime to 10 minutes
7. THE **Integral** application SHALL fetch entries ordered by entry_date descending, then created_at descending
8. THE **Integral** application SHALL include project data in entry queries using join

### Requirement 11

**User Story:** As a user, I want smooth navigation with URL state synchronization, so that I can bookmark specific views and use browser navigation.

#### Acceptance Criteria

1. WHEN a user switches tabs, THE **Integral** application SHALL update the URL with a tab query parameter
2. WHEN a user views a project detail, THE **Integral** application SHALL update the URL with a project parameter
3. WHEN a user loads the page with URL parameters, THE **Integral** application SHALL restore the selected tab and project
4. WHEN a user uses browser back/forward buttons, THE **Integral** application SHALL navigate between tab and project states
5. THE **Integral** application SHALL use replace mode for URL updates to avoid cluttering browser history
